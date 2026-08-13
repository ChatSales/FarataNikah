"use client";

import { useEffect, type RefObject } from "react";

// Closes a menu/popup when the user clicks or taps anywhere outside it —
// missing across every dropdown in the app (notifications, profile menu,
// block/report menu, mobile nav drawers), so factored into one hook rather
// than re-implemented per component.
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutsideClick: () => void,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;

    function handlePointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, onOutsideClick, active]);
}
