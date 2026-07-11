"use client";

import type { ScenarioId } from "@/lib/scenario/types";

/**
 * 문장 단위 TTS 재생 큐.
 * 문장이 완성되는 즉시 /api/tts/stream을 호출하고, 도착한 오디오를 순서대로 재생한다.
 * fetch는 병렬로 시작(지연 은닉)하되 재생은 큐 순서를 보장한다 — 텍스트/음성 동기화 버퍼링.
 */

export class SentenceTtsQueue {
  private playbackQueue: Promise<Blob | null>[] = [];
  private isPlaying = false;
  private activeAudioElement: HTMLAudioElement | null = null;
  private isDisposed = false;

  constructor(private readonly scenarioId: ScenarioId) {}

  enqueueSentence(sentenceText: string, previousText: string): void {
    if (this.isDisposed) return;

    const fetchPromise = fetch("/api/tts/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: this.scenarioId, sentenceText, previousText }),
    })
      .then((ttsResponse) => (ttsResponse.ok ? ttsResponse.blob() : null))
      .catch(() => null);

    this.playbackQueue.push(fetchPromise);
    void this.drainQueue();
  }

  private async drainQueue(): Promise<void> {
    if (this.isPlaying) return;
    this.isPlaying = true;

    while (this.playbackQueue.length > 0 && !this.isDisposed) {
      const nextAudioBlob = await this.playbackQueue.shift()!;
      if (!nextAudioBlob) continue;

      const objectUrl = URL.createObjectURL(nextAudioBlob);
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

    this.isPlaying = false;
  }

  dispose(): void {
    this.isDisposed = true;
    this.playbackQueue = [];
    this.activeAudioElement?.pause();
    this.activeAudioElement = null;
  }
}
