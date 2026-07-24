// ============================================================
// CreatorAI Studio — Video Provider Interface
// ============================================================
// Contract for all AI video generation providers.
//
// Every provider — Mock, Google Veo, Runway, Kling, Luma, Pika —
// implements this interface. The VideoProviderRegistry selects
// the best available provider by priority at runtime.
//
// Changing providers = change one env var. Zero app code changes.
//
// Provider priority chain:
//   Mock (99)        ← active now (₹0 development)
//   Google Veo (10)  ← future (paid)
//   Runway (15)      ← future (paid)
//   Kling (20)       ← future (paid)
//   Luma (25)        ← future (paid)
//   Pika (30)        ← future (paid)
// ============================================================
export {};
//# sourceMappingURL=video-provider.interface.js.map