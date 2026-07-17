"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { MessageAttachmentLightbox } from "./MessageAttachmentLightbox";

export function useMessageAttachmentLightbox() {
  const [expandedImagePath, setExpandedImagePath] = useState<string | null>(null);

  const openAttachmentLightbox = useCallback((imagePath: string) => {
    setExpandedImagePath(imagePath);
  }, []);

  const closeAttachmentLightbox = useCallback(() => {
    setExpandedImagePath(null);
  }, []);

  const attachmentLightboxOverlay = (
    <AnimatePresence>
      {expandedImagePath && (
        <MessageAttachmentLightbox
          imagePath={expandedImagePath}
          onCloseLightbox={closeAttachmentLightbox}
        />
      )}
    </AnimatePresence>
  );

  return {
    openAttachmentLightbox,
    attachmentLightboxOverlay,
  };
}
