import type { StoryboardFrame } from '../storyboard/storyboard.types';
import type { DirectorScenePlan } from '../director/director.types';
import type { CharacterDatabase } from '../character/character.types';
import type { WorldSnapshot } from '../world-state/world-state.types';
import type { BrandKit, StyleGuide } from '../asset-memory/asset.types';
import type { PromptBlock } from './prompt.types';
export declare class PromptAssembler {
    /**
     * Assemble all prompt blocks for a single scene.
     */
    static assemble(frame: StoryboardFrame, dirScene: DirectorScenePlan | undefined, charDb: CharacterDatabase, worldSnap: WorldSnapshot | undefined, brandKit: BrandKit | null, styleGuide: StyleGuide | null): PromptBlock[];
}
//# sourceMappingURL=prompt-assembler.d.ts.map