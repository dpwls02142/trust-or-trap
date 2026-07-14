"use client";

import type { ComponentType } from "react";
import {
  RiBankFill,
  RiChat3Fill,
  RiGlobalFill,
  RiInstagramFill,
  RiMessage2Fill,
  RiNotification3Fill,
  RiPhoneFill,
} from "@remixicon/react";
import type { AppType } from "@/lib/scenario/types";

type PlayableAppType = Exclude<AppType, "home">;

const phoneAppIconMap: Record<
  PlayableAppType,
  ComponentType<{ size?: number | string; className?: string }>
> = {
  chat: RiChat3Fill,
  sms: RiMessage2Fill,
  insta: RiInstagramFill,
  call: RiPhoneFill,
  bank: RiBankFill,
  browser: RiGlobalFill,
};

interface PhoneAppIconProps {
  appType: PlayableAppType | "notification";
  size?: number | string;
  className?: string;
}

export function PhoneAppIcon({
  appType,
  size = 24,
  className,
}: PhoneAppIconProps) {
  if (appType === "notification") {
    return (
      <RiNotification3Fill size={size} className={className} aria-hidden />
    );
  }

  const IconComponent = phoneAppIconMap[appType];
  return <IconComponent size={size} className={className} aria-hidden />;
}
