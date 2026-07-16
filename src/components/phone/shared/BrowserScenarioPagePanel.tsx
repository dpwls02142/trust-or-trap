"use client";

import { motion } from "framer-motion";
import type { BrowserPageVariant } from "@/lib/phone/browser-scenario-page";
import { TypingIndicator } from "./TypingIndicator";

interface BrowserScenarioPagePanelProps {
  pageVariant: BrowserPageVariant;
  entryContextText: string;
  pageNoticeText: string;
  isAwaitingResponse: boolean;
  isStreamingNotice: boolean;
  showPageNotice: boolean;
}

/**
 * browser 앱 전용 — 시나리오 맥락에 맞는 가짜 웹 페이지 연출.
 * 상대방 대화(말풍선)가 아닌 사이트·검색 결과 UI로 위험 신호를 보여준다.
 */
export function BrowserScenarioPagePanel({
  pageVariant,
  entryContextText,
  pageNoticeText,
  isAwaitingResponse,
  isStreamingNotice,
  showPageNotice,
}: BrowserScenarioPagePanelProps) {
  const showPagePending = isAwaitingResponse && showPageNotice && !pageNoticeText;

  return (
    <div className="phone-scroll flex-1 overflow-y-auto bg-white">
      <div className="border-b border-sky-100 bg-sky-50 px-4 py-3">
        <p className="text-[11px] leading-relaxed text-sky-900">{entryContextText}</p>
      </div>

      <div className="px-4 py-5">
        {pageVariant === "reverse_image_search" && <ReverseImageSearchPage />}
        {pageVariant === "fake_government_portal" && (
          <FakeGovernmentPortalPage
            pageNoticeText={pageNoticeText}
            showPagePending={showPagePending}
            showPageNotice={showPageNotice}
            isStreamingNotice={isStreamingNotice}
          />
        )}
        {pageVariant === "fake_hts_portal" && (
          <FakeHtsPortalPage
            pageNoticeText={pageNoticeText}
            showPagePending={showPagePending}
            showPageNotice={showPageNotice}
            isStreamingNotice={isStreamingNotice}
          />
        )}
        {pageVariant === "generic_fake_site" && (
          <GenericFakeSitePage
            pageNoticeText={pageNoticeText}
            showPagePending={showPagePending}
            showPageNotice={showPageNotice}
            isStreamingNotice={isStreamingNotice}
          />
        )}
      </div>
    </div>
  );
}

function ReverseImageSearchPage() {
  return (
    <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
      <p className="text-xs font-semibold text-black/50">역이미지 검색</p>
      <h3 className="mt-1 text-sm font-bold text-black">프로필 사진 일치 결과</h3>

      <div className="mt-4 flex gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-2xl">
          🖼️
        </div>
        <div className="min-w-0 flex-1 text-xs leading-relaxed text-black/70">
          <p className="font-semibold text-amber-700">유사 이미지 다수 발견</p>
          <p className="mt-1">· 커뮤니티 게시글에 동일 사진</p>
          <p>· 해외 스톡/모델 사진 DB</p>
          <p>· 다른 SNS 계정 프로필</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
        동일한 사진이 여러 계정·게시글에서 발견되었습니다. 본인 사진이 아닐 가능성이
        높습니다.
      </div>

      <p className="mt-6 text-center text-[11px] text-black/35">
        검색 결과는 참고용이며 공식 신원 확인이 아닙니다
      </p>
    </div>
  );
}

interface PageNoticeProps {
  pageNoticeText: string;
  showPagePending: boolean;
  showPageNotice: boolean;
  isStreamingNotice: boolean;
}

function FakeGovernmentPortalPage({
  pageNoticeText,
  showPagePending,
  showPageNotice,
  isStreamingNotice,
}: PageNoticeProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10">
      <div className="bg-blue-800 px-4 py-3 text-white">
        <p className="text-[10px] text-white/70">국가사건 통합조회</p>
        <h3 className="text-sm font-bold">사건 진행 현황 확인</h3>
      </div>

      <div className="space-y-3 bg-white p-4">
        {(showPageNotice && (pageNoticeText || showPagePending)) && (
          <PageNoticeBlock
            pageNoticeText={pageNoticeText}
            showPagePending={showPagePending}
            noticeLabel="안내"
            isStreamingNotice={isStreamingNotice}
          />
        )}

        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-black/50">성명</label>
          <div className="rounded-lg border border-black/15 bg-neutral-50 px-3 py-2 text-sm text-black/30">
            이름을 입력하세요
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-black/50">
            주민등록번호
          </label>
          <div className="rounded-lg border border-black/15 bg-neutral-50 px-3 py-2 text-sm text-black/30">
            앞 6자리 - 뒤 7자리
          </div>
        </div>
        <div className="rounded-lg bg-blue-700 py-2.5 text-center text-sm font-semibold text-white">
          조회하기
        </div>
      </div>

      <p className="border-t border-black/5 bg-neutral-50 px-4 py-2 text-center text-[10px] text-black/35">
        이 페이지는 공식 정부 사이트가 아닙니다
      </p>
    </div>
  );
}

function FakeHtsPortalPage({
  pageNoticeText,
  showPagePending,
  showPageNotice,
  isStreamingNotice,
}: PageNoticeProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10">
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-4 py-3 text-white">
        <p className="text-[10px] text-white/70">VIP HTS 전용</p>
        <h3 className="text-sm font-bold">실시간 수익 체험 프로그램</h3>
      </div>

      <div className="space-y-3 bg-white p-4">
        {(showPageNotice && (pageNoticeText || showPagePending)) && (
          <PageNoticeBlock
            pageNoticeText={pageNoticeText}
            showPagePending={showPagePending}
            noticeLabel="이벤트 안내"
            isStreamingNotice={isStreamingNotice}
          />
        )}

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-[11px] text-emerald-800">체험 계좌 수익 (가짜 화면)</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">+847,200원</p>
          <p className="mt-0.5 text-[10px] text-emerald-600/70">소액 입금 후 30분</p>
        </div>

        <div className="rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white">
          전용 앱 설치하기
        </div>
        <p className="text-center text-[10px] text-black/40">
          공식 앱스토어가 아닌 링크입니다
        </p>
      </div>
    </div>
  );
}

function GenericFakeSitePage({
  pageNoticeText,
  showPagePending,
  showPageNotice,
  isStreamingNotice,
}: PageNoticeProps) {
  return (
    <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
      <p className="text-xs font-semibold text-black/50">안내 페이지</p>
      <h3 className="mt-1 text-sm font-bold text-black">본인 확인이 필요합니다</h3>

      {(showPageNotice && (pageNoticeText || showPagePending)) && (
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
    <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
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
    </div>
  );
}
