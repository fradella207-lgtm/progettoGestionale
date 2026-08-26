import { useEffect, useRef } from 'react';

interface UseSwipeBackOptions {
  onBack: () => void;
  enabled?: boolean;
  edgeOnly?: boolean; // if true, gesture must start in the left edge (e.g. 0-90px)
  threshold?: number; // minimum distance in px to trigger back (default: 70)
}

/**
 * Custom hook to enable touch swipe right gesture to go back or close modals.
 * Also handles horizontal drag detection to prevent interfering with vertical scrolling.
 */
export function useSwipeBack({
  onBack,
  enabled = true,
  edgeOnly = false,
  threshold = 70
}: UseSwipeBackOptions) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      
      // If edgeOnly, check if start is within left 90px
      if (edgeOnly && touch.clientX > 90) {
        touchStartRef.current = null;
        return;
      }

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1) {
        touchStartRef.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      touchStartRef.current = null;

      // Swiped right by at least `threshold` px, horizontal travel significantly larger than vertical travel, and in under 650ms
      if (
        deltaX > threshold &&
        Math.abs(deltaY) < Math.abs(deltaX) * 0.75 &&
        Math.abs(deltaY) < 100 &&
        deltaTime < 650
      ) {
        onBackRef.current();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, edgeOnly, threshold]);
}
