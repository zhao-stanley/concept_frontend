const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  if (options.body) {
    defaultOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Helper to transform backend problem format to frontend format
function transformProblem(backendProblem) {
  return {
    id: backendProblem._id,
    name: backendProblem.name,
    grade: backendProblem.grade?.toUpperCase() || backendProblem.grade,
    holds: backendProblem.holds,
    feet: backendProblem.feet,
    size: backendProblem.boardType,
    angle: backendProblem.angle,
    setter: backendProblem.setterName,
  };
}

// Problem API
export const problemAPI = {
  createProblem: (
    name,
    grade,
    holds,
    boardType,
    setterName,
    angle,
    feet = []
  ) =>
    apiRequest("/Problem/createProblem", {
      body: { name, grade, holds, feet, boardType, angle, setterName },
    }),
  searchProblems: async (filters) => {
    // If no filters provided, search by grade range to get all problems
    const searchParams =
      Object.keys(filters).length === 0
        ? { gradeMin: "v0", gradeMax: "v17" }
        : filters;
    const response = await apiRequest("/Problem/searchProblems", {
      body: searchParams,
    });

    // Transform backend format to frontend format
    if (response.problems) {
      response.problems = response.problems.map(transformProblem);
    }
    return response;
  },
  getProblemsByGrade: async (grade) => {
    const response = await apiRequest("/Problem/getProblemsByGrade", {
      body: { grade },
    });
    if (response.problems) {
      response.problems = response.problems.map(transformProblem);
    }
    return response;
  },
};

// Video API
export const videoAPI = {
  importVideo: (sourceType, url) =>
    apiRequest("/Video/importVideo", {
      body: { sourceType, url },
    }),
  getVideo: (videoId) => apiRequest("/Video/getVideo", { body: { videoId } }),
  removeVideo: (videoId) => apiRequest("/Video/removeVideo", { body: { videoId } }),
  getVideoDetails: (videoId) =>
    apiRequest("/Video/_getVideoDetails", { body: { videoId } }),
};

// Tagging API
export const taggingAPI = {
  tag: (item, labels) => apiRequest("/Tagging/tag", { body: { item, labels } }),
  getItemsByTag: (label) =>
    apiRequest("/Tagging/_getItemsByTag", { body: { label } }),
  getTags: (item) => apiRequest("/Tagging/_getTags", { body: { item } }),
  removeTag: (item, label) =>
    apiRequest("/Tagging/removeTag", { body: { item, label } }),
  removeAllTags: (item) =>
    apiRequest("/Tagging/removeAllTags", { body: { item } }),
};

export default apiRequest;
