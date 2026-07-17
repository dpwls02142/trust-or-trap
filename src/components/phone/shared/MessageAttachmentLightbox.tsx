"use client";

import { motion } from "framer-motion";

interface MessageAttachmentLightboxProps {
  imagePath: string;
  onCloseLightbox: () => void;
}

/** 메시지 첨부 사진 탭 시 전체 화면 확대 뷰 */
export function MessageAttachmentLightbox({
  imagePath,
  onCloseLightbox,
}: MessageAttachmentLightboxProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col bg-black/92"
      role="dialog"
      aria-modal="true"
      aria-label="사진 확대 보기"
      onClick={onCloseLightbox}
    >
      <div className="flex shrink-0 justify-end px-3 pb-2 pt-2">
        <button
          type="button"
          onClick={onCloseLightbox}
          className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/25"
        >
          닫기
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 items-center justify-center px-4 pb-6"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          src={imagePath}
          alt="보낸 사진 확대"
          className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          onClick={onCloseLightbox}
        />
      </div>
    </motion.div>
  );
}
