// ============================================================
// @creatorai/agents — Main Entry Point
// ============================================================

// Core agent framework
export * from './core';

// Infrastructure layer
export * from './infrastructure';

// Prompt templates
export { SCRIPT_PROMPT_TEMPLATES } from './script/script.prompts';
export { PROMPT_GENERATOR_TEMPLATES } from './prompt/prompt.prompts';

// Concrete agents
export { ScriptAgent, type ScriptAgentInput, type ScriptAgentOutput } from './script/script.agent';
export { PromptAgent, type PromptAgentInput, type PromptAgentOutput } from './prompt/prompt.agent';
export { ImageAgent, type ImageAgentInput, type ImageAgentOutput } from './image/image.agent';
export { VoiceAgent, type VoiceAgentInput, type VoiceAgentOutput } from './voice/voice.agent';
export { EditorAgent, type EditorAgentInput, type EditorAgentOutput } from './editor/editor.agent';
