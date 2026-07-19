"use client";

import { motion, AnimatePresence } from "framer-motion";
import type {
  BrowserPageRevealPhase,
  BrowserPageVariant,
} from "@/lib/phone/browser-scenario-page";
import { TypingIndicator } from "./TypingIndicator";

interface BrowserScenarioPagePanelProps {
  pageVariant: BrowserPageVariant;
  entryContextText: string;
  primaryActionLabel: string;
  preRevealHint: string;
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
  entryContextText,
  primaryActionLabel,
  preRevealHint,
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
    preRevealHint,
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
      <div className="border-b border-sky-100 bg-sky-50 px-4 py-3">
        <p className="text-[11px] leading-relaxed text-sky-900">
          {entryContextText}
        </p>
      </div>

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
        {pageVariant === "generic_fake_site" && (
          <GenericFakeSitePage {...sharedPageProps} />
        )}
      </div>
    </div>
  );
}

interface InteractivePageProps {
  primaryActionLabel: string;
  preRevealHint: string;
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
  preRevealHint,
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

      {!isPageRevealed && (
        <p className="mt-2 text-[11px] leading-relaxed text-black/45">
          {preRevealHint}
        </p>
      )}

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
              <p className="font-semibold text-amber-700">
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
            className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"
          >
            동일한 사진이 여러 계정·게시글에서 발견되었습니다. 본인 사진이 아닐
            가능성이 높습니다.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FakeGovernmentPortalPage({
  primaryActionLabel,
  preRevealHint,
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
      <div className="bg-blue-800 px-4 py-3 text-white">
        <p className="text-[10px] text-white/70">국가사건 통합조회</p>
        <h3 className="text-sm font-bold">사건 진행 현황 확인</h3>
      </div>

      <div className="relative space-y-3 bg-white p-4">
        {!isPageRevealed && (
          <p className="text-[11px] leading-relaxed text-black/45">
            {preRevealHint}
          </p>
        )}

        {showPageNotice && (pageNoticeText || showPagePending) && (
          <PageNoticeBlock
            pageNoticeText={pageNoticeText}
            showPagePending={showPagePending}
            noticeLabel="안내"
            isStreamingNotice={isStreamingNotice}
          />
        )}

        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-black/50">
            성명
          </label>
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              isPageRevealed
                ? "border-red-200 bg-red-50 text-black/55"
                : "border-black/15 bg-neutral-50 text-black/30"
            }`}
          >
            {isPageRevealed ? "홍길동 (예시)" : "이름을 입력하세요"}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-black/50">
            주민등록번호
          </label>
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              isPageRevealed
                ? "border-red-200 bg-red-50 text-black/55"
                : "border-black/15 bg-neutral-50 text-black/30"
            }`}
          >
            {isPageRevealed ? "000000 - *******" : "앞 6자리 - 뒤 7자리"}
          </div>
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

      <p className="border-t border-black/5 bg-neutral-50 px-4 py-2 text-center text-[10px] text-black/35">
        이 페이지는 공식 정부 사이트가 아닙니다
      </p>
    </div>
  );
}

function FakeHtsPortalPage({
  primaryActionLabel,
  preRevealHint,
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
        {!isPageRevealed && (
          <p className="text-[11px] leading-relaxed text-black/45">
            {preRevealHint}
          </p>
        )}

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
              className="rounded-xl border border-emerald-100 bg-emerald-50 p-3"
            >
              <p className="text-[11px] text-emerald-800">
                체험 계좌 수익 (가짜 화면)
              </p>
              <p className="mt-1 text-xl font-bold text-emerald-700">
                +847,200원
              </p>
              <p className="mt-0.5 text-[10px] text-emerald-600/70">
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
          <>
            <div className="rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white">
              전용 앱 설치하기
            </div>
            <p className="text-center text-[10px] text-black/40">
              공식 앱스토어가 아닌 링크입니다
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function GenericFakeSitePage({
  primaryActionLabel,
  preRevealHint,
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
        <>
          <p className="mt-3 text-[11px] leading-relaxed text-black/45">
            {preRevealHint}
          </p>
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
        </>
      )}

      {isPageRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-xs leading-relaxed text-red-900"
        >
          본인 확인을 위해 계좌·카드 정보 입력이 요구됩니다. 공식 채널인지 다시
          확인하세요.
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

      <p className="mt-6 text-center text-[11px] text-black/35">
        이 페이지는 공식 사이트가 아닙니다
      </p>
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
            <span className="text-2xl" aria-hidden>
              🖼️
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
      className="rounded-xl border border-amber-100 bg-amber-50 p-3"
    >
      <p className="text-[11px] font-semibold text-amber-800">{noticeLabel}</p>
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
