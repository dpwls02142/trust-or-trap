"use client";

interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="mx-auto w-phone rounded-[2.5rem] border-[10px] border-neutral-800 bg-black p-2 shadow-2xl">
      <div className="h-phone w-full overflow-hidden rounded-[1.75rem] bg-neutral-950">
        {children}
      </div>
    </div>
  );
}
