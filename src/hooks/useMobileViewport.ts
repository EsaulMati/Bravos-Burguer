"use client";

import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

export function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const legacyMedia = media as MediaQueryList & {
      addListener: (listener: () => void) => void;
      removeListener: (listener: () => void) => void;
    };
    const update = () => setIsMobile(media.matches);
    update();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    if (typeof legacyMedia.addListener === "function") {
      legacyMedia.addListener(update);
      return () => legacyMedia.removeListener(update);
    }
    return undefined;
  }, []);

  return isMobile;
}
