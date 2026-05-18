import { useLayoutEffect, useRef } from 'react';

export function useFlipAnimation(list) {
  const listRef = useRef(null);
  const prevPositions = useRef({});

  useLayoutEffect(() => {
    if (!listRef.current) return;
    const children = Array.from(listRef.current.children);
    const newPositions = {};

    const containerTop = listRef.current.getBoundingClientRect().top;
    children.forEach((child) => {
      const name = child.dataset.section;
      newPositions[name] = child.getBoundingClientRect().top - containerTop;
      const prev = prevPositions.current[name];
      if (prev != null) {
        const delta = prev - newPositions[name];
        if (Math.abs(delta) > 1) {
          child.style.transition = 'none';
          child.style.transform = `translateY(${delta}px)`;
        }
      }
    });

    // eslint-disable-next-line no-unused-expressions
    listRef.current.offsetHeight; // force reflow before animating

    children.forEach((child) => {
      if (child.style.transform) {
        child.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        child.style.transform = '';
      }
    });

    prevPositions.current = newPositions;
  }, [list]);

  return listRef;
}
