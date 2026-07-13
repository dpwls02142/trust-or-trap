"use client";

import { motion } from "framer-motion";
import type { SenderProfileView } from "@/lib/scenario/sender-profile";

interface InstaProfileFeedProps {
  profileView: SenderProfileView;
  onCloseProfile: () => void;
}

/**
 * 포토그램(인스타) 프로필 + 그리드 피드 화면.
 * DM 헤더에서 프로필을 탭하면 전체 화면으로 슬라이드 인한다.
 */
export function InstaProfileFeed({
  profileView,
  onCloseProfile,
}: InstaProfileFeedProps) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      className="absolute inset-0 z-20 flex flex-col bg-white pt-10"
    >
      <header className="flex items-center gap-3 border-b border-black/10 px-3 py-2.5">
        <button
          type="button"
          onClick={onCloseProfile}
          aria-label="DM으로 돌아가기"
          className="rounded-full p-1.5 text-lg hover:bg-black/5"
        >
          ←
        </button>
        <h2 className="text-sm font-semibold text-black">
          {profileView.handleName}
        </h2>
      </header>

      <div className="phone-scroll flex-1 overflow-y-auto">
        <div className="flex items-center gap-4 px-4 py-4">
          {profileView.avatarPath ? (
            <img
              src={profileView.avatarPath}
              alt={`${profileView.displayName} 프로필`}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 text-3xl">
              👤
            </span>
          )}
          <div className="grid flex-1 grid-cols-3 text-center text-sm">
            <div>
              <p className="font-semibold text-black">
                {profileView.postCount}
              </p>
              <p className="text-[11px] text-black/50">게시물</p>
            </div>
            <div>
              <p className="font-semibold text-black">
                {profileView.followerCount.toLocaleString()}
              </p>
              <p className="text-[11px] text-black/50">팔로워</p>
            </div>
            <div>
              <p className="font-semibold text-black">
                {profileView.followingCount.toLocaleString()}
              </p>
              <p className="text-[11px] text-black/50">팔로잉</p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-3">
          <p className="text-sm font-semibold text-black">
            {profileView.displayName}
          </p>
          <p className="mt-1 text-sm text-black/70">{profileView.bioText}</p>
        </div>

        <div className="grid grid-cols-3 gap-0.5">
          {profileView.feedPosts.map((postItem) => (
            <button
              key={postItem.postId}
              type="button"
              className="group relative aspect-square overflow-hidden bg-neutral-100"
              aria-label={`게시물: ${postItem.captionText}`}
            >
              {profileView.avatarPath ? (
                <img
                  src={profileView.avatarPath}
                  alt=""
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl text-black/30">
                  📷
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                ♥ {postItem.likeCount}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
