// ============================================================
// CreatorAI Studio — Identity Resolver
// ============================================================
// Detects entities (humans, vehicles, animals, props, etc.)
// from storyboard frames and builds identity profiles.
// ============================================================

import { Logger } from '@creatorai/agents';
import type { Storyboard, StoryboardFrame } from '../storyboard/storyboard.types';
import type { DirectorPlan } from '../director/director.types';
import type {
  EntityIdentity, EntityCategory, CharacterProfile,
  VehicleProfile, EnvironmentProfile, AppearanceMemory,
} from './character.types';
import { SeedManager } from './seed-manager';

const log = Logger.for('IdentityResolver');

// ── Detection keyword maps ──

const VEHICLE_KEYWORDS: Array<{ keywords: string[]; defaults: Partial<VehicleProfile> }> = [
  { keywords: ['kawasaki', 'ninja'], defaults: { manufacturer: 'Kawasaki', model: 'Ninja', primaryColor: 'Lime Green', paintFinish: 'gloss' } },
  { keywords: ['yamaha', 'r15', 'mt'], defaults: { manufacturer: 'Yamaha', primaryColor: 'Blue', paintFinish: 'gloss' } },
  { keywords: ['honda', 'cbr', 'activa'], defaults: { manufacturer: 'Honda', primaryColor: 'Red', paintFinish: 'gloss' } },
  { keywords: ['ducati'], defaults: { manufacturer: 'Ducati', primaryColor: 'Red', paintFinish: 'gloss' } },
  { keywords: ['bmw'], defaults: { manufacturer: 'BMW', primaryColor: 'White', paintFinish: 'metallic' } },
  { keywords: ['royal enfield', 'bullet'], defaults: { manufacturer: 'Royal Enfield', primaryColor: 'Black', paintFinish: 'gloss' } },
  { keywords: ['ferrari'], defaults: { manufacturer: 'Ferrari', primaryColor: 'Rosso Corsa Red', paintFinish: 'metallic' } },
  { keywords: ['lamborghini'], defaults: { manufacturer: 'Lamborghini', primaryColor: 'Yellow', paintFinish: 'metallic' } },
  { keywords: ['porsche'], defaults: { manufacturer: 'Porsche', primaryColor: 'Silver', paintFinish: 'metallic' } },
  { keywords: ['motorcycle', 'bike', 'motorbike', 'sport bike'], defaults: { manufacturer: 'Generic', model: 'Sport Motorcycle', primaryColor: 'Black', paintFinish: 'gloss' } },
  { keywords: ['car', 'sedan', 'suv', 'hatchback'], defaults: { manufacturer: 'Generic', model: 'Car', primaryColor: 'Black', paintFinish: 'metallic' } },
];

const HUMAN_KEYWORDS = ['rider', 'person', 'man', 'woman', 'athlete', 'biker', 'driver', 'character', 'someone', 'individual', 'hero'];
const ANIMAL_KEYWORDS = ['dog', 'cat', 'horse', 'bird', 'lion', 'tiger', 'eagle'];
const PROP_KEYWORDS = ['helmet', 'gloves', 'jacket', 'boots', 'phone', 'camera', 'backpack', 'sword', 'shield', 'gun', 'weapon'];

export class IdentityResolver {
  private seedManager: SeedManager;

  constructor(seedManager: SeedManager) {
    this.seedManager = seedManager;
  }

  /**
   * Scan a storyboard and extract all entities with full profiles.
   */
  resolve(storyboard: Storyboard, directorPlan?: DirectorPlan): EntityIdentity[] {
    const allText = storyboard.frames.map((f) =>
      `${f.frameDescription} ${f.narrationText} ${f.composition.mainSubject} ${f.composition.foreground} ${f.composition.midground} ${f.assets.vehicles.join(' ')} ${f.assets.characters.join(' ')} ${f.assets.props.join(' ')}`,
    ).join(' ').toLowerCase();

    const entities: EntityIdentity[] = [];
    const seenEntityKeys = new Set<string>();
    let entityCounter = 0;

    // ── Detect vehicles ──
    for (const rule of VEHICLE_KEYWORDS) {
      if (rule.keywords.some((kw) => allText.includes(kw))) {
        const key = `vehicle:${rule.defaults.manufacturer}:${rule.defaults.model ?? ''}`;
        if (seenEntityKeys.has(key)) continue;
        seenEntityKeys.add(key);

        entityCounter++;
        const id = `bike_${String(entityCounter).padStart(3, '0')}`;

        // Extract additional details from text
        const colorMatch = allText.match(/(\w+)\s+(?:green|red|blue|black|white|yellow|silver|orange)/);
        const modelMatch = allText.match(/(?:ninja|r15|cbr|mt)\s*(\d+)/);

        const vehicleProfile: VehicleProfile = {
          manufacturer: rule.defaults.manufacturer ?? 'Unknown',
          model: modelMatch ? `${rule.defaults.model ?? ''} ${modelMatch[1]}` : (rule.defaults.model ?? 'Unknown'),
          year: '2024',
          variant: 'Standard',
          primaryColor: rule.defaults.primaryColor ?? 'Black',
          secondaryColor: 'Black',
          paintFinish: rule.defaults.paintFinish ?? 'gloss',
          wheelDesign: 'OEM alloy wheels',
          tyres: 'Sport compound',
          brakeType: 'Dual disc with ABS',
          exhaust: allText.includes('akrapovic') ? 'Akrapovic aftermarket' : 'OEM exhaust',
          engineStyle: allText.includes('twin') ? 'Parallel twin' : 'Standard',
          suspension: 'Telescopic front fork, monoshock rear',
          licensePlate: '',
          damageState: 'pristine',
          cleanliness: 'showroom',
          brandStickers: [],
        };

        // Find which scenes this vehicle appears in
        const scenePresence = storyboard.frames
          .filter((f) => {
            const ft = `${f.frameDescription} ${f.narrationText} ${f.composition.mainSubject} ${f.assets.vehicles.join(' ')}`.toLowerCase();
            return rule.keywords.some((kw) => ft.includes(kw));
          })
          .map((f) => f.sceneId);

        const displayName = `${vehicleProfile.primaryColor} ${vehicleProfile.manufacturer} ${vehicleProfile.model}`.trim();

        entities.push(this.buildEntity(id, displayName, 'vehicle', 10, 90, 'primary', 'strict', vehicleProfile, null, null, scenePresence));
      }
    }

    // ── Detect humans ──
    if (HUMAN_KEYWORDS.some((kw) => allText.includes(kw))) {
      entityCounter++;
      const id = `char_${String(entityCounter).padStart(3, '0')}`;

      // Infer character from context
      const isRider = allText.includes('rider') || allText.includes('biker');
      const isAthlete = allText.includes('athlete') || allText.includes('runner');
      const gender = allText.includes('woman') || allText.includes('female') ? 'female' :
                     allText.includes('man') || allText.includes('male') ? 'male' : 'unspecified';

      const charProfile = this.buildCharacterProfile(gender, isRider, isAthlete, directorPlan);

      const scenePresence = storyboard.frames
        .filter((f) => HUMAN_KEYWORDS.some((kw) => `${f.frameDescription} ${f.narrationText} ${f.assets.characters.join(' ')}`.toLowerCase().includes(kw)))
        .map((f) => f.sceneId);

      const displayName = isRider ? 'Motorcycle Rider' : isAthlete ? 'Athlete' : 'Main Character';

      entities.push(this.buildEntity(id, displayName, 'human', 8, 70, scenePresence.length > 2 ? 'primary' : 'secondary', 'high', null, charProfile, null, scenePresence));
    }

    // ── Detect animals ──
    for (const kw of ANIMAL_KEYWORDS) {
      if (allText.includes(kw) && !seenEntityKeys.has(`animal:${kw}`)) {
        seenEntityKeys.add(`animal:${kw}`);
        entityCounter++;
        const id = `anim_${String(entityCounter).padStart(3, '0')}`;
        const scenePresence = storyboard.frames.filter((f) => f.frameDescription.toLowerCase().includes(kw) || f.narrationText.toLowerCase().includes(kw)).map((f) => f.sceneId);
        entities.push(this.buildEntity(id, kw.charAt(0).toUpperCase() + kw.slice(1), 'animal', 5, 40, 'secondary', 'medium', null, null, null, scenePresence));
      }
    }

    // ── Detect props ──
    for (const kw of PROP_KEYWORDS) {
      if (allText.includes(kw) && !seenEntityKeys.has(`prop:${kw}`)) {
        seenEntityKeys.add(`prop:${kw}`);
        entityCounter++;
        const id = `prop_${String(entityCounter).padStart(3, '0')}`;
        const scenePresence = storyboard.frames.filter((f) => `${f.frameDescription} ${f.assets.props.join(' ')}`.toLowerCase().includes(kw)).map((f) => f.sceneId);
        if (scenePresence.length > 0) {
          entities.push(this.buildEntity(id, kw.charAt(0).toUpperCase() + kw.slice(1), 'prop', 3, 20, 'background', 'low', null, null, null, scenePresence));
        }
      }
    }

    log.info('Entities resolved', {
      total: entities.length,
      vehicles: entities.filter((e) => e.category === 'vehicle').length,
      humans: entities.filter((e) => e.category === 'human').length,
      props: entities.filter((e) => e.category === 'prop').length,
    });

    return entities;
  }

  // ── Builders ───────────────────────────────────────────

  private buildEntity(
    id: string, displayName: string, category: EntityCategory,
    priority: number, visibility: number,
    importance: EntityIdentity['importance'], continuityLevel: EntityIdentity['continuityLevel'],
    vehicleProfile: VehicleProfile | null,
    characterProfile: CharacterProfile | null,
    environmentProfile: EnvironmentProfile | null,
    scenePresence: string[],
  ): EntityIdentity {
    const globalSeed = this.seedManager.entitySeed(id);
    const sceneSeeds: Record<string, number> = {};
    for (const sceneId of scenePresence) {
      sceneSeeds[sceneId] = this.seedManager.sceneSeed(id, sceneId);
    }

    // Build identity block (provider-neutral prompt injection)
    const identityBlock = this.buildIdentityBlock(id, displayName, category, vehicleProfile, characterProfile);

    // Build appearance memory
    const appearance = this.buildAppearanceMemory(displayName, category, vehicleProfile, characterProfile);

    return {
      id,
      uuid: `${id}-${globalSeed.toString(16)}`,
      displayName,
      category,
      priority,
      visibilityScore: visibility,
      importance,
      continuityLevel,
      globalSeed,
      sceneSeed: sceneSeeds,
      variationSeed: this.seedManager.variationSeed(id, 0),
      characterProfile: characterProfile ?? (category === 'human' ? this.buildDefaultCharacterProfile() : null),
      vehicleProfile,
      environmentProfile,
      appearance,
      scenePresence,
      identityBlock,
    };
  }

  private buildIdentityBlock(id: string, name: string, category: EntityCategory, vehicle: VehicleProfile | null, character: CharacterProfile | null): string {
    const lines: string[] = [`ENTITY ${id} (${category.toUpperCase()})`];
    lines.push(`Always use: ${name}`);

    if (vehicle) {
      lines.push(`Color: ${vehicle.primaryColor} ${vehicle.paintFinish}`);
      if (vehicle.secondaryColor && vehicle.secondaryColor !== 'Black') lines.push(`Secondary: ${vehicle.secondaryColor}`);
      lines.push(`Wheels: ${vehicle.wheelDesign}`);
      lines.push(`Exhaust: ${vehicle.exhaust}`);
      lines.push(`Condition: ${vehicle.damageState}, ${vehicle.cleanliness}`);
      lines.push(`Brakes: ${vehicle.brakeType}`);
    }

    if (character) {
      lines.push(`Gender: ${character.gender}, Age: ${character.ageRange}`);
      lines.push(`Build: ${character.bodyType}, Height: ${character.height}`);
      lines.push(`Hair: ${character.hairColor} ${character.hairStyle}`);
      lines.push(`Clothing: ${character.clothing.overall}`);
      if (character.helmet) lines.push(`Helmet: ${character.helmet}`);
      if (character.accessories.length > 0) lines.push(`Accessories: ${character.accessories.join(', ')}`);
    }

    lines.push(`Maintain identity across ALL scenes.`);
    return lines.join('\n');
  }

  private buildAppearanceMemory(name: string, category: EntityCategory, vehicle: VehicleProfile | null, character: CharacterProfile | null): AppearanceMemory {
    const preferredColors: string[] = [];
    const requiredObjects: string[] = [];
    const requiredClothing: string[] = [];
    const requiredVehicleParts: string[] = [];
    const forbiddenChanges: string[] = [];

    if (vehicle) {
      preferredColors.push(vehicle.primaryColor);
      if (vehicle.secondaryColor) preferredColors.push(vehicle.secondaryColor);
      requiredVehicleParts.push(vehicle.wheelDesign, vehicle.exhaust, vehicle.brakeType);
      forbiddenChanges.push('Do NOT change vehicle color', 'Do NOT change vehicle model', 'Do NOT add damage unless scripted');
    }

    if (character) {
      requiredClothing.push(character.clothing.overall);
      if (character.helmet) requiredObjects.push(character.helmet);
      character.accessories.forEach((a) => requiredObjects.push(a));
      forbiddenChanges.push('Do NOT change clothing between scenes', 'Do NOT change hair color/style');
    }

    return {
      referencePrompt: `Consistent ${name} — maintain exact appearance in every frame`,
      referenceDescription: `${name} as described in the identity profile`,
      visualEmbeddingPlaceholder: `[EMBEDDING:${name.replace(/\s+/g, '_').toLowerCase()}]`,
      preferredColors,
      forbiddenChanges,
      requiredObjects,
      requiredClothing,
      requiredVehicleParts,
    };
  }

  private buildCharacterProfile(gender: CharacterProfile['gender'], isRider: boolean, isAthlete: boolean, directorPlan?: DirectorPlan): CharacterProfile {
    return {
      gender,
      ageRange: '25-35',
      height: 'average',
      bodyType: isAthlete ? 'athletic' : 'average',
      skinTone: 'medium',
      hairStyle: gender === 'female' ? 'ponytail' : 'short cropped',
      hairColor: 'dark brown',
      eyeColor: 'brown',
      faceShape: 'oval',
      facialHair: gender === 'male' ? 'light stubble' : 'none',
      expressionStyle: 'determined and focused',
      accessories: isRider ? ['riding gloves'] : [],
      jewelry: [],
      helmet: isRider ? 'Black full-face AGV helmet' : '',
      glasses: '',
      shoes: isRider ? 'Black riding boots' : 'Athletic shoes',
      clothing: {
        jacket: isRider ? 'Black leather riding jacket with armor' : 'Dark fitted jacket',
        pants: isRider ? 'Black riding pants with knee protection' : 'Dark athletic pants',
        shirt: 'Dark fitted t-shirt',
        overall: isRider ? 'Full motorcycle riding gear — black leather jacket, riding pants, gloves, boots, AGV helmet' :
                 isAthlete ? 'Athletic sportswear — fitted shirt, shorts, running shoes' :
                 'Smart casual — dark jacket, fitted shirt, dark pants',
      },
      brandColors: directorPlan?.colorPalette?.slice(0, 3) ?? ['#1a1a2e', '#e94560'],
      signaturePose: isRider ? 'Confident stance beside motorcycle' : 'Standing with arms crossed',
      walkingStyle: isRider ? 'Confident stride carrying helmet' : 'Purposeful walk',
    };
  }

  private buildDefaultCharacterProfile(): CharacterProfile {
    return this.buildCharacterProfile('unspecified', false, false);
  }
}
