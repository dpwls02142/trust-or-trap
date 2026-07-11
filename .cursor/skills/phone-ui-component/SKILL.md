---
name: phone-ui-component
description: Build or extend phone-in-phone UI components (PhoneFrame, ChatApp, CallScreen, etc.) for Trust or Trap simulation.
---

# Phone UI Component

Build reusable "폰 속의 폰" components in `src/components/phone/`.

## Component Tree

```
PhoneFrame.tsx       — outer bezel, fixed viewport
HomeScreen.tsx       — app grid + notification badges
apps/
  ChatApp.tsx
  SMSApp.tsx
  CallScreen.tsx
  BankApp.tsx
  InstagramDM.tsx
  DatingApp.tsx
AppRenderer.tsx      — switches app by app_type from node spec
```

## Steps

1. Read current node's `app_type` from Zustand store
2. Render via `AppRenderer` — **one renderer, all 7 scenarios**
3. Pass shared props:

```typescript
interface AppRendererProps {
  messages: Message[];
  options: Option[];
  onSelectOption: (optionId: string) => void;
  timerSeconds?: number;
  isStreaming: boolean;
  onTextSubmit?: (text: string) => void;
}
```

4. **Realistic chrome** — status bar (time, signal), app-specific header
5. **Framer Motion** — message slide-in, notification pop
6. **Timer** — visible countdown when node has `timer_seconds`
7. **Fallback input** — text field always available (mic optional)

## Visual QA

After UI changes, run `visual-qa-testing` skill at `http://localhost:3000`.

## Reference

- Rule: `.cursor/rules/phone-ui.mdc`
- Planning: Scriptic-style immersive phone (not game-y UI)
