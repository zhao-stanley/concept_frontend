<script setup>
import { computed, defineProps, ref, onMounted } from "vue";

const props = defineProps({
  size: {
    type: String,
    required: true, // "12x12" or "10x12"
  },
  holds: {
    type: Array,
    default: () => [], // Array of coordinate strings like ["1,2", "3,4"]
  },
  feet: {
    type: Array,
    default: () => [], // Array of coordinate strings for feet
  },
  showLabels: {
    type: Boolean,
    default: false,
  },
});

const boardContainerRef = ref(null);
const autoScale = ref(1);

onMounted(() => {
  // Calculate scale based on actual rendered image size
  if (boardContainerRef.value) {
    const img = boardContainerRef.value.querySelector(".board-image");
    if (img) {
      // Wait for image to load
      if (img.complete) {
        calculateScale(img);
      } else {
        img.addEventListener("load", () => calculateScale(img));
      }
    }
  }
});

function calculateScale(img) {
  const renderedWidth = img.offsetWidth;
  // Base size assumes ~600px width for full scale
  autoScale.value = Math.max(0.3, Math.min(1, renderedWidth / 600));
}

// Board configuration based on size with margins
// Note: Feet only extend up to the bottom of hold row 3 for both board sizes
const boardConfig = {
  "12x12": {
    holds: {
      cols: 17,
      rows: 18,
      marginLeft: 3,
      marginRight: 3,
      marginTop: 0,
      marginBottom: 0,
    },
    feet: {
      cols: 18,
      rows: 15,
      marginLeft: 3,
      marginRight: 3,
      marginTop: 17,
      marginBottom: 5.5,
    },
  },
  "10x12": {
    holds: {
      cols: 11,
      rows: 15,
      marginLeft: 0,
      marginRight: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    feet: {
      cols: 10,
      rows: 12,
      marginLeft: 9,
      marginRight: 9,
      marginTop: 20,
      marginBottom: 6.5,
    },
  },
};

// Get board images
const boardImages = {
  "12x12": {
    holds: "/board/12x12-holds.png",
    feet: "/board/12x12-feet.png",
  },
  "10x12": {
    holds: "/board/10x12-holds.png",
    feet: "/board/10x12-feet.png",
  },
};

const holdsImage = computed(() => boardImages[props.size]?.holds);
const feetImage = computed(() => boardImages[props.size]?.feet);

const holdsGridConfig = computed(
  () =>
    boardConfig[props.size]?.holds || {
      cols: 17,
      rows: 18,
      marginLeft: 3,
      marginRight: 3,
      marginTop: 0,
      marginBottom: 0,
    }
);
const feetGridConfig = computed(
  () =>
    boardConfig[props.size]?.feet || {
      cols: 18,
      rows: 15,
      marginLeft: 3,
      marginRight: 3,
      marginTop: 17,
      marginBottom: 5.5,
    }
);

// Circle sizes based on board type and hold/feet type
function getCircleSize(type) {
  const isFeet = type === "feet";
  const baseSize = props.size === "10x12" ? { selected: 45 } : { selected: 30 };

  // Make feet circles 20% smaller
  const size = isFeet ? baseSize.selected * 0.8 : baseSize.selected;

  // Apply auto-calculated scale factor
  return size * autoScale.value;
}

// Convert coordinates to positions for holds
const holdsPositions = computed(() => {
  const config = holdsGridConfig.value;
  const usableWidth = 100 - config.marginLeft - config.marginRight;
  const usableHeight = 100 - config.marginTop - config.marginBottom;
  const cellWidth = usableWidth / config.cols;
  const cellHeight = usableHeight / config.rows;

  return props.holds.map((coord) => {
    const [col, row] = coord.split(",").map(Number);
    return {
      x: config.marginLeft + (col - 0.5) * cellWidth,
      y: config.marginTop + (row - 0.5) * cellHeight,
      coord,
    };
  });
});

// Convert coordinates to positions for feet (with staggered pattern logic)
const feetPositions = computed(() => {
  const config = feetGridConfig.value;
  const usableWidth = 100 - config.marginLeft - config.marginRight;
  const usableHeight = 100 - config.marginTop - config.marginBottom;
  const cellWidth = usableWidth / (config.cols - 1);
  const cellHeight = usableHeight / (config.rows - 1);

  return props.feet.map((coord) => {
    const [col, row] = coord.split(",").map(Number);
    return {
      x: config.marginLeft + (col - 1) * cellWidth,
      y: config.marginTop + (row - 1) * cellHeight,
      coord,
    };
  });
});
</script>

<template>
  <div class="board-display">
    <div class="board-container" ref="boardContainerRef">
      <!-- Board Images - Feet layer first -->
      <img
        :src="feetImage"
        alt="Board feet"
        class="board-image"
        draggable="false"
      />
      <img
        :src="holdsImage"
        alt="Board holds"
        class="board-image board-holds-layer"
        draggable="false"
      />

      <!-- Overlay for selections using positioned divs -->
      <div class="board-overlay">
        <!-- Feet indicators -->
        <div
          v-for="pos in feetPositions"
          :key="`feet-${pos.coord}`"
          class="point-indicator feet"
          :style="{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            '--circle-size': `${getCircleSize('feet')}px`,
          }"
        >
          <div class="point-outer"></div>
        </div>

        <!-- Holds indicators -->
        <div
          v-for="pos in holdsPositions"
          :key="`hold-${pos.coord}`"
          class="point-indicator hold"
          :style="{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            '--circle-size': `${getCircleSize('hold')}px`,
          }"
        >
          <div class="point-outer"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-display {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.board-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.board-image {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none;
  object-fit: contain;
}

.board-image:first-child {
  position: relative;
}

.board-image.board-holds-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.board-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.point-indicator {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.point-outer {
  width: var(--circle-size, 30px);
  height: var(--circle-size, 30px);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.point-indicator.hold .point-outer {
  background: transparent;
  border: 3px solid rgb(0, 191, 255);
  box-shadow: 0 0 10px rgba(0, 191, 255, 0.8), 0 0 20px rgba(0, 191, 255, 0.6),
    0 0 30px rgba(0, 191, 255, 0.4), inset 0 0 10px rgba(0, 191, 255, 0.3);
}

.point-indicator.feet .point-outer {
  background: transparent;
  border: 3px solid rgb(255, 140, 0);
  box-shadow: 0 0 10px rgba(255, 140, 0, 0.8), 0 0 20px rgba(255, 140, 0, 0.6),
    0 0 30px rgba(255, 140, 0, 0.4), inset 0 0 10px rgba(255, 140, 0, 0.3);
}
</style>
