import type { PublishingRecommendation, SocialPlatform } from './creator.types';
export class PublishingEngine {
  static recommend(category: string, bestPlatform: SocialPlatform, totalDuration: number): PublishingRecommendation {
    const timings: Record<string, { time: string; day: string }> = {
      automotive: { time: '7-9 PM IST', day: 'Saturday' }, technology: { time: '6-8 PM IST', day: 'Tuesday' },
      motivational: { time: '6-8 AM IST', day: 'Monday' }, sports: { time: '8-10 PM IST', day: 'Sunday' },
      food: { time: '12-2 PM IST', day: 'Friday' }, default: { time: '7-9 PM IST', day: 'Wednesday' },
    };
    const t = timings[category] ?? timings.default!;
    const checklist = [
      { item: 'Title optimized with keywords', status: 'ready' as const },
      { item: 'Description with hashtags and CTA', status: 'ready' as const },
      { item: 'Thumbnail uploaded', status: 'needs_work' as const },
      { item: 'End screen / cards configured', status: 'needs_work' as const },
      { item: 'Category and tags set', status: 'ready' as const },
      { item: 'Scheduled for optimal time', status: 'ready' as const },
      { item: 'Cross-platform captions prepared', status: 'needs_work' as const },
    ];
    const readinessScore = Math.round((checklist.filter(c => c.status === 'ready').length / checklist.length) * 100);
    return { bestUploadTime: t.time, bestDay: t.day, bestPlatform, exportProfile: { aspectRatio: '9:16', resolution: '1080x1920', fps: 24, codec: 'H.264' }, publishingChecklist: checklist, readinessScore };
  }
}
