"use client";

interface BrowserWebFrameProps {
  frameUrl: string;
}

export function BrowserWebFrame({ frameUrl }: BrowserWebFrameProps) {
  return (
    <div className="relative min-h-0 flex-1 bg-white">
      <iframe
        key={frameUrl}
        src={frameUrl}
        title="브라우저 페이지"
        className="h-full w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
