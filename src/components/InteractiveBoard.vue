<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";

const props = defineProps({
  size: {
    type: String,
    required: true, // "12x12" or "10x12"
  },
  selectedCoordinates: {
    type: Array,
    default: () => [], // Array of coordinate objects like [{ x: 5, y: 3, type: 'hold' }]
  },
});

const emit = defineEmits(["coordinate-selected", "coordinate-deselected"]);

// Board configuration based on size
// Margins are percentages of the image dimensions where holds/feet don't exist
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
const boardImages = computed(() => {
  const imageMap = {
    "12x12": {
      holds: "/board/12x12-holds.png",
      feet: "/board/12x12-feet.png",
    },
    "10x12": {
      holds: "/board/10x12-holds.png",
      feet: "/board/10x12-feet.png",
    },
  };
  return imageMap[props.size];
});

const boardRef = ref(null);
const hoveredPoint = ref(null);

// Circle sizes based on board type and hold/feet type
function getCircleSize(type) {
  const isFeet = type === "feet";
  const baseSize =
    props.size === "10x12"
      ? { selected: 45, hover: 41 }
      : { selected: 30, hover: 26 };

  // Make feet circles 20% smaller
  if (isFeet) {
    return {
      selected: baseSize.selected * 0.8,
      hover: baseSize.hover * 0.8,
    };
  }

  return baseSize;
}

// Generate all valid hold and feet positions based on grid
const validPositions = computed(() => {
  const config = boardConfig[props.size];
  if (!config) return [];

  const positions = [];

  // Generate hold positions
  const holdsConfig = config.holds;
  const holdUsableWidth =
    100 - holdsConfig.marginLeft - holdsConfig.marginRight;
  const holdUsableHeight =
    100 - holdsConfig.marginTop - holdsConfig.marginBottom;
  const holdCellWidth = holdUsableWidth / holdsConfig.cols;
  const holdCellHeight = holdUsableHeight / holdsConfig.rows;

  for (let row = 1; row <= holdsConfig.rows; row++) {
    for (let col = 1; col <= holdsConfig.cols; col++) {
      positions.push({
        x: holdsConfig.marginLeft + (col - 0.5) * holdCellWidth,
        y: holdsConfig.marginTop + (row - 0.5) * holdCellHeight,
        col,
        row,
        type: "hold",
        gridId: `hold-${col},${row}`,
      });
    }
  }

  // Generate feet positions with staggered pattern
  // Odd rows: only odd columns (1, 3, 5, 7, ...)
  // Even rows: only even columns (2, 4, 6, 8, ...)
  const feetConfig = config.feet;
  const feetUsableWidth = 100 - feetConfig.marginLeft - feetConfig.marginRight;
  const feetUsableHeight = 100 - feetConfig.marginTop - feetConfig.marginBottom;
  const feetCellWidth = feetUsableWidth / (feetConfig.cols - 1);
  const feetCellHeight = feetUsableHeight / (feetConfig.rows - 1);

  for (let row = 1; row <= feetConfig.rows; row++) {
    const isOddRow = row % 2 === 1;

    for (let col = 1; col <= feetConfig.cols; col++) {
      // Odd rows: only odd columns, Even rows: only even columns
      const isOddCol = col % 2 === 1;
      if ((isOddRow && isOddCol) || (!isOddRow && !isOddCol)) {
        positions.push({
          x: feetConfig.marginLeft + (col - 1) * feetCellWidth,
          y: feetConfig.marginTop + (row - 1) * feetCellHeight,
          col,
          row,
          type: "feet",
          gridId: `feet-${col},${row}`,
        });
      }
    }
  }

  return positions;
});

function findNearestPosition(clickX, clickY) {
  let nearest = null;
  let minDistance = Infinity;

  validPositions.value.forEach((pos) => {
    const dx = pos.x - clickX;
    const dy = pos.y - clickY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = pos;
    }
  });

  // Only snap if within reasonable distance (8% of board)
  return minDistance < 8 ? nearest : null;
}

function handleBoardClick(event) {
  if (!boardRef.value) return;

  // Get the first image element (feet layer) which determines the actual board size
  const imgElement = boardRef.value.querySelector("img");
  if (!imgElement) return;

  const rect = imgElement.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  // Convert to percentage coordinates (0-100) based on actual image dimensions
  const percentX = (clickX / rect.width) * 100;
  const percentY = (clickY / rect.height) * 100;

  // Find nearest valid position
  const nearestPos = findNearestPosition(percentX, percentY);
  if (!nearestPos) return;

  // Check if this position is already selected
  const existingIndex = props.selectedCoordinates.findIndex(
    (coord) => coord.gridId === nearestPos.gridId
  );

  if (existingIndex !== -1) {
    // Deselect existing point
    emit("coordinate-deselected", props.selectedCoordinates[existingIndex]);
  } else {
    // Add new point at the snapped position
    const newCoord = {
      x: nearestPos.x,
      y: nearestPos.y,
      col: nearestPos.col,
      row: nearestPos.row,
      type: nearestPos.type,
      gridId: nearestPos.gridId,
      id: Date.now(),
    };
    emit("coordinate-selected", newCoord);
  }
}

function handleBoardHover(event) {
  if (!boardRef.value) return;

  // Get the first image element (feet layer) which determines the actual board size
  const imgElement = boardRef.value.querySelector("img");
  if (!imgElement) return;

  const rect = imgElement.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const percentX = (x / rect.width) * 100;
  const percentY = (y / rect.height) * 100;

  // Snap hover to nearest valid position
  const nearestPos = findNearestPosition(percentX, percentY);
  if (nearestPos) {
    hoveredPoint.value = {
      x: nearestPos.x,
      y: nearestPos.y,
      type: nearestPos.type,
    };
  } else {
    hoveredPoint.value = null;
  }
}

function handleBoardLeave() {
  hoveredPoint.value = null;
}
</script>

<template>
  <div class="interactive-board">
    <div
      ref="boardRef"
      class="board-container"
      @click="handleBoardClick"
      @mousemove="handleBoardHover"
      @mouseleave="handleBoardLeave"
    >
      <!-- Board Images - Feet layer first -->
      <img
        :src="boardImages.feet"
        alt="Board feet"
        class="board-image"
        draggable="false"
      />
      <img
        :src="boardImages.holds"
        alt="Board holds"
        class="board-image board-holds-layer"
        draggable="false"
      />

      <!-- Overlay for selections using positioned divs -->
      <div class="board-overlay">
        <!-- Selected points -->
        <div
          v-for="coord in selectedCoordinates"
          :key="coord.id"
          :class="[
            'point-indicator',
            'selected',
            coord.type === 'feet' ? 'feet' : 'hold',
          ]"
          :style="{
            left: `${coord.x}%`,
            top: `${coord.y}%`,
            '--circle-size': `${getCircleSize(coord.type).selected}px`,
          }"
        >
          <div class="point-outer"></div>
        </div>

        <!-- Hover indicator -->
        <div
          v-if="hoveredPoint"
          :class="[
            'point-indicator',
            'hover',
            hoveredPoint.type === 'feet' ? 'feet' : 'hold',
          ]"
          :style="{
            left: `${hoveredPoint.x}%`,
            top: `${hoveredPoint.y}%`,
            '--circle-size': `${getCircleSize(hoveredPoint.type).hover}px`,
          }"
        >
          <div class="point-outer"></div>
        </div>
      </div>
    </div>

    <!-- Info display -->
    <div class="board-info">
      <div class="info-row">
        <span class="info-label">Board:</span>
        <span class="info-value">Kilter {{ size }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Selected:</span>
        <span class="info-value">{{ selectedCoordinates.length }} holds</span>
      </div>
      <div class="info-hint">Click on holds or feet to select them</div>
    </div>
  </div>
</template>

<style scoped>
.interactive-board {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.board-container {
  position: relative;
  width: 100%;
  cursor: crosshair;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
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

.point-inner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.point-indicator.selected.hold .point-outer {
  background: transparent;
  border: 3px solid rgb(0, 191, 255);
  box-shadow: 0 0 10px rgba(0, 191, 255, 0.8), 0 0 20px rgba(0, 191, 255, 0.6),
    0 0 30px rgba(0, 191, 255, 0.4), inset 0 0 10px rgba(0, 191, 255, 0.3);
}

.point-indicator.selected.feet .point-outer {
  background: transparent;
  border: 3px solid rgb(255, 140, 0);
  box-shadow: 0 0 10px rgba(255, 140, 0, 0.8), 0 0 20px rgba(255, 140, 0, 0.6),
    0 0 30px rgba(255, 140, 0, 0.4), inset 0 0 10px rgba(255, 140, 0, 0.3);
}

.point-indicator.hover.hold .point-outer {
  background: rgba(0, 191, 255, 0.3);
  border: 2px solid rgb(0, 191, 255);
  box-shadow: 0 0 8px rgba(0, 191, 255, 0.6), 0 0 15px rgba(0, 191, 255, 0.4);
}

.point-indicator.hover.feet .point-outer {
  background: rgba(255, 140, 0, 0.3);
  border: 2px solid rgb(255, 140, 0);
  box-shadow: 0 0 8px rgba(255, 140, 0, 0.6), 0 0 15px rgba(255, 140, 0, 0.4);
}

.board-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: #1a1a1a;
  border-radius: 6px;
  border: 1px solid #333;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.info-label {
  color: #888;
  font-weight: 500;
}

.info-value {
  color: #e0e0e0;
  font-weight: 600;
}

.info-hint {
  text-align: center;
  color: #666;
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #333;
}
</style>
