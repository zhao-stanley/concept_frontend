<script setup>
import { ref, computed, defineEmits, onMounted, onUnmounted, watch } from "vue";
import InteractiveBoard from "./InteractiveBoard.vue";

const emit = defineEmits(["search", "update:collapsed"]);

const activeTab = ref("search");
const isCollapsed = ref(true);
const panelRef = ref(null);
const showAdvancedFilters = ref(false);

// Search filters
const filters = ref({
  size: "",
  gradeMin: "",
  gradeMax: "",
  angle: null,
  setter: "",
  coordinates: [], // Array of {x, y, id} objects
});

// Track last applied filters
const appliedFilters = ref({
  size: "",
  gradeMin: "",
  gradeMax: "",
  angle: null,
  setter: "",
  coordinates: [],
});

// Check if current filters differ from applied filters
const hasFilterChanges = computed(() => {
  return (
    filters.value.size !== appliedFilters.value.size ||
    filters.value.gradeMin !== appliedFilters.value.gradeMin ||
    filters.value.gradeMax !== appliedFilters.value.gradeMax ||
    filters.value.angle !== appliedFilters.value.angle ||
    filters.value.setter !== appliedFilters.value.setter ||
    JSON.stringify(filters.value.coordinates) !==
      JSON.stringify(appliedFilters.value.coordinates)
  );
});

// Check if any filters are currently set
const hasActiveFilters = computed(() => {
  return (
    filters.value.size !== "" ||
    filters.value.gradeMin !== "" ||
    filters.value.gradeMax !== "" ||
    filters.value.angle !== null ||
    filters.value.setter !== "" ||
    filters.value.coordinates.length > 0
  );
});

// Check if angle is valid
const isAngleValid = computed(() => {
  if (filters.value.angle === null) return true; // No angle is valid
  return filters.value.angle >= 0 && filters.value.angle <= 70;
});

// Prevent non-numeric input for angle
function preventNonNumericInput(event) {
  // Allow: backspace, delete, tab, escape, enter
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
  ];

  if (allowedKeys.includes(event.key)) {
    return; // Allow these keys
  }

  // Allow Ctrl/Cmd + A, C, V, X (select all, copy, paste, cut)
  if (
    (event.ctrlKey || event.metaKey) &&
    ["a", "c", "v", "x"].includes(event.key.toLowerCase())
  ) {
    return;
  }

  // Prevent if not a number (0-9)
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}

const gradeValues = [
  "V0",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V8",
  "V9",
  "V10",
  "V11",
  "V12",
  "V13",
  "V14",
  "V15",
  "V16",
  "V17",
];
const sizeValues = ["12x12", "10x12"];

// Map size values to display names
const sizeDisplayNames = {
  "12x12": "Kilter Board 12x12",
  "10x12": "Kilter Board 10x12",
};

// Clear coordinates when board size changes
watch(
  () => filters.value.size,
  () => {
    filters.value.coordinates = [];
  }
);

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  emit("update:collapsed", isCollapsed.value);
}

function handleClickOutside(event) {
  if (
    panelRef.value &&
    !panelRef.value.contains(event.target) &&
    !isCollapsed.value
  ) {
    isCollapsed.value = true;
    emit("update:collapsed", isCollapsed.value);
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

function handleSearch() {
  // Save the current filters as applied
  appliedFilters.value = { ...filters.value };
  emit("search", { ...filters.value });
}

function clearFilters() {
  filters.value.size = "";
  filters.value.gradeMin = "";
  filters.value.gradeMax = "";
  filters.value.angle = null;
  filters.value.setter = "";
  filters.value.coordinates = [];
  appliedFilters.value = {
    size: "",
    gradeMin: "",
    gradeMax: "",
    angle: null,
    setter: "",
    coordinates: [],
  };
  handleSearch();
}

// Board images for Hold Search visualization
const boardImageMap = {
  "12x12": {
    feet: "/board/12x12-feet.png",
    holds: "/board/12x12-holds.png",
  },
  "10x12": {
    feet: "/board/10x12-feet.png",
    holds: "/board/10x12-holds.png",
  },
};

const boardImages = computed(() => {
  return boardImageMap[filters.value.size] || null;
});

function handleCoordinateSelected(coord) {
  filters.value.coordinates.push(coord);
}

function handleCoordinateDeselected(coord) {
  const index = filters.value.coordinates.findIndex((c) => c.id === coord.id);
  if (index > -1) {
    filters.value.coordinates.splice(index, 1);
  }
}

function clearSelectedHolds() {
  filters.value.coordinates = [];
}

function clearAdvancedFilters() {
  filters.value.gradeMin = "";
  filters.value.gradeMax = "";
  filters.value.angle = null;
  filters.value.setter = "";
}

function handleHoldSearch() {
  // Combine holds and feet coordinates (API treats them as one set)
  const holds = filters.value.coordinates.map((c) => `${c.col},${c.row}`);

  // Build query matching API specification
  const query = {
    boardType: filters.value.size,
    holds: holds,
  };

  // Add optional parameters if they exist
  if (filters.value.gradeMin) {
    query.gradeMin = filters.value.gradeMin.toLowerCase(); // Convert to "vN" format
  }
  if (filters.value.gradeMax) {
    query.gradeMax = filters.value.gradeMax.toLowerCase(); // Convert to "vN" format
  }
  if (filters.value.angle !== null) {
    query.angle = filters.value.angle;
  }
  if (filters.value.setter) {
    query.setterName = filters.value.setter;
  }

  // For now, just log the query (will call API later)
  console.log("API Query for searchProblems():", query);
}
</script>

<template>
  <div class="search-panel" :class="{ collapsed: isCollapsed }" ref="panelRef">
    <button
      v-if="isCollapsed"
      class="collapse-btn"
      @click.stop="toggleCollapse"
    >
      ◀
    </button>

    <div v-if="!isCollapsed" class="panel-content">
      <button class="close-btn" @click="toggleCollapse">✕</button>
      <div class="tabs">
        <button
          :class="['tab', { active: activeTab === 'search' }]"
          @click="activeTab = 'search'"
        >
          Search
        </button>
        <button
          :class="['tab', { active: activeTab === 'hold-search' }]"
          @click="activeTab = 'hold-search'"
        >
          Hold Search
        </button>
      </div>

      <div v-if="activeTab === 'search'" class="search-content">
        <div class="filter-section">
          <label class="filter-label">Board Size</label>
          <select v-model="filters.size" class="filter-select">
            <option value="">All Sizes</option>
            <option v-for="size in sizeValues" :key="size" :value="size">
              {{ sizeDisplayNames[size] }}
            </option>
          </select>
        </div>

        <div class="filter-section">
          <label class="filter-label">Grade Range</label>
          <div class="grade-range">
            <select v-model="filters.gradeMin" class="filter-select">
              <option value="">Min</option>
              <option v-for="grade in gradeValues" :key="grade" :value="grade">
                {{ grade }}
              </option>
            </select>
            <span class="range-separator">to</span>
            <select v-model="filters.gradeMax" class="filter-select">
              <option value="">Max</option>
              <option v-for="grade in gradeValues" :key="grade" :value="grade">
                {{ grade }}
              </option>
            </select>
          </div>
        </div>

        <div class="filter-section">
          <label class="filter-label">Board Angle (0-70°)</label>
          <input
            v-model.number="filters.angle"
            type="number"
            min="0"
            max="70"
            step="1"
            placeholder="Enter angle"
            class="filter-input"
            @keydown="preventNonNumericInput"
          />
        </div>

        <div class="filter-section">
          <label class="filter-label">Setter</label>
          <input
            v-model="filters.setter"
            type="text"
            placeholder="Enter setter name"
            class="filter-input"
          />
        </div>

        <div class="action-buttons">
          <button
            @click="handleSearch"
            class="btn-primary"
            :disabled="!hasFilterChanges || !isAngleValid"
          >
            Search Climbs
          </button>
          <button
            @click="clearFilters"
            class="btn-secondary"
            :disabled="!hasActiveFilters"
          >
            Reset
          </button>
        </div>
      </div>

      <div v-else class="hold-search-content">
        <p class="info-text">
          Click on holds or feet to select them, then search for climbs that use
          those positions.
        </p>

        <div class="board-selector">
          <label class="filter-label">Select Board Size</label>
          <select v-model="filters.size" class="filter-select">
            <option value="">Choose a board size</option>
            <option v-for="size in sizeValues" :key="size" :value="size">
              {{ sizeDisplayNames[size] }}
            </option>
          </select>
        </div>

        <!-- Advanced Filters Collapsible -->
        <div class="advanced-filters-section">
          <button
            class="advanced-filters-toggle"
            @click="showAdvancedFilters = !showAdvancedFilters"
          >
            <span class="toggle-icon">{{
              showAdvancedFilters ? "▼" : "▶"
            }}</span>
            Additional Filters
          </button>

          <div v-if="showAdvancedFilters" class="advanced-filters-content">
            <div class="filter-section">
              <label class="filter-label">Grade Range</label>
              <div class="grade-range">
                <select v-model="filters.gradeMin" class="filter-select">
                  <option value="">Min</option>
                  <option
                    v-for="grade in gradeValues"
                    :key="grade"
                    :value="grade"
                  >
                    {{ grade }}
                  </option>
                </select>
                <span class="range-separator">to</span>
                <select v-model="filters.gradeMax" class="filter-select">
                  <option value="">Max</option>
                  <option
                    v-for="grade in gradeValues"
                    :key="grade"
                    :value="grade"
                  >
                    {{ grade }}
                  </option>
                </select>
              </div>
            </div>

            <div class="filter-section">
              <label class="filter-label">Board Angle (0-70°)</label>
              <input
                v-model.number="filters.angle"
                type="number"
                min="0"
                max="70"
                step="1"
                placeholder="Enter angle"
                class="filter-input"
                @keydown="preventNonNumericInput"
              />
            </div>

            <div class="filter-section">
              <label class="filter-label">Setter</label>
              <input
                v-model="filters.setter"
                type="text"
                placeholder="Enter setter name"
                class="filter-input"
              />
            </div>

            <button
              @click="clearAdvancedFilters"
              class="btn-secondary btn-small"
              :disabled="
                !filters.gradeMin &&
                !filters.gradeMax &&
                filters.angle === null &&
                !filters.setter
              "
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div v-if="filters.size" class="interactive-board-container">
          <InteractiveBoard
            :size="filters.size"
            :selected-coordinates="filters.coordinates"
            @coordinate-selected="handleCoordinateSelected"
            @coordinate-deselected="handleCoordinateDeselected"
          />
        </div>

        <div v-if="filters.size" class="action-buttons">
          <button
            @click="handleHoldSearch"
            class="btn-primary"
            :disabled="filters.coordinates.length === 0 || !isAngleValid"
          >
            Search by Holds ({{ filters.coordinates.length }})
          </button>
          <button
            @click="clearSelectedHolds"
            class="btn-secondary"
            :disabled="filters.coordinates.length === 0"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-panel {
  background: #242424;
  height: 100%;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.5);
  position: fixed;
  right: 0;
  top: 0;
  width: 45vw;
  min-width: 500px;
  max-width: 800px;
  transition: transform 0.3s ease;
  z-index: 100;
  border-left: 1px solid #333;
}

.search-panel.collapsed {
  transform: translateX(100%);
}

@media (max-width: 1024px) {
  .search-panel {
    width: 50vw;
    min-width: 400px;
  }
}

@media (max-width: 768px) {
  .search-panel {
    width: 100vw;
    min-width: unset;
    max-width: unset;
  }
}

.collapse-btn {
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
  background: #42b983;
  color: white;
  border: none;
  width: 40px;
  height: 60px;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  z-index: 101;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s, left 0.3s ease;
}

.collapse-btn:hover {
  background: #359268;
}

.collapsed .collapse-btn {
  left: -40px;
}

.close-btn {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: transparent;
  color: #a0a0a0;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 10;
  transition: background-color 0.2s, color 0.2s;
}

.close-btn:hover {
  background: #333;
  color: #e0e0e0;
}

.panel-content {
  padding: 3.5rem 1.5rem 2rem 1.5rem;
  height: 100%;
  overflow-y: auto;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #333;
}

.tab {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  color: #a0a0a0;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab:hover {
  color: #42b983;
}

.tab.active {
  color: #42b983;
  border-bottom-color: #42b983;
  font-weight: 600;
}

.search-content,
.hold-search-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #e0e0e0;
}

.filter-select,
.filter-input {
  padding: 0.5rem;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 0.9rem;
  background: #1a1a1a;
  color: #e0e0e0;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #42b983;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: #e0e0e0;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
  accent-color: #42b983;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #42b983;
  color: #fff;
}

.btn-primary:hover {
  background: #359268;
}

.btn-primary:disabled {
  background: #555;
  color: #888;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary:disabled:hover {
  background: #555;
}

.btn-secondary {
  background: #333;
  color: #e0e0e0;
  border: 1px solid #444;
}

.btn-secondary:hover {
  background: #3a3a3a;
}

.btn-secondary:disabled {
  background: #2a2a2a;
  color: #666;
  cursor: not-allowed;
  opacity: 0.6;
  border: 1px solid #333;
}

.btn-secondary:disabled:hover {
  background: #2a2a2a;
}

.info-text {
  font-size: 0.85rem;
  color: #a0a0a0;
  line-height: 1.5;
}

.board-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.grade-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.grade-range .filter-select {
  flex: 1;
}

.range-separator {
  color: #a0a0a0;
  font-size: 0.9rem;
}

.board-preview {
  margin-top: 1rem;
}

.board-visualization {
  width: 100%;
  aspect-ratio: 1;
  background: #000;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: none;
}

.board-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  box-shadow: none;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  pointer-events: none;
}

.interactive-board-container {
  margin-top: 1rem;
}

.advanced-filters-section {
  margin-bottom: 1rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
}

.advanced-filters-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid #333;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.advanced-filters-toggle:hover {
  background: #2a2a2a;
}

.toggle-icon {
  color: #42b983;
  font-size: 0.8rem;
  transition: transform 0.2s;
}

.advanced-filters-content {
  padding: 1rem;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}
</style>
