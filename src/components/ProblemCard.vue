<script setup>
import { defineProps, computed } from "vue";
import { useRouter } from "vue-router";
import BoardDisplay from "./BoardDisplay.vue";

const props = defineProps({
  problem: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

function handleClick() {
  // Navigate to /:size/:problemId
  router.push({
    name: "ClimbView",
    params: {
      size: props.problem.size,
      problemId: props.problem.id,
    },
  });
}

// Map board sizes to their image files
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
  return boardImageMap[props.problem.size];
});

const boardDisplayName = computed(() => {
  return `Kilter Board ${props.problem.size}`;
});
</script>

<template>
  <div class="problem-card" @click="handleClick">
    <div class="board-visualization">
      <BoardDisplay
        :size="problem.size"
        :holds="problem.holds || []"
        :feet="problem.feet || []"
        :show-labels="false"
      />
    </div>
    <div class="problem-info">
      <h3 class="problem-name">{{ problem.name }}</h3>
      <div class="problem-meta">
        <span class="grade">{{ problem.grade }}</span>
        <span class="board">{{ boardDisplayName }}</span>
      </div>
      <div class="problem-details">
        <span v-if="problem.setter" class="setter"
          >by {{ problem.setter }}</span
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.problem-card {
  background: #242424;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  border: 1px solid #333;
}

.problem-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border-color: #42b983;
}

.board-visualization {
  width: 100%;
  height: 300px;
  background: #000;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-visualization :deep(.board-display) {
  max-height: 100%;
  width: auto;
}

.board-visualization :deep(.board-container) {
  max-height: 100%;
  width: auto;
}

.board-visualization :deep(.board-image) {
  max-height: 300px;
  width: auto !important;
  object-fit: contain;
}

.problem-info {
  padding: 1rem;
}

.problem-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #e0e0e0;
  font-weight: 600;
}

.problem-meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.grade {
  background: #42b983;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.board {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.problem-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setter {
  font-size: 0.85rem;
  color: #a0a0a0;
  font-style: italic;
}
</style>
