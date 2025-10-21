<script setup>
import { defineProps, computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  problem: {
    type: Object,
    required: true,
  },
});

const router = useRouter();

function handleClick() {
  // Navigate to /:board/:problemId
  router.push({
    name: "ClimbView",
    params: {
      board: props.problem.board,
      problemId: props.problem.id,
    },
  });
}

// Map board names to their image files
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
  return boardImageMap[props.problem.board];
});

const boardDisplayName = computed(() => {
  return boardDisplayNames[props.problem.board] || props.problem.board;
});
</script>

<template>
  <div class="problem-card" @click="handleClick">
    <div class="board-visualization">
      <div class="board-container">
        <img
          :src="boardImages.feet"
          alt="Board feet"
          class="board-layer board-feet"
          draggable="false"
        />
        <img
          :src="boardImages.holds"
          alt="Board holds"
          class="board-layer board-holds"
          draggable="false"
        />
      </div>
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
  aspect-ratio: 1;
  background: #000;
  position: relative;
  overflow: hidden;
  box-shadow: none;
}

.board-container {
  width: 100%;
  height: 100%;
  position: relative;
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

.board-feet {
  z-index: 1;
}

.board-holds {
  z-index: 2;
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
