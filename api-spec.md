# API Specification: Video Concept

**Purpose:** store and retrieve video content from external sources

---

## API Endpoints

### POST /api/Video/importVideo

**Description:** Imports a video from an external source using its type and URL, returning the identifier of the newly created video.

**Requirements:**

- true

**Effects:**

- generate unique videoId
- create new video with given sourceType, and url
- return the created video

**Request Body:**

```json
{
  "sourceType": "String",
  "url": "String"
}
```

**Success Response Body (Action):**

```json
{
  "video": "String"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Video/getVideo

**Description:** Retrieves the identifier of a video by its unique ID.

**Requirements:**

- true

**Effects:**

- return the video with the specified videoId

**Request Body:**

```json
{
  "videoId": "String"
}
```

**Success Response Body (Action):**

```json
{
  "video": "String"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Video/removeVideo

**Description:** Removes a video identified by its unique ID from the system.

**Requirements:**

- video with videoId exists

**Effects:**

- remove video from Videos

**Request Body:**

```json
{
  "videoId": "String"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

# API Specification: Tagging Concept

**Purpose:** associate items with descriptive labels for organization and discovery

---

## API Endpoints

### POST /api/Tagging/tag

**Description:** Associates an item with a set of descriptive labels, adding or updating its tags.

**Requirements:**

- true

**Effects:**

- add or update Tags[item] to include labels

**Request Body:**

```json
{
  "item": "String",
  "labels": ["String"]
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Tagging/getItemsByTag

**Description:** Retrieves identifiers of all items that have been tagged with a specific label.

**Requirements:**

- true

**Effects:**

- return all items that have been tagged with the specified label

**Request Body:**

```json
{
  "label": "String"
}
```

**Success Response Body (Action):**

```json
{
  "items": ["String"]
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Tagging/getTags

**Description:** Retrieves all tags associated with a specific item.

**Requirements:**

- true

**Effects:**

- return all tags associated with the specified item

**Request Body:**

```json
{
  "item": "String"
}
```

**Success Response Body (Action):**

```json
{
  "tags": ["String"]
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Tagging/removeTag

**Description:** Removes a specific label from an item.

**Requirements:**

- item exists in Tags

**Effects:**

- remove label from Tags[item]

**Request Body:**

```json
{
  "item": "String",
  "label": "String"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Tagging/removeAllTags

**Description:** Removes all tags associated with a specific item.

**Requirements:**

- item exists in Tags

**Effects:**

- remove item from Tags

**Request Body:**

```json
{
  "item": "String"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

# API Specification: Problem Concept

**Purpose:** represent climbing routes on training boards with holds, difficulty, and movement patterns

---

## API Endpoints

### POST /api/Problem/createProblem

**Description:** Creates a new climbing problem on a board with specified attributes, returning its identifier.

**Requirements:**

- true

**Effects:**

- generate unique problemId
- create new problem with given attributes
- return the created problem

**Request Body:**

```json
{
  "name": "String",
  "grade": "String",
  "holds": ["String"],
  "board": "String",
  "setter": "String"
}
```

**Success Response Body (Action):**

```json
{
  "problem": "String"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Problem/getProblemsByBoard

**Description:** Retrieves identifiers of all climbing problems associated with a specific board.

**Requirements:**

- true

**Effects:**

- return all problems on the specified board

**Request Body:**

```json
{
  "board": "String"
}
```

**Success Response Body (Action):**

```json
{
  "problems": ["String"]
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

---

### POST /api/Problem/getProblemsByGrade

**Description:** Retrieves identifiers of all climbing problems matching a specific grade.

**Requirements:**

- true

**Effects:**

- return all problems matching the specified grade

**Request Body:**

```json
{
  "grade": "String"
}
```

**Success Response Body (Action):**

```json
{
  "problems": ["String"]
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
