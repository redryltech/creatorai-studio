import type { IdentityLock } from './image.types';
import type { CharacterDatabase } from '../character/character.types';
import type { AssetMemoryPackage } from '../asset-memory/asset.types';
export declare class IdentityLockEngine {
    static lock(sceneId: string, charDb: CharacterDatabase, assetMem?: AssetMemoryPackage): IdentityLock;
}
//# sourceMappingURL=identity-lock.d.ts.map