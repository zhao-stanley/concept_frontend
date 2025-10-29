<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import InteractiveBoard from "../components/InteractiveBoard.vue";

const router = useRouter();

// Form state
const problemData = ref({
  name: "",
  grade: "",
  boardType: "",
  angle: 40,
  setterName: "",
  holds: [], // Array of coordinate objects
  feet: [], // Array of coordinate objects
});

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

const boardTypes = ["12x12", "10x12"];

const boardDisplayNames = {
  "12x12": "Kilter Board 12x12",
  "10x12": "Kilter Board 10x12",
};

// Computed
const holdsCoordinates = computed(() =>
  problemData.value.holds.filter((c) => c.type === "hold")
);

const feetCoordinates = computed(() =>
  problemData.value.feet.filter((c) => c.type === "feet")
);

const allSelectedCoordinates = computed(() => [
  ...problemData.value.holds,
  ...problemData.value.feet,
]);

const canSubmit = computed(() => {
  return (
    problemData.value.name.trim() !== "" &&
    problemData.value.grade !== "" &&
    problemData.value.boardType !== "" &&
    problemData.value.angle >= 0 &&
    problemData.value.angle <= 70 &&
    problemData.value.setterName.trim() !== "" &&
    problemData.value.holds.length > 0
  );
});

// Clear holds and feet when board type changes
watch(
  () => problemData.value.boardType,
  () => {
    problemData.value.holds = [];
    problemData.value.feet = [];
  }
);

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

// Methods
function handleCoordinateSelected(coord) {
  if (coord.type === "hold") {
    problemData.value.holds.push(coord);
  } else {
    problemData.value.feet.push(coord);
  }
}

function handleCoordinateDeselected(coord) {
  if (coord.type === "hold") {
    const index = problemData.value.holds.findIndex((c) => c.id === coord.id);
    if (index > -1) {
      problemData.value.holds.splice(index, 1);
    }
  } else {
    const index = problemData.value.feet.findIndex((c) => c.id === coord.id);
    if (index > -1) {
      problemData.value.feet.splice(index, 1);
    }
  }
}

function clearHolds() {
  problemData.value.holds = [];
}

function clearFeet() {
  problemData.value.feet = [];
}

function clearAll() {
  problemData.value.holds = [];
  problemData.value.feet = [];
}

function handleSubmit() {
  // Format holds and feet as coordinate strings
  const holds = problemData.value.holds.map((c) => `${c.col},${c.row}`);
  const feet = problemData.value.feet.map((c) => `${c.col},${c.row}`);

  // Build query matching API specification
  const query = {
    name: problemData.value.name.trim(),
    grade: problemData.value.grade.toLowerCase(), // Convert to "vN" format
    holds: holds,
    feet: feet,
    boardType: problemData.value.boardType,
    angle: problemData.value.angle,
    setterName: problemData.value.setterName.trim(),
  };

  // For now, just log the query (will call API later)
  console.log("API Query for createProblem():", query);

  // Show success message or redirect
  alert(
    `Problem "${query.name}" created successfully!\nCheck console for details.`
  );
}

function goBack() {
  router.push({ name: "Home" });
}
</script>

<template>
  <div class="create-problem-page">
    <div class="create-problem-container">
      <div class="header">
        <button class="back-btn" @click="goBack">
          <span class="back-arrow">←</span>
          Back
        </button>
        <h1 class="page-title">Create New Problem</h1>
      </div>

      <div class="content">
        <!-- Left Side: Form -->
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">Problem Name *</label>
            <input
              v-model="problemData.name"
              type="text"
              placeholder="Enter problem name"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Grade *</label>
            <select v-model="problemData.grade" class="form-select">
              <option value="">Select grade</option>
              <option v-for="grade in gradeValues" :key="grade" :value="grade">
                {{ grade }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Board Type *</label>
            <select v-model="problemData.boardType" class="form-select">
              <option value="">Select board type</option>
              <option v-for="type in boardTypes" :key="type" :value="type">
                {{ boardDisplayNames[type] }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Board Angle (0-70°) *</label>
            <input
              v-model.number="problemData.angle"
              type="number"
              min="0"
              max="70"
              step="1"
              placeholder="Enter angle"
              class="form-input"
              @keydown="preventNonNumericInput"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Setter Name *</label>
            <input
              v-model="problemData.setterName"
              type="text"
              placeholder="Enter your name"
              class="form-input"
            />
          </div>

          <div class="stats-section">
            <div class="stat-item">
              <span class="stat-label">Holds:</span>
              <span class="stat-value holds">{{
                holdsCoordinates.length
              }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Feet:</span>
              <span class="stat-value feet">{{ feetCoordinates.length }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <button
              @click="handleSubmit"
              class="btn-primary"
              :disabled="!canSubmit"
            >
              Create Problem
            </button>
            <button
              @click="clearAll"
              class="btn-secondary"
              :disabled="allSelectedCoordinates.length === 0"
            >
              Clear All Holds
            </button>
          </div>
        </div>

        <!-- Right Side: Interactive Board -->
        <div class="board-section">
          <div class="board-header">
            <h2 class="board-title">Select Holds & Feet</h2>
            <p class="board-info">
              Click on the board to select holds (blue) and feet (orange)
            </p>
          </div>

          <div v-if="problemData.boardType" class="interactive-board-wrapper">
            <InteractiveBoard
              :size="problemData.boardType"
              :selected-coordinates="allSelectedCoordinates"
              @coordinate-selected="handleCoordinateSelected"
              @coordinate-deselected="handleCoordinateDeselected"
            />
          </div>

          <div v-else class="board-placeholder">
            <p>Please select a board type to begin</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-problem-page {
  min-height: 100vh;
  background: #1a1a1a;
  padding: 2rem;
}

.create-problem-container {
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #242424;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #2a2a2a;
  border-color: #42b983;
  color: #42b983;
}

.back-arrow {
  font-size: 1.2rem;
}

.page-title {
  font-size: 2rem;
  color: #e0e0e0;
  margin: 0;
}

.content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
}

.form-section {
  background: #242424;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: fit-content;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  color: #a0a0a0;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-input,
.form-select {
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #42b983;
}

.form-input::placeholder {
  color: #666;
}

.stats-section {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: #888;
  font-size: 0.85rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.stat-value.holds {
  color: rgb(0, 191, 255);
}

.stat-value.feet {
  color: rgb(255, 140, 0);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b983;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #35a372;
}

.btn-primary:disabled {
  background: #2a4a3a;
  color: #666;
  cursor: not-allowed;
}

.btn-secondary {
  background: #333;
  color: #e0e0e0;
}

.btn-secondary:hover:not(:disabled) {
  background: #444;
}

.btn-secondary:disabled {
  background: #242424;
  color: #555;
  cursor: not-allowed;
}

.board-section {
  background: #242424;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.board-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.board-title {
  font-size: 1.3rem;
  color: #e0e0e0;
  margin: 0;
}

.board-info {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
}

.interactive-board-wrapper {
  flex: 1;
}

.board-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #1a1a1a;
  border: 2px dashed #333;
  border-radius: 8px;
  color: #666;
  font-size: 1.1rem;
}

@media (max-width: 1200px) {
  .content {
    grid-template-columns: 1fr;
  }
}
</style>
