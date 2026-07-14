"use client";

import { PhoneFrame } from "@/components/phone/PhoneFrame";
import type { StatusBarContentStyle } from "@/lib/phone/app-display";
import { useStatusBarOverride } from "@/lib/phone/status-bar-override";

interface PhoneFrameShellProps {
  children: React.ReactNode;
  statusBarContentStyle: StatusBarContentStyle;
}

export function PhoneFrameShell({
  children,
  statusBarContentStyle,
}: PhoneFrameShellProps) {
  const { statusBarOverride } = useStatusBarOverride();
  const resolvedStatusBarContentStyle =
    statusBarOverride ?? statusBarContentStyle;

  return (
    <PhoneFrame statusBarContentStyle={resolvedStatusBarContentStyle}>
      {children}
    </PhoneFrame>
  );
}
