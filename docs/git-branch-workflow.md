# Git 브랜치 전략 및 워크플로우

> **1인 개발** 프로젝트의 Git 브랜치 전략입니다.
> PR은 히스토리 관리와 작업 단위 기록을 위해 사용하며, merge는 **squash merge**만 합니다.
> 에이전트 훅(`.cursor/hooks/guard-git-commands.js`)과 Cursor 규칙(`.cursor/rules/git-workflow.mdc`)이 이 문서를 기준으로 동작합니다.

## 브랜치 모델

```
main (protected)
  |
  +-- feature/add-login-page
  +-- fix/checkout-duplicate-order
```

### 브랜치 종류

| 브랜치 | 용도 | 예시 |
|--------|------|------|
| `main` | 배포-ready 코드. 직접 push 금지 | — |
| `feature/*` | 새 기능 | `feature/user-profile` |
| `fix/*` | 버그 수정 | `fix/null-pointer-on-load` |

### 네이밍 규칙

- 소문자, 하이픈 구분: `feature/add-oauth-login`
- 슬래시 한 단계: `feature/scope-name`

---

## 워크플로우

```
1. main에서 최신 pull
2. feature/fix 브랜치 생성
3. 작업 + 커밋
4. 자가 리뷰 (bugbot 서브에이전트)
5. PR 생성
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

- 커밋 메시지: [writing-commit-message 스킬](../.cursor/skills/writing-commit-message/SKILL.md)
- feature 브랜치에서 작은 커밋 여러 개 OK — squash merge로 main에 하나로 합쳐짐

```powershell
git add .
git commit -m "feat(auth): add OAuth2 login flow"
```

### 3. PR 생성 전 자가 리뷰

- [ ] `git fetch origin; git rebase origin/main` — 충돌 해결
- [ ] diff 직접 확인
- [ ] **bugbot** 서브에이전트로 코드 리뷰
- [ ] UI 변경 시 **visual-qa-testing** 스킬로 QA
- [ ] `.env`, credentials, debug 코드 미포함

### 4. PR 생성

[creating-pr 스킬](../.cursor/skills/creating-pr/SKILL.md) 참고.

```powershell
git push -u origin HEAD
gh pr create --title "feat: add OAuth2 login flow" --body-file .github/pr-body-template.md
```

### 5. Squash Merge

- GitHub에서 **Squash and merge**만 사용
- Squash 커밋 메시지 = PR 제목 + 본문 요약

### 6. 브랜치 정리

```powershell
git checkout main
git pull origin main
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

---

## 금지 사항 (훅으로 강제)

| 행동 | 대안 |
|------|------|
| `main`에 직접 push | feature/fix 브랜치 + PR |
| `main`에 force push | revert commit + 새 PR |
| 인터랙티브 `git commit` | `git commit -m "..."` |
| PR 없이 merge | 항상 PR 경유 |

---

## Windows (PowerShell) 주의

- `&&` 대신 `;` 사용
- PR body: `--body-file` (HEREDOC 불가)
- `gh` CLI: `winget install GitHub.cli`

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `.cursor/rules/git-workflow.mdc` | 에이전트용 요약 |
| `.cursor/hooks/guard-git-commands.js` | git 명령 가드 |
| `.cursor/skills/writing-commit-message/SKILL.md` | 커밋 메시지 |
| `.cursor/skills/creating-pr/SKILL.md` | PR 생성 |
| `AGENTS.md` | 오케스트레이션 |
