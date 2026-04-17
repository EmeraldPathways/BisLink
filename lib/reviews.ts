import type { ReviewBreakdownPoint, ReviewRecord } from '@/types';

export function getReviewBreakdownFromReviews(reviews: ReviewRecord[]): ReviewBreakdownPoint[] {
  const published = reviews.filter((review) => review.is_published);
  const total = published.length || 1;
  return [5, 4, 3, 2, 1].map((rating) => {
    const count = published.filter((review) => review.rating === rating).length;
    return { rating, count, percent: count / total };
  });
}

export function getReviewSummaryFromReviews(reviews: ReviewRecord[]) {
  const published = reviews.filter((review) => review.is_published);
  const publishedCount = published.length;
  const verifiedCount = published.filter((review) => review.is_verified).length;
  const average = published.reduce((sum, review) => sum + review.rating, 0) / Math.max(publishedCount, 1);

  return {
    publishedCount,
    verifiedCount,
    average
  };
}
