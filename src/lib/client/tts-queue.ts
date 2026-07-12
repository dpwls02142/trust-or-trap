"use client";

import type { ScenarioId } from "@/lib/scenario/types";

/**
 * 문장 단위 TTS 재생 큐 (통화(call) 앱 전용).
 * 대사 생성이 끝난 뒤 문장들을 받아 순서대로 재생한다.
 *
 * 성능/안정성: Typecast는 짧은 시간에 요청이 몰리면 429를 반환하므로
 * fetch를 병렬로 쏘지 않고 동시 요청을 최대 1개로 유지한다.
 * 대신 현재 문장을 재생하는 동안 다음 문장을 미리 요청(one-ahead prefetch)해
 * 문장 사이의 공백을 최소화한다.
 */

interface PendingSentence {
  sentenceText: string;
  previousText: string;
}

export class SentenceTtsQueue {
  private pendingSentences: PendingSentence[] = [];
  private isDraining = false;
  private activeAudioElement: HTMLAudioElement | null = null;
  private isDisposed = false;

  constructor(private readonly scenarioId: ScenarioId) {}

  enqueueSentence(sentenceText: string, previousText: string): void {
    if (this.isDisposed) return;
    this.pendingSentences.push({ sentenceText, previousText });
    void this.drainQueue();
  }

  private async fetchSentenceAudio(pendingItem: PendingSentence): Promise<Blob | null> {
    try {
      const ttsResponse = await fetch("/api/tts/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: this.scenarioId,
          sentenceText: pendingItem.sentenceText,
          previousText: pendingItem.previousText,
        }),
      });
      return ttsResponse.ok ? await ttsResponse.blob() : null;
    } catch {
      return null;
    }
  }

  private async drainQueue(): Promise<void> {
    if (this.isDraining) return;
    this.isDraining = true;

    let prefetchedAudioPromise: Promise<Blob | null> | null = null;

    while ((this.pendingSentences.length > 0 || prefetchedAudioPromise) && !this.isDisposed) {
      const currentAudioPromise =
        prefetchedAudioPromise ?? this.fetchSentenceAudio(this.pendingSentences.shift()!);
      prefetchedAudioPromise = null;

      const currentAudioBlob = await currentAudioPromise;

      // 현재 문장을 재생하는 동안 다음 문장 오디오를 미리 요청 (동시 요청은 항상 1개)
      if (this.pendingSentences.length > 0) {
        prefetchedAudioPromise = this.fetchSentenceAudio(this.pendingSentences.shift()!);
      }

      if (!currentAudioBlob) continue;

      const objectUrl = URL.createObjectURL(currentAudioBlob);
      try {
        await new Promise<void>((resolvePlayback) => {
          const audioElement = new Audio(objectUrl);
          this.activeAudioElement = audioElement;
          audioElement.onended = () => resolvePlayback();
          audioElement.onerror = () => resolvePlayback();
          void audioElement.play().catch(() => resolvePlayback());
        });
      } finally {
        URL.revokeObjectURL(objectUrl);
        this.activeAudioElement = null;
      }
    }

    this.isDraining = false;
  }

  dispose(): void {
    this.isDisposed = true;
    this.pendingSentences = [];
    this.activeAudioElement?.pause();
    this.activeAudioElement = null;
  }
}
