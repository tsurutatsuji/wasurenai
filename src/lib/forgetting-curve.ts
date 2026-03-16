/**
 * エビングハウスの忘却曲線に基づくスペースドリピティション
 *
 * 復習スケジュール:
 * 1回目: 学習直後
 * 2回目: 1日後
 * 3回目: 3日後
 * 4回目: 7日後
 * 5回目: 14日後
 * 6回目: 30日後
 * 7回目: 60日後
 * → 以降は長期記憶に定着
 */

/** 復習間隔（日数） */
const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30, 60];

/** 記憶保持率を計算（0〜100%） */
export function calculateRetention(lastReviewedAt: string, reviewCount: number): number {
  const now = Date.now();
  const last = new Date(lastReviewedAt).getTime();
  const hoursSince = (now - last) / (1000 * 60 * 60);

  // エビングハウスの忘却曲線の近似式
  // R = e^(-t/S) where S = stability (復習回数で増加)
  const stability = Math.pow(2.5, reviewCount); // 復習するたびに安定性が2.5倍
  const retention = Math.exp(-hoursSince / (24 * stability));

  return Math.max(0, Math.min(100, Math.round(retention * 100)));
}

/** 次の復習までの時間を取得 */
export function getNextReviewDate(createdAt: string, reviewCount: number): Date {
  const created = new Date(createdAt);
  const intervalIndex = Math.min(reviewCount, REVIEW_INTERVALS.length - 1);
  const daysUntilNext = REVIEW_INTERVALS[intervalIndex];
  const next = new Date(created);
  next.setDate(next.getDate() + daysUntilNext);
  return next;
}

/** 復習が必要かどうか */
export function needsReview(lastReviewedAt: string, reviewCount: number): boolean {
  return calculateRetention(lastReviewedAt, reviewCount) < 80;
}

/** 復習の緊急度（0〜100、高いほど急ぎ） */
export function getUrgency(lastReviewedAt: string, reviewCount: number): number {
  const retention = calculateRetention(lastReviewedAt, reviewCount);
  return Math.max(0, 100 - retention);
}

/** 記憶状態のラベル */
export function getMemoryStatus(retention: number): { label: string; color: string } {
  if (retention >= 90) return { label: "しっかり覚えている", color: "#22c55e" };
  if (retention >= 70) return { label: "まだ覚えている", color: "#22d3ee" };
  if (retention >= 50) return { label: "あやしくなってきた", color: "#f59e0b" };
  if (retention >= 30) return { label: "かなり忘れかけている", color: "#f97316" };
  return { label: "ほぼ忘れている", color: "#ef4444" };
}
