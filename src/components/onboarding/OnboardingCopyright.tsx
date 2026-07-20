"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function OnboardingCopyright() {
  const [isCreditPopupOpen, setIsCreditPopupOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsCreditPopupOpen(true)}
        className="text-xs text-white/40"
      >
        © 효과음 · BGM 출처
      </button>

      <AnimatePresence>
        {isCreditPopupOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="출처 팝업 닫기"
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCreditPopupOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="musmus-credit-title"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="fixed inset-x-6 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl"
            >
              <h2 id="musmus-credit-title" className="text-base font-semibold">
                음악·효과음 출처
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                본 게임의 알림·전화 효과음은 아래 MusMus(むすむす)의 프리
                音楽素材를 사용했습니다.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a
                    href="http://musmus.main.jp/info.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 underline underline-offset-2"
                  >
                    MusMus利用規約
                  </a>
                </li>
                <li>
                  <a
                    href="http://musmus.main.jp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 underline underline-offset-2"
                  >
                    BGM・フリー音楽素材 MusMus
                  </a>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => setIsCreditPopupOpen(false)}
                className="mt-6 w-full rounded-xl bg-white/10 py-2.5 text-sm font-medium transition hover:bg-white/15"
              >
                확인
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
