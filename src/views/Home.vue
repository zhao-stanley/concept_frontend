<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ProblemCard from "../components/ProblemCard.vue";
import SearchPanel from "../components/SearchPanel.vue";
import { problemAPI } from "../services/api";

const router = useRouter();

function goToCreate() {
  router.push({ name: "CreateProblem" });
}

const problems = ref([]);
const loading = ref(false);
const error = ref("");

// Load problems on mount
onMounted(async () => {
  await loadRecommendedProblems();
});

// Load recommended or popular problems
async function loadRecommendedProblems() {
  loading.value = true;
  error.value = "";

  try {
    // Load all problems with no filters
    const response = await problemAPI.searchProblems({});
    problems.value = response.problems || [];
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// Handle search with filters
async function handleSearch(filters) {
  loading.value = true;
  error.value = "";

  try {
    // Build search query for backend
    const searchQuery = {};

    if (filters.size) {
      searchQuery.boardType = filters.size;
    }

    if (filters.gradeMin || filters.gradeMax) {
      if (filters.gradeMin && filters.gradeMax) {
        searchQuery.gradeMin = filters.gradeMin.toLowerCase();
        searchQuery.gradeMax = filters.gradeMax.toLowerCase();
      } else if (filters.gradeMin) {
        searchQuery.gradeMin = filters.gradeMin.toLowerCase();
      } else if (filters.gradeMax) {
        searchQuery.gradeMax = filters.gradeMax.toLowerCase();
      }
    }

    if (filters.setter) {
      searchQuery.setterName = filters.setter;
    }

    if (filters.angle !== null) {
      searchQuery.angle = filters.angle;
    }

    if (filters.coordinates && filters.coordinates.length > 0) {
      // Separate holds and feet for the search query
      const holdCoordinates = filters.coordinates.filter(
        (c) => c.type === "hold"
      );
      const feetCoordinates = filters.coordinates.filter(
        (c) => c.type === "feet"
      );

      if (holdCoordinates.length > 0) {
        // Convert coordinates to the format backend expects: ["col,row", ...]
        searchQuery.holds = holdCoordinates.map((c) => `${c.col},${c.row}`);
      }

      if (feetCoordinates.length > 0) {
        // Convert coordinates to the format backend expects: ["col,row", ...]
        searchQuery.feet = feetCoordinates.map((c) => `${c.col},${c.row}`);
      }
    }

    const response = await problemAPI.searchProblems(searchQuery);
    problems.value = response.problems || [];
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="home-view">
    <div class="main-content">
      <header class="page-header">
        <h1>Boardlord</h1>
        <button class="create-btn" @click="goToCreate">
          <span class="plus-icon">+</span>
          Create Problem
        </button>
      </header>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading problems...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p>Error: {{ error }}</p>
        <button @click="loadRecommendedProblems" class="retry-btn">
          Try Again
        </button>
      </div>

      <div v-else-if="problems.length === 0" class="empty-state">
        <p>No problems found matching your filters.</p>
        <button @click="loadRecommendedProblems" class="retry-btn">
          Show All
        </button>
      </div>

      <div v-else class="problems-grid">
        <ProblemCard
          v-for="problem in problems"
          :key="problem.id"
          :problem="problem"
        />
      </div>
    </div>

    <SearchPanel @search="handleSearch" />
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #1a1a1a;
  position: relative;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  width: 100%;
  background: #1a1a1a;
}

.page-header {
  padding: 2rem 2rem 1.5rem 2rem;
  background: #242424;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #e0e0e0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #42b983;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background: #35a372;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.4);
}

.plus-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.problems-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.loading-container,
.error-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 140px);
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-container p,
.error-container p,
.empty-state p {
  color: #a0a0a0;
  font-size: 1.1rem;
  margin: 0;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #359268;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem 1rem 1rem 1rem;
  }

  .problems-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }
}
</style>
