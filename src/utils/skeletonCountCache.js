// utils/skeletonCountCache.js
// Self-correcting skeleton count cache using sessionStorage.
// First load uses a fallback; every subsequent load uses the exact real count.

const STORAGE_KEY = 'lernx-skeleton-counts';

export const getSkeletonCount = (pageKey, fallback) => {
  try {
    const cache = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    return typeof cache[pageKey] === 'number' ? cache[pageKey] : fallback;
  } catch {
    return fallback;
  }
};

export const saveSkeletonCount = (pageKey, count) => {
  try {
    if (typeof count !== 'number' || count < 1) return;
    const cache = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    cache[pageKey] = count;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {}
};
