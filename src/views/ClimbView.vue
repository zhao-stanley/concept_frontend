<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BoardDisplay from "../components/BoardDisplay.vue";
import { problemAPI, taggingAPI, videoAPI } from "../services/api";

const route = useRoute();
const router = useRouter();

const problem = ref(null);
const loading = ref(true);
const error = ref("");
const betaVideos = ref([]);

// Fetch problem data based on route params
onMounted(async () => {
  await loadProblem();
});

async function loadProblem() {
  loading.value = true;
  error.value = "";

  try {
    // Search for problems by boardType, then filter by ID client-side
    // (backend doesn't support searching by ID directly)
    const response = await problemAPI.searchProblems({
      boardType: route.params.size,
    });

    if (!response.problems || response.problems.length === 0) {
      error.value = "Problem not found";
    } else {
      // Find the specific problem by ID
      const foundProblem = response.problems.find(
        (p) => p.id === route.params.problemId
      );

      if (!foundProblem) {
        error.value = "Problem not found";
      } else {
        problem.value = foundProblem;
        // Load beta videos for this problem
        await loadBetaVideos(foundProblem.id);
      }
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function loadBetaVideos(problemId) {
  try {
    console.log("Loading videos for problem:", problemId);
    // Get all video IDs tagged to this problem
    const tagsResponse = await taggingAPI.getTags(problemId);
    console.log("Tags response:", tagsResponse);

    if (tagsResponse && tagsResponse.length > 0) {
      // Fetch details for each video
      const videoPromises = tagsResponse.map(async (tagItem) => {
        try {
          console.log("Fetching video details for tag:", tagItem.tag);
          const videoDetails = await videoAPI.getVideoDetails(tagItem.tag);
          console.log("Video details:", videoDetails);

          // Handle if response is an array (take first item) or object
          let videoData = Array.isArray(videoDetails)
            ? videoDetails[0]
            : videoDetails;

          // Handle nested video property
          if (videoData && videoData.video) {
            videoData = videoData.video;
          }

          if (!videoData) {
            console.error("No video data found");
            return null;
          }

          console.log("Processed video data:", videoData);
          return {
            id: videoData._id,
            url: videoData.url,
            sourceType: videoData.sourceType,
          };
        } catch (err) {
          console.error("Failed to load video details:", err);
          return null;
        }
      });

      const videos = await Promise.all(videoPromises);
      betaVideos.value = videos.filter((v) => v !== null);
      console.log("Loaded beta videos:", betaVideos.value);
    } else {
      console.log("No videos tagged to this problem");
    }
  } catch (err) {
    console.error("Failed to load beta videos:", err);
  }
}

function goBack() {
  router.push({ name: "Home" });
}

// Board images mapping by size
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
  if (!problem.value) return null;
  return boardImageMap[problem.value.size];
});

const boardDisplayName = computed(() => {
  if (!problem.value) return "";
  return `Kilter Board ${problem.value.size}`;
});

// Helper to extract YouTube video ID from URL
function getYouTubeEmbedUrl(url) {
  try {
    console.log("Processing URL:", url, "Type:", typeof url);

    // Check if url is valid
    if (!url || typeof url !== "string") {
      console.error("Invalid URL provided:", url);
      return null;
    }

    const urlObj = new URL(url);
    let videoId = null;

    if (urlObj.hostname.includes("youtube.com")) {
      videoId = urlObj.searchParams.get("v");
    } else if (urlObj.hostname.includes("youtu.be")) {
      videoId = urlObj.pathname.slice(1);
    }

    const embedUrl = videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : null;
    console.log("Generated embed URL:", embedUrl);
    return embedUrl;
  } catch (err) {
    console.error("Error processing URL:", url, err);
    return null;
  }
}
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
          <div class="board-visualization-large">
            <BoardDisplay
              :size="problem.size"
              :holds="problem.holds || []"
              :feet="problem.feet || []"
              :show-labels="false"
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
                <span class="metadata-value">{{ problem.angle }}°</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Layout</span>
                <span class="metadata-value">{{ problem.size }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Holds</span>
                <span class="metadata-value"
                  >{{ problem.holds?.length || 0 }} positions</span
                >
              </div>
              <div class="metadata-item">
                <span class="metadata-label">Feet</span>
                <span class="metadata-value"
                  >{{ problem.feet?.length || 0 }} positions</span
                >
              </div>
            </div>
          </div>

          <!-- Beta Videos Section -->
          <div class="section-container">
            <div class="section-header">
              <span class="section-title"
                >Beta Videos ({{ betaVideos.length }})</span
              >
            </div>
            <div v-if="betaVideos.length > 0" class="videos-grid">
              <div
                v-for="video in betaVideos"
                :key="video.id"
                class="video-embed"
              >
                <iframe
                  v-if="getYouTubeEmbedUrl(video.url)"
                  :src="getYouTubeEmbedUrl(video.url)"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  class="video-iframe"
                ></iframe>
                <div v-else class="video-error">
                  <a :href="video.url" target="_blank" rel="noopener"
                    >View Video</a
                  >
                </div>
              </div>
            </div>
            <div v-else class="no-videos">
              <p>No beta videos available for this problem yet.</p>
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
  background: #000;
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
  max-height: calc(100vh - 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-visualization-large :deep(.board-display) {
  max-height: 100%;
  width: auto;
}

.board-visualization-large :deep(.board-container) {
  max-height: 100%;
  width: auto;
}

.board-visualization-large :deep(.board-image) {
  max-height: calc(100vh - 4rem);
  width: auto !important;
  object-fit: contain;
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

.video-embed {
  aspect-ratio: 16 / 9;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #333;
  background: #000;
}

.video-iframe {
  width: 100%;
  height: 100%;
  display: block;
}

.video-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
}

.video-error a {
  color: #42b983;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border: 1px solid #42b983;
  border-radius: 4px;
  transition: all 0.2s;
}

.video-error a:hover {
  background: #42b983;
  color: white;
}

.no-videos {
  padding: 2rem;
  text-align: center;
  color: #888;
}

.no-videos p {
  margin: 0;
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

  .videos-grid {
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
