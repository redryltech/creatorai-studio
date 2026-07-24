// ============================================================
// CreatorAI Studio — AI Memory & Brand Intelligence Types
// ============================================================
// AI Memory is persistent knowledge that agents load before
// every execution. It ensures the AI produces content that
// matches the user's brand, audience, and style consistently.
//
// Memory hierarchy:
//   Workspace Memory (applies to all projects)
//     └── Brand Profile (applies to projects using that brand)
//       └── Project Memory (project-specific overrides)
//
// When an agent executes, the MemoryLoader merges all layers
// into a single context object injected into the system prompt.
// ============================================================
export {};
//# sourceMappingURL=memory.types.js.map