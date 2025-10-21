<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const problem = ref(null);
const loading = ref(true);
const error = ref("");

// Fetch problem data based on route params
onMounted(async () => {
  await loadProblem();
});

async function loadProblem() {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch("/template-problems.json");
    if (!response.ok) {
      throw new Error("Failed to load problems");
    }
    const problems = await response.json();

    // Find the problem matching the route params
    const foundProblem = problems.find(
      (p) => p.id === route.params.problemId && p.board === route.params.board
    );

    if (!foundProblem) {
      error.value = "Problem not found";
    } else {
      problem.value = foundProblem;
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push({ name: "Home" });
}

// Board images mapping
const boardImageMap = {
  kilter: {
    feet: "/board/12x12-kilter-feet.png",
    holds: "/board/12x12-kilter-holds.png",
  },
  tension: {
    feet: "/board/12x12-tb2-wood.png",
    holds: "/board/12x12-tb2-plastic.png",
  },
};

// Map board values to display names
const boardDisplayNames = {
  kilter: "Kilter Board",
  tension: "Tension Board",
};

const boardImages = computed(() => {
  if (!problem.value) return null;
  return boardImageMap[problem.value.board];
});

const boardDisplayName = computed(() => {
  if (!problem.value) return "";
  return boardDisplayNames[problem.value.board] || problem.value.board;
});

// Mock data for beta videos (in real app, this would come from API)
const betaVideos = ref([
  { id: 1, thumbnail: "", title: "Beta 1" },
  { id: 2, thumbnail: "", title: "Beta 2" },
  { id: 3, thumbnail: "", title: "Beta 3" },
  { id: 4, thumbnail: "", title: "Beta 4" },
]);
</script>

<template>
  <div class="climb-view-page">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading climb...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="goBack" class="back-btn">Go Back</button>
    </div>

    <!-- Climb content -->
    <div v-else-if="problem" class="climb-view-container">
      <button class="back-btn-floating" @click="goBack">
        <span class="back-arrow">←</span>
      </button>

      <div class="climb-view-content">
        <!-- Left side: Large board visualization -->
        <div class="board-section">
          <div class="board-visualization-large" v-if="boardImages">
            <img
              :src="boardImages.feet"
              alt="Board feet"
              class="board-layer"
              draggable="false"
            />
            <img
              :src="boardImages.holds"
              alt="Board holds"
              class="board-layer"
              draggable="false"
            />
          </div>
        </div>

        <!-- Right side: Metadata and additional info -->
        <div class="info-section">
          <!-- Metadata Section -->
          <div class="metadata-section">
            <h1 class="climb-title">{{ problem.name }}</h1>
            <div class="climb-subtitle">
              {{ boardDisplayName }} • {{ problem.grade }}
            </div>

            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="metadata-label">Board Type</span>
                <span class="metadata-value">{{ boardDisplayName }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Grade</span>
                <span class="metadata-value">{{ problem.grade }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Setter</span>
                <span class="metadata-value">{{ problem.setter }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Angle</span>
                <span class="metadata-value">50°</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Layout</span>
                <span class="metadata-value">12x12</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Holds</span>
                <span class="metadata-value">{{
                  problem.holds.join(", ")
                }}</span>
              </div>
            </div>
          </div>

          <!-- Beta Videos Section -->
          <div class="section-container">
            <div class="section-header">
              <span class="section-title">Beta Videos</span>
            </div>
            <div class="videos-grid">
              <div
                v-for="video in betaVideos"
                :key="video.id"
                class="video-thumbnail"
              >
                <div class="video-placeholder"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.climb-view-page {
  min-height: 100vh;
  background: #1a1a1a;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
  color: #e0e0e0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.climb-view-container {
  background: #1a1a1a;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.climb-view-content {
  display: flex;
  height: 100vh;
}

.back-btn-floating {
  position: fixed;
  top: 1rem;
  left: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  color: #e0e0e0;
  border: 1px solid #444;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.back-btn-floating:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.05);
}

.back-arrow {
  display: block;
  line-height: 1;
}

.back-btn {
  background: #333;
  color: #e0e0e0;
  border: 1px solid #444;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #444;
}

/* Left side - Board visualization */
.board-section {
  flex: 0 0 55%;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border-right: 1px solid #333;
  height: 100vh;
}

.board-visualization-large {
  position: relative;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 1;
}

.board-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-select: none;
  pointer-events: none;
}

/* Right side - Info sections */
.info-section {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100vh;
}

/* Metadata Section */
.metadata-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.climb-title {
  font-size: 2rem;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0;
}

.climb-subtitle {
  font-size: 1.1rem;
  color: #a0a0a0;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.metadata-value {
  font-size: 1rem;
  color: #e0e0e0;
}

/* Section containers */
.section-container {
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
  background: #242424;
}

.section-header {
  width: 100%;
  background: transparent;
  border: none;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e0e0e0;
}

/* Beta Videos Grid */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  background: #1a1a1a;
}

.video-thumbnail {
  aspect-ratio: 16 / 9;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #333;
}

.video-thumbnail:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.video-placeholder {
  width: 100%;
  height: 100%;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

/* Responsive design */
@media (max-width: 1024px) {
  .climb-view-content {
    flex-direction: column;
  }

  .board-section {
    flex: 0 0 50%;
    border-right: none;
    border-bottom: 1px solid #333;
  }

  .metadata-grid {
    grid-template-columns: 1fr;
  }
}

/* Custom scrollbar */
.info-section::-webkit-scrollbar {
  width: 8px;
}

.info-section::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.info-section::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.info-section::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
