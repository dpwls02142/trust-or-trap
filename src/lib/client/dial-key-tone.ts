/** DTMF 이중 주파수 — 행·열 조합으로 1→9가 도→도 음계처럼 들린다. */
const dialKeyFrequencies: Record<string, [number, number]> = {
  "1": [697, 1209],
  "2": [697, 1336],
  "3": [697, 1477],
  "4": [770, 1209],
  "5": [770, 1336],
  "6": [770, 1477],
  "7": [852, 1209],
  "8": [852, 1336],
  "9": [852, 1477],
  "*": [941, 1209],
  "0": [941, 1336],
  "#": [941, 1477],
};

let sharedAudioContext: AudioContext | null = null;

function getSharedAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContext();
  }
  return sharedAudioContext;
}

/**
 * 전화 키패드 톤을 즉시 재생한다.
 * Web Audio API로 합성하므로 파일 로드 없이 연속 입력에도 지연이 없다.
 */
export function playDialKeyTone(keyDigit: string): void {
  const frequencyPair = dialKeyFrequencies[keyDigit];
  if (!frequencyPair) return;

  const audioContext = getSharedAudioContext();
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  const toneDurationSeconds = 0.15;
  const startTime = audioContext.currentTime;

  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0.12, startTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    startTime + toneDurationSeconds,
  );

  for (const toneFrequency of frequencyPair) {
    const toneOscillator = audioContext.createOscillator();
    toneOscillator.type = "sine";
    toneOscillator.frequency.setValueAtTime(toneFrequency, startTime);
    toneOscillator.connect(gainNode);
    toneOscillator.start(startTime);
    toneOscillator.stop(startTime + toneDurationSeconds);
  }
}
