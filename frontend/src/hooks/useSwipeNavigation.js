import { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_ORDER = ['/', '/activity', '/art', '/roster'];
const SWIPE_THRESHOLD = 50;

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const startX = useRef(null);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (startX.current === null) return;
    const delta = e.changedTouches[0].clientX - startX.current;
    startX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;

    const currentIndex = PAGE_ORDER.findIndex((p) =>
      p === '/' ? pathname === '/' : pathname.startsWith(p)
    );
    if (currentIndex === -1) return;

    const nextIndex = currentIndex + (delta < 0 ? 1 : -1);
    if (nextIndex >= 0 && nextIndex < PAGE_ORDER.length) {
      navigate(PAGE_ORDER[nextIndex]);
    }
  };

  return { onTouchStart, onTouchEnd };
}
