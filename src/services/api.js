const API_BASE_URL = "/api";

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

// Problem API
export const problemAPI = {
  createProblem: (name, grade, holds, board, setter) =>
    apiRequest("/Problem/createProblem", {
      body: { name, grade, holds, board, setter },
    }),
  getProblemsByBoard: (board) =>
    apiRequest("/Problem/getProblemsByBoard", { body: { board } }),
  getProblemsByGrade: (grade) =>
    apiRequest("/Problem/getProblemsByGrade", { body: { grade } }),
};

export default apiRequest;
