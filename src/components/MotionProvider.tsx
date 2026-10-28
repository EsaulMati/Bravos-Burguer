"use client";

import { MotionConfig } from "motion/react";

/** Todas las animaciones de `motion` respetan la preferencia "reducir movimiento" del sistema. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
