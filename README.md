# Vue.js Frontend for Concept API

This Vue.js application connects to the backend API running at `http://localhost:8000/api`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The app will run on `http://localhost:5173` by default.

## Backend API

Make sure your backend is running at `http://localhost:8000/api` before starting the frontend.

## API Service

All API endpoints are available through the service layer in `src/services/api.js`:

### Problem API

```javascript
import { problemAPI } from "./services/api";

// Create a new climbing problem
const result = await problemAPI.createProblem(
  name,
  grade,
  holds,
  board,
  setter
);
// Returns: { problem: "problemId" }

// Get all problems for a specific board
const result = await problemAPI.getProblemsByBoard(board);
// Returns: { problems: ["problem1", "problem2", ...] }

// Get all problems of a specific grade
const result = await problemAPI.getProblemsByGrade(grade);
// Returns: { problems: ["problem1", "problem2", ...] }
```

## Project Structure

- `src/services/api.js` - API service layer with all backend endpoints
- `src/views/Home.vue` - Main view displaying climbing problems
- `src/components/ProblemCard.vue` - Component for displaying individual problems
- `src/components/SearchPanel.vue` - Collapsible sidebar for filtering problems
- `vite.config.js` - Vite configuration with proxy setup for API calls

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Specification

See `api-spec.md` for complete API documentation.
