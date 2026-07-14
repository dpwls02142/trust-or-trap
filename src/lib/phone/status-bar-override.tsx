"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { StatusBarContentStyle } from "@/lib/phone/app-display";

interface StatusBarOverrideContextValue {
  statusBarOverride: StatusBarContentStyle | null;
  setStatusBarOverride: (nextStyle: StatusBarContentStyle | null) => void;
}

const StatusBarOverrideContext =
  createContext<StatusBarOverrideContextValue | null>(null);

export function StatusBarOverrideProvider({ children }: { children: ReactNode }) {
  const [statusBarOverride, setStatusBarOverrideState] =
    useState<StatusBarContentStyle | null>(null);

  const setStatusBarOverride = useCallback(
    (nextStyle: StatusBarContentStyle | null) => {
      setStatusBarOverrideState(nextStyle);
    },
    [],
  );

  const contextValue = useMemo(
    () => ({ statusBarOverride, setStatusBarOverride }),
    [statusBarOverride, setStatusBarOverride],
  );

  return (
    <StatusBarOverrideContext.Provider value={contextValue}>
      {children}
    </StatusBarOverrideContext.Provider>
  );
}

export function useStatusBarOverride() {
  const contextValue = useContext(StatusBarOverrideContext);
  if (!contextValue) {
    throw new Error(
      "useStatusBarOverride must be used within StatusBarOverrideProvider",
    );
  }
  return contextValue;
}
