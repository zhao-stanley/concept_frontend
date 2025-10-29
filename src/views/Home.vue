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
    const response = await fetch("/template-problems.json");
    if (!response.ok) {
      throw new Error("Failed to load problems");
    }
    problems.value = await response.json();
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
    // Load template problems
    const response = await fetch("/template-problems.json");
    if (!response.ok) {
      throw new Error("Failed to load problems");
    }
    let allProblems = await response.json();

    // Apply filters
    if (filters.size) {
      allProblems = allProblems.filter((p) => p.size === filters.size);
    }

    if (filters.gradeMin || filters.gradeMax) {
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

      allProblems = allProblems.filter((p) => {
        const gradeIndex = gradeValues.indexOf(p.grade);
        // Skip if grade not found in our list
        if (gradeIndex === -1) return false;

        // If only min is set: show grades >= min
        if (filters.gradeMin && !filters.gradeMax) {
          const minIndex = gradeValues.indexOf(filters.gradeMin);
          return gradeIndex >= minIndex;
        }

        // If only max is set: show grades <= max
        if (!filters.gradeMin && filters.gradeMax) {
          const maxIndex = gradeValues.indexOf(filters.gradeMax);
          return gradeIndex <= maxIndex;
        }

        // If both are set: show grades in range
        if (filters.gradeMin && filters.gradeMax) {
          const minIndex = gradeValues.indexOf(filters.gradeMin);
          const maxIndex = gradeValues.indexOf(filters.gradeMax);
          return gradeIndex >= minIndex && gradeIndex <= maxIndex;
        }

        return true;
      });
    }

    if (filters.setter) {
      allProblems = allProblems.filter((p) =>
        p.setter?.toLowerCase().includes(filters.setter.toLowerCase())
      );
    }

    if (filters.angle !== null) {
      allProblems = allProblems.filter((p) => p.angle === filters.angle);
    }

    problems.value = allProblems;
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
