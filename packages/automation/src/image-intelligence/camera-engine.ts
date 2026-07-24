import type { ImageCamera } from './image.types';
import type { StoryboardFrame } from '../storyboard/storyboard.types';
import type { DirectorScenePlan } from '../director/director.types';

const LENS_FOV: Record<string, number> = { '24mm': 84, '35mm': 63, '50mm': 47, '85mm': 28, '135mm': 18, ultra_wide: 100, telephoto: 15, macro: 40 };
const POS_TO_ANGLE: Record<string, ImageCamera['angle']> = { ground_level: 'low_angle', waist_level: 'low_angle', eye_level: 'eye_level', overhead: 'overhead', aerial: 'birds_eye', crane_high: 'high_angle', floor: 'worms_eye' };
const POS_TO_HEIGHT: Record<string, number> = { ground_level: 0.3, waist_level: 1.0, eye_level: 1.7, overhead: 5, aerial: 20, crane_high: 6, floor: 0.1 };

export class CameraEngine {
  static analyze(frame: StoryboardFrame, dirScene?: DirectorScenePlan): ImageCamera {
    const cam = frame.camera;
    return {
      angle: POS_TO_ANGLE[cam.position] ?? 'eye_level',
      lens: cam.lens || dirScene?.lens || '50mm',
      fov: LENS_FOV[cam.lens] ?? 47,
      distance: cam.distance === 'intimate' ? 'extreme_close' : cam.distance === 'close' ? 'close' : cam.distance === 'far' ? 'wide' : cam.distance === 'very_far' ? 'extreme_wide' : 'medium',
      height: POS_TO_HEIGHT[cam.position] ?? 1.7,
      tracking: cam.path || 'static',
      motion: dirScene?.cameraMovement?.replace(/_/g, ' ') ?? 'static',
      zoom: cam.fov === 'narrow' ? 'dramatic' : cam.fov === 'ultra_wide' ? 'none' : 'subtle',
    };
  }
}
