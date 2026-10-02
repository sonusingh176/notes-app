// lib/dummy-data.js
//
// Phase 3 ke liye sirf DUMMY data — koi backend/API call nahi hai abhi.
// Jab Phase 4 me real API aayega, to bas yahan se array exports ko
// fetch() calls se replace karna hoga — components ko kuch badalna nahi padega.

export const dummyTopics = [
  {
    id: "1",
    title: "JavaScript",
    slug: "javascript",
    description: "Core JS concepts — closures, hoisting, event loop, async/await.",
    icon: "🟨",
    questionCount: 42,
    createdAt: "2026-04-02",
  },
  {
    id: "2",
    title: "React",
    slug: "react",
    description: "Hooks, component lifecycle, state management, performance.",
    icon: "⚛️",
    questionCount: 35,
    createdAt: "2026-04-05",
  },
  {
    id: "3",
    title: "Node.js",
    slug: "nodejs",
    description: "Event loop, streams, Express, REST API design.",
    icon: "🟩",
    questionCount: 28,
    createdAt: "2026-04-10",
  },
  {
    id: "4",
    title: "System Design",
    slug: "system-design",
    description: "Scalability, load balancing, caching, database sharding.",
    icon: "🧩",
    questionCount: 19,
    createdAt: "2026-05-01",
  },
  {
    id: "5",
    title: "SQL",
    slug: "sql",
    description: "Joins, indexing, normalization, query optimization.",
    icon: "🗄️",
    questionCount: 24,
    createdAt: "2026-05-12",
  },
];

export const dummyQuestions = [
  {
    id: "101",
    topicId: "1",
    topicTitle: "JavaScript",
    question: "What is a closure in JavaScript?",
    answer:
      "A closure is a function that remembers the variables from the scope it was created in, even after that outer scope has finished executing.",
    difficulty: "Easy",
    createdAt: "2026-04-03",
  },
  {
    id: "102",
    topicId: "1",
    topicTitle: "JavaScript",
    question: "Explain the difference between == and ===.",
    answer:
      "== compares values after type coercion, while === compares both value and type without coercion.",
    difficulty: "Easy",
    createdAt: "2026-04-04",
  },
  {
    id: "103",
    topicId: "2",
    topicTitle: "React",
    question: "What is the difference between useMemo and useCallback?",
    answer:
      "useMemo memoizes a computed value, while useCallback memoizes a function reference itself.",
    difficulty: "Medium",
    createdAt: "2026-04-06",
  },
  {
    id: "104",
    topicId: "2",
    topicTitle: "React",
    question: "Why do we need keys in lists?",
    answer:
      "Keys help React identify which items changed, were added, or removed, so it can update the DOM efficiently.",
    difficulty: "Easy",
    createdAt: "2026-04-07",
  },
  {
    id: "105",
    topicId: "3",
    topicTitle: "Node.js",
    question: "How does the Node.js event loop work?",
    answer:
      "Node.js uses a single-threaded event loop that handles async operations via callback queues and phases like timers, I/O, and check.",
    difficulty: "Hard",
    createdAt: "2026-04-11",
  },
  {
    id: "106",
    topicId: "4",
    topicTitle: "System Design",
    question: "What is the difference between horizontal and vertical scaling?",
    answer:
      "Vertical scaling adds more power (CPU/RAM) to an existing machine, horizontal scaling adds more machines to the pool.",
    difficulty: "Medium",
    createdAt: "2026-05-02",
  },
  {
    id: "107",
    topicId: "5",
    topicTitle: "SQL",
    question: "What is the difference between INNER JOIN and LEFT JOIN?",
    answer:
      "INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all rows from the left table plus matching rows from the right.",
    difficulty: "Medium",
    createdAt: "2026-05-13",
  },
];

// Helper: dashboard ke "Recent" sections ke liye sabse naye N items nikalne ke liye
export const getRecent = (items, count = 5) =>
  [...items]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, count);
