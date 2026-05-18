import { useEffect, useRef, useState } from 'react';

const DESKTOP = () => window.matchMedia('(min-width: 768px)').matches;

export function useScrollDirection() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      if (DESKTOP()) { setVisible(true); return; }
      const y = window.scrollY;
      if (y < 10) { setVisible(true); return; }
      setVisible(y < lastY.current);
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return visible;
}
