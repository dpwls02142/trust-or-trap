"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiImageLine } from "@remixicon/react";
import type {
  BrowserPageRevealPhase,
  BrowserPageVariant,
} from "@/lib/phone/browser-scenario-page";
import { TypingIndicator } from "./TypingIndicator";

interface BrowserScenarioPagePanelProps {
  pageVariant: BrowserPageVariant;
  primaryActionLabel: string;
  loadingLabel: string;
  reverseImageProfilePath: string | null;
  reverseImageProfileName: string;
  pageNoticeText: string;
  isAwaitingResponse: boolean;
  isStreamingNotice: boolean;
  showPageNotice: boolean;
  pageRevealPhase: BrowserPageRevealPhase;
  onPrimaryPageAction: () => void;
}

/**
 * browser 앱 전용 — 시나리오 맥락에 맞는 가짜 웹 페이지 연출.
 * 플레이어가 페이지 안에서 주 행동을 한 뒤에만 결과·안내가 공개된다.
 */
export function BrowserScenarioPagePanel({
  pageVariant,
  primaryActionLabel,
  loadingLabel,
  reverseImageProfilePath,
  reverseImageProfileName,
  pageNoticeText,
  isAwaitingResponse,
  isStreamingNotice,
  showPageNotice,
  pageRevealPhase,
  onPrimaryPageAction,
}: BrowserScenarioPagePanelProps) {
  const isPageRevealed = pageRevealPhase === "revealed";
  const showPagePending =
    isPageRevealed && isAwaitingResponse && showPageNotice && !pageNoticeText;

  const sharedPageProps: InteractivePageProps = {
    primaryActionLabel,
    loadingLabel,
    pageNoticeText,
    showPagePending,
    showPageNotice: showPageNotice && isPageRevealed,
    isStreamingNotice,
    pageRevealPhase,
    onPrimaryPageAction,
  };

  return (
    <div className="phone-scroll flex-1 overflow-y-auto bg-white">
      <div className="px-4 py-5">
        {pageVariant === "reverse_image_search" && (
          <ReverseImageSearchPage
            {...sharedPageProps}
            reverseImageProfilePath={reverseImageProfilePath}
            reverseImageProfileName={reverseImageProfileName}
          />
        )}
        {pageVariant === "fake_government_portal" && (
          <FakeGovernmentPortalPage {...sharedPageProps} />
        )}
        {pageVariant === "fake_hts_portal" && (
          <FakeHtsPortalPage {...sharedPageProps} />
        )}
        {pageVariant === "open_chat_invite" && (
          <OpenChatInvitePage {...sharedPageProps} />
        )}
        {pageVariant === "generic_fake_site" && (
          <GenericFakeSitePage {...sharedPageProps} />
        )}
      </div>
    </div>
  );
}

interface InteractivePageProps {
  primaryActionLabel: string;
  loadingLabel: string;
  pageNoticeText: string;
  showPagePending: boolean;
  showPageNotice: boolean;
  isStreamingNotice: boolean;
  pageRevealPhase: BrowserPageRevealPhase;
  onPrimaryPageAction: () => void;
}

function ReverseImageSearchPage({
  primaryActionLabel,
  loadingLabel,
  reverseImageProfilePath,
  reverseImageProfileName,
  pageRevealPhase,
  onPrimaryPageAction,
}: InteractivePageProps & {
  reverseImageProfilePath: string | null;
  reverseImageProfileName: string;
}) {
  const isPageRevealed = pageRevealPhase === "revealed";
  const isPageLoading = pageRevealPhase === "loading";
  const selectedPhotoLabel = `프로필 사진 1장이 선택되었습니다.`;

  return (
    <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
      <p className="text-xs font-semibold text-black/50">이미지 검색</p>
      <h3 className="mt-1 text-sm font-bold text-black">
        {isPageRevealed ? "프로필 사진 일치 결과" : "프로필 사진 검색"}
      </h3>

      <div className="mt-4 flex gap-3">
        <ReverseImageProfileThumbnail
          profileImagePath={reverseImageProfilePath}
          profileDisplayName={reverseImageProfileName}
        />

        <AnimatePresence mode="wait">
          {isPageLoading && (
            <BrowserPageLoadingBlock
              key="loading"
              loadingLabel={loadingLabel}
              toneClassName="text-black/55"
            />
          )}

          {isPageRevealed && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-w-0 flex-1 text-xs leading-relaxed text-black/70"
            >
              <p className="font-semibold text-black/80">
                유사 이미지 다수 발견
              </p>
              <p className="mt-1">· 커뮤니티 게시글에 동일 사진</p>
              <p>· 해외 스톡/모델 사진 DB</p>
              <p>· 다른 SNS 계정 프로필</p>
            </motion.div>
          )}

          {!isPageRevealed && !isPageLoading && (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex min-w-0 flex-1 flex-col justify-center gap-2"
            >
              <p className="text-xs leading-relaxed text-black/50">
                {selectedPhotoLabel}
              </p>
              <BrowserPrimaryActionButton
                actionLabel={primaryActionLabel}
                onActionClick={onPrimaryPageAction}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isPageRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-black/10 bg-neutral-50 p-3 text-xs leading-relaxed text-black/70"
          >
            동일한 사진이 여러 계정·게시글에서 발견되었습니다.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FakeGovernmentPortalPage({
  primaryActionLabel,
  loadingLabel,
  pageNoticeText,
  showPagePending,
  showPageNotice,
  isStreamingNotice,
  pageRevealPhase,
  onPrimaryPageAction,
}: InteractivePageProps) {
  const [citizenNameInput, setCitizenNameInput] = useState("");
  const [residentIdInput, setResidentIdInput] = useState("");
  const isPageRevealed = pageRevealPhase === "revealed";
  const isPageLoading = pageRevealPhase === "loading";
  const isFormLocked = isPageRevealed || isPageLoading;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10">
      <div className="bg-blue-800 px-4 py-3 text-white">
        <p className="text-[10px] text-white/70">국가사건 통합조회</p>
        <h3 className="text-sm font-bold">사건 진행 현황 확인</h3>
      </div>

      <div className="relative space-y-3 bg-white p-4">
        {showPageNotice && (pageNoticeText || showPagePending) && (
          <PageNoticeBlock
            pageNoticeText={pageNoticeText}
            showPagePending={showPagePending}
            noticeLabel="안내"
            isStreamingNotice={isStreamingNotice}
          />
        )}

        <div className="space-y-2">
          <label
            htmlFor="fake-portal-citizen-name"
            className="block text-[11px] font-medium text-black/50"
          >
            성명
          </label>
          <input
            id="fake-portal-citizen-name"
            type="text"
            value={isPageRevealed ? "홍길동 (예시)" : citizenNameInput}
            onChange={(changeEvent) => setCitizenNameInput(changeEvent.target.value)}
            placeholder="이름을 입력하세요"
            readOnly={isFormLocked}
            autoComplete="off"
            className="w-full rounded-lg border border-black/15 bg-neutral-50 px-3 py-2 text-sm text-black outline-none read-only:text-black/55 placeholder:text-black/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 read-only:focus:border-black/15 read-only:focus:ring-0"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="fake-portal-resident-id"
            className="block text-[11px] font-medium text-black/50"
          >
            주민등록번호
          </label>
          <input
            id="fake-portal-resident-id"
            type="text"
            inputMode="numeric"
            value={isPageRevealed ? "000000 - *******" : residentIdInput}
            onChange={(changeEvent) => setResidentIdInput(changeEvent.target.value)}
            placeholder="앞 6자리 - 뒤 7자리"
            readOnly={isFormLocked}
            autoComplete="off"
            className="w-full rounded-lg border border-black/15 bg-neutral-50 px-3 py-2 text-sm text-black outline-none read-only:text-black/55 placeholder:text-black/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 read-only:focus:border-black/15 read-only:focus:ring-0"
          />
        </div>

        {isPageLoading ? (
          <BrowserPageLoadingBlock
            loadingLabel={loadingLabel}
            toneClassName="text-blue-800/70"
            compact
          />
        ) : isPageRevealed ? (
          <div className="rounded-lg bg-blue-700 py-2.5 text-center text-sm font-semibold text-white opacity-80">
            조회 완료
          </div>
        ) : (
          <BrowserPrimaryActionButton
            actionLabel={primaryActionLabel}
            onActionClick={onPrimaryPageAction}
            toneClassName="bg-blue-700 hover:bg-blue-800"
          />
        )}
      </div>
    </div>
  );
}

function FakeHtsPortalPage({
  primaryActionLabel,
  loadingLabel,
  pageNoticeText,
  showPagePending,
  showPageNotice,
  isStreamingNotice,
  pageRevealPhase,
  onPrimaryPageAction,
}: InteractivePageProps) {
  const isPageRevealed = pageRevealPhase === "revealed";
  const isPageLoading = pageRevealPhase === "loading";

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10">
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-4 py-3 text-white">
        <p className="text-[10px] text-white/70">VIP HTS 전용</p>
        <h3 className="text-sm font-bold">실시간 수익 체험 프로그램</h3>
      </div>

      <div className="space-y-3 bg-white p-4">
        {showPageNotice && (pageNoticeText || showPagePending) && (
          <PageNoticeBlock
            pageNoticeText={pageNoticeText}
            showPagePending={showPagePending}
            noticeLabel="이벤트 안내"
            isStreamingNotice={isStreamingNotice}
          />
        )}

        <AnimatePresence mode="wait">
          {isPageLoading && (
            <BrowserPageLoadingBlock
              key="loading"
              loadingLabel={loadingLabel}
              toneClassName="text-indigo-700/70"
              compact
            />
          )}

          {isPageRevealed && (
            <motion.div
              key="profit"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border border-black/10 bg-neutral-50 p-3"
            >
              <p className="text-[11px] text-black/55">
                체험 계좌 수익
              </p>
              <p className="mt-1 text-xl font-bold text-black">
                +847,200원
              </p>
              <p className="mt-0.5 text-[10px] text-black/45">
                소액 입금 후 30분
              </p>
            </motion.div>
          )}

          {!isPageRevealed && !isPageLoading && (
            <motion.div
              key="teaser"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 p-4 text-center"
            >
              <p className="text-xs text-indigo-900/70">
                설치 후 체험 계좌 수익 화면이 표시됩니다
              </p>
              <div className="mt-3">
                <BrowserPrimaryActionButton
                  actionLabel={primaryActionLabel}
                  onActionClick={onPrimaryPageAction}
                  toneClassName="bg-indigo-600 hover:bg-indigo-700"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isPageRevealed && (
          <div className="rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white">
            전용 앱 설치하기
          </div>
        )}
      </div>
    </div>
  );
}

function OpenChatInvitePage({
  primaryActionLabel,
  loadingLabel,
  pageRevealPhase,
  onPrimaryPageAction,
}: InteractivePageProps) {
  const isPageRevealed = pageRevealPhase === "revealed";
  const isPageLoading = pageRevealPhase === "loading";

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10">
      <div className="bg-gradient-to-r from-amber-400 to-yellow-400 px-4 py-3 text-black">
        <p className="text-[10px] font-medium text-black/60">오픈채팅 초대</p>
        <h3 className="text-sm font-bold">VIP투자연구소 💰 무료 리딩방</h3>
      </div>

      <div className="space-y-3 bg-white p-4">
        <div className="rounded-xl border border-black/10 bg-neutral-50 p-3 text-xs leading-relaxed text-black/80">
          <p className="font-semibold">open-room.vip-invest.link/join</p>
          <p className="mt-1 text-[11px] text-black/55">
            수익률 300% · 무료 VIP · 248명 참여 중
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isPageLoading && (
            <BrowserPageLoadingBlock
              key="loading"
              loadingLabel={loadingLabel}
              toneClassName="text-amber-800/70"
              compact
            />
          )}

          {isPageRevealed && (
            <motion.div
              key="joined"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-black/10 bg-neutral-50 p-3 text-xs leading-relaxed text-black/80"
            >
              <p className="font-semibold">채팅방 입장 완료</p>
              <p className="mt-1">토크 앱 오픈채팅방으로 연결되었습니다.</p>
            </motion.div>
          )}

          {!isPageRevealed && !isPageLoading && (
            <motion.div key="enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <BrowserPrimaryActionButton
                actionLabel={primaryActionLabel}
                onActionClick={onPrimaryPageAction}
                toneClassName="bg-amber-500 hover:bg-amber-600"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GenericFakeSitePage({
  primaryActionLabel,
  loadingLabel,
  pageNoticeText,
  showPagePending,
  showPageNotice,
  isStreamingNotice,
  pageRevealPhase,
  onPrimaryPageAction,
}: InteractivePageProps) {
  const isPageRevealed = pageRevealPhase === "revealed";
  const isPageLoading = pageRevealPhase === "loading";

  return (
    <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
      <p className="text-xs font-semibold text-black/50">안내 페이지</p>
      <h3 className="mt-1 text-sm font-bold text-black">
        본인 확인이 필요합니다
      </h3>

      {!isPageRevealed && (
        <div className="mt-4 rounded-xl border border-dashed border-black/15 bg-white p-4 text-center">
          {isPageLoading ? (
            <BrowserPageLoadingBlock
              loadingLabel={loadingLabel}
              toneClassName="text-black/55"
              compact
            />
          ) : (
            <BrowserPrimaryActionButton
              actionLabel={primaryActionLabel}
              onActionClick={onPrimaryPageAction}
            />
          )}
        </div>
      )}

      {isPageRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2 rounded-xl border border-black/10 bg-neutral-50 p-3 text-xs leading-relaxed text-black/70"
        >
          <p>본인 확인을 위해 계좌·카드 정보 입력이 요구됩니다.</p>
        </motion.div>
      )}

      {showPageNotice && (pageNoticeText || showPagePending) && (
        <div className="mt-4">
          <PageNoticeBlock
            pageNoticeText={pageNoticeText}
            showPagePending={showPagePending}
            noticeLabel="페이지 안내"
            isStreamingNotice={isStreamingNotice}
          />
        </div>
      )}
    </div>
  );
}

function ReverseImageProfileThumbnail({
  profileImagePath,
  profileDisplayName,
}: {
  profileImagePath: string | null;
  profileDisplayName: string;
}) {
  return (
    <div className="flex h-20 w-20 shrink-0 flex-col items-center">
      <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-black/10 bg-gradient-to-br from-slate-200 to-slate-300">
        {profileImagePath ? (
          <img
            src={profileImagePath}
            alt={`${profileDisplayName} 프로필 사진`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center border border-dashed border-black/15">
            <span className="text-black/30" aria-hidden>
              <RiImageLine size={28} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function BrowserPrimaryActionButton({
  actionLabel,
  onActionClick,
  toneClassName = "bg-sky-600 hover:bg-sky-700",
}: {
  actionLabel: string;
  onActionClick: () => void;
  toneClassName?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onActionClick}
      className={`w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${toneClassName}`}
    >
      {actionLabel}
    </motion.button>
  );
}

function BrowserPageLoadingBlock({
  loadingLabel,
  toneClassName,
  compact = false,
}: {
  loadingLabel: string;
  toneClassName: string;
  compact?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-2 ${compact ? "justify-center py-2" : "min-w-0 flex-1 py-3"}`}
      role="status"
      aria-live="polite"
    >
      <TypingIndicator dotColorClass="bg-black/35" />
      <span className={`text-xs ${toneClassName}`}>{loadingLabel}</span>
    </motion.div>
  );
}

function PageNoticeBlock({
  pageNoticeText,
  showPagePending,
  noticeLabel,
  isStreamingNotice,
}: {
  pageNoticeText: string;
  showPagePending: boolean;
  noticeLabel: string;
  isStreamingNotice: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-black/10 bg-neutral-50 p-3"
    >
      <p className="text-[11px] font-semibold text-black/50">{noticeLabel}</p>
      {showPagePending ? (
        <div className="mt-2 flex items-center gap-2 text-xs text-black/50">
          <TypingIndicator />
          페이지를 불러오는 중...
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-black/80">
          {pageNoticeText}
          {isStreamingNotice && (
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
              aria-hidden
            >
              ▍
            </motion.span>
          )}
        </p>
      )}
    </motion.div>
  );
}
