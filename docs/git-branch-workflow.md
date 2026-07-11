# Git 브랜치 전략 및 워크플로우

> trust-or-trap 프로젝트의 Git 브랜치 전략과 PR 워크플로우입니다.
> 에이전트 훅(`.cursor/hooks/guard-git-commands.js`)과 Cursor 규칙(`.cursor/rules/git-workflow.mdc`)이 이 문서를 기준으로 동작합니다.

## 브랜치 모델

```
main (protected)
  |
  +-- feature/add-login-page
  +-- feature/dark-mode
  +-- fix/checkout-duplicate-order
  +-- fix/websocket-reconnect
```

### 브랜치 종류

| 브랜치 | 용도 | 예시 |
|--------|------|------|
| `main` | 프로덕션-ready 코드. 직접 push 금지 | — |
| `feature/*` | 새 기능 개발 | `feature/user-profile` |
| `fix/*` | 버그 수정 | `fix/null-pointer-on-load` |

### 네이밍 규칙

- 소문자, 하이픈 구분: `feature/add-oauth-login`
- 슬래시 한 단계: `feature/scope-name` (중첩 `feature/a/b` 지양)
- 이슈 번호 포함 (선택): `fix/123-checkout-race-condition`

---

## 워크플로우

```
1. main에서 최신 pull
2. feature/fix 브랜치 생성
3. 작업 + 커밋 (브랜치 위)
4. PR 생성
5. 코드 리뷰
6. Squash merge → main
7. 브랜치 삭제
```

### 1. 브랜치 생성

```powershell
git fetch origin
git checkout main
git pull origin main
git checkout -b feature/my-feature origin/main
```

### 2. 작업 및 커밋

- 커밋 메시지: [writing-commit-message 스킬](../.cursor/skills/writing-commit-message/SKILL.md) 따름
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- feature 브랜치에서는 **작은 커밋 여러 개 OK** — squash merge로 main에 하나로 합쳐짐

```powershell
git add .
git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "feat(auth): add OAuth2 login flow"
```

### 3. PR 생성 전 체크

- [ ] `git fetch origin && git rebase origin/main` (또는 merge) — 충돌 해결
- [ ] diff 자가 리뷰
- [ ] 테스트·린트·타입체크 통과
- [ ] `.env`, credentials, debug 코드 미포함

### 4. PR 생성

[creating-pr 스킬](../.cursor/skills/creating-pr/SKILL.md) 참고.

```powershell
git push -u origin HEAD
gh pr create --title "feat: add OAuth2 login flow" --body-file .github/pr-body-template.md
```

**PR 제목 형식:** `<type>: <description>` (커밋과 동일)

**PR 본문 템플릿:**

```markdown
## Summary
<!-- 1-3문장: 무엇을, 왜 -->

Closes #123

## Changes
- 변경 사항 bullet list

## Test Plan
- [ ] 테스트 항목 1
- [ ] 테스트 항목 2
```

### 5. 코드 리뷰

- 최소 **1명 이상** approve 후 merge
- 리뷰어는 diff 전체 확인, UI 변경 시 스크린샷 요청
- 에이전트 리뷰: **bugbot** 또는 **security-review** 서브에이전트 활용 가능
  - 완료 후 `.cursor/hooks/subagent-followup.js`가 후속 작업을 제안

**리뷰어 관점 체크리스트:**

- [ ] 요구사항 충족
- [ ] 엣지 케이스 처리
- [ ] 테스트 커버리지
- [ ] 보안 (입력 검증, 시크릿 노출)
- [ ] 성능 (Windows 저메모리 환경 고려)

### 6. Squash Merge

- GitHub에서 **Squash and merge**만 사용
- Squash 커밋 메시지 = PR 제목 + 본문 요약
- **Rebase merge, Create merge commit 사용 금지**

```
feat(auth): add OAuth2 login flow (#42)

* Google/GitHub OAuth provider integration
* Session token refresh middleware
* Login page UI

Closes #123
```

### 7. 브랜치 정리

```powershell
git checkout main
git pull origin main
git branch -d feature/my-feature
git push origin --delete feature/my-feature   # remote 삭제 (선택)
```

---

## 금지 사항 (훅으로 강제)

| 행동 | 이유 | 대안 |
|------|------|------|
| `main`에 직접 push | 히스토리 보호 | feature/fix 브랜치 + PR |
| `main`에 force push | 히스토리 파괴 | revert commit + 새 PR |
| 인터랙티브 `git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>"` | CI/에이전트 비호환 | `git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "..."` |
| PR 없이 merge | 리뷰 누락 | 항상 PR 경유 |

---

## Hotfix (긴급 수정)

긴급 버그도 동일한 흐름을 따릅니다. `fix/` 브랜치 + 빠른 리뷰 + squash merge.

```
fix/critical-payment-error → PR (fast-track review) → squash merge
```

---

## Windows 특이사항

- PR body에 bash HEREDOC 대신 `--body-file` 사용 (PowerShell 5.1)
- `gh` CLI 설치 필요: `winget install GitHub.cli`
- line ending 충돌 시 [Windows 개발 환경 가이드](./windows-development-environment.md) 참고

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `.cursor/rules/git-workflow.mdc` | 에이전트용 요약 규칙 |
| `.cursor/hooks/guard-git-commands.js` | destructive git 명령 차단 |
| `.cursor/skills/writing-commit-message/SKILL.md` | 커밋 메시지 |
| `.cursor/skills/creating-pr/SKILL.md` | PR 생성 |
| `AGENTS.md` | 전체 오케스트레이션 |
