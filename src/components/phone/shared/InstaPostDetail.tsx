"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RiChat3Line, RiHeartFill, RiHeartLine } from "@remixicon/react";
import type { PhotogramHomePost } from "@/lib/phone/photogram-home-feed";
import { AppBackButton } from "./AppBackButton";

interface InstaPostDetailProps {
  postView: PhotogramHomePost;
  onClosePost: () => void;
}

interface PostLikeState {
  isLiked: boolean;
  likeCount: number;
}

/**
 * 포토그램(인스타) 게시물 상세 화면.
 * 홈 탐색 피드 그리드에서 게시물을 탭하면 전체 화면으로 슬라이드 인한다.
 */
export function InstaPostDetail({
  postView,
  onClosePost,
}: InstaPostDetailProps) {
  const [postLikeState, setPostLikeState] = useState<PostLikeState>({
    isLiked: false,
    likeCount: postView.likeCount,
  });

  const handleToggleLike = () => {
    setPostLikeState((previousState) => ({
      isLiked: !previousState.isLiked,
      likeCount: previousState.isLiked
        ? previousState.likeCount - 1
        : previousState.likeCount + 1,
    }));
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      className="absolute inset-0 z-20 flex w-full min-w-0 flex-col bg-white pt-10"
    >
      <header className="flex min-w-0 items-center gap-3 border-b border-black/10 px-3 py-2.5">
        <AppBackButton onBack={onClosePost} ariaLabel="게시물 닫기" />
        <h2 className="min-w-0 truncate text-sm font-semibold text-black">
          {postView.authorHandle}
        </h2>
      </header>

      <div className="phone-scroll min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="relative w-full min-w-0 shrink-0 overflow-hidden bg-neutral-100">
          <div className="relative aspect-square w-full">
            <img
              src={postView.imagePath}
              alt={postView.captionText}
              className="absolute inset-0 block h-full w-full max-w-none object-cover object-center"
            />
          </div>
        </div>

        <div className="min-w-0 px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggleLike}
              aria-label={postLikeState.isLiked ? "좋아요 취소" : "좋아요"}
              aria-pressed={postLikeState.isLiked}
              className="text-black transition active:scale-95"
            >
              {postLikeState.isLiked ? (
                <RiHeartFill size={24} className="text-red-500" aria-hidden />
              ) : (
                <RiHeartLine size={24} aria-hidden />
              )}
            </button>
            <span className="text-black" aria-hidden>
              <RiChat3Line size={24} />
            </span>
          </div>

          <p className="mt-2 text-sm font-semibold text-black">
            좋아요 {postLikeState.likeCount.toLocaleString()}개
          </p>

          <p className="mt-1.5 wrap-break-word text-sm text-black">
            <span className="font-semibold">{postView.authorHandle}</span>{" "}
            {postView.captionText}
          </p>

          <p className="mt-1 text-[11px] uppercase text-black/40">
            {postView.postedAtLabel}
          </p>

          {postView.comments.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-black/5 pt-3">
              {postView.comments.map((commentItem) => (
                <li
                  key={commentItem.commentId}
                  className="wrap-break-word text-sm text-black"
                >
                  <span className="font-semibold">
                    {commentItem.authorHandle}
                  </span>{" "}
                  {commentItem.commentText}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}
