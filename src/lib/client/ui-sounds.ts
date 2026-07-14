export const uiSoundPaths = {
  notificationAlert: "/alert.mp3",
  incomingCall: "/bell_alert.mp3",
} as const;

const activeSoundMap = new Map<string, HTMLAudioElement>();

export function playUiSound(
  soundPath: string,
  options?: { loop?: boolean },
): () => void {
  stopUiSound(soundPath);

  const audioElement = new Audio(soundPath);
  audioElement.loop = options?.loop ?? false;
  activeSoundMap.set(soundPath, audioElement);
  void audioElement.play().catch(() => {});

  return () => stopUiSound(soundPath);
}

export function stopUiSound(soundPath: string): void {
  const audioElement = activeSoundMap.get(soundPath);
  if (!audioElement) return;

  audioElement.pause();
  audioElement.currentTime = 0;
  activeSoundMap.delete(soundPath);
}
