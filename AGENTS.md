# YiTing Birthday — repository instructions

## Start here

- Work in this Git repository's root; it is already the website root. Do not assume a desktop checkout path or an extra `publish-repo/` subdirectory.
- Read `CLOUD-STATUS.md`, `CODEX-CLOUD-HANDOFF.md`, `README.md`, `CONTINUE-HERE.md`, and relevant `tests/README.md` sections. The latest explicit user request and current Git state take priority over historical notes.
- Inspect `git status`, the selected branch, recent commits, and differences from `origin/main` when accessible. Preserve uncommitted work; never reset/clean/force-push to resolve a sync problem.
- Current handoff baseline is App `20261021-78`: code `90d5a07`, deployment records `a4e842b`. Later main commits supersede this snapshot. Do not revert to App74 just because it is the named stable backup.

## Project and content

- Static multi-page HTML/CSS/JavaScript website. No production npm build, React/Babel app, database, or API server is required. Do not migrate frameworks or hosting without a user request.
- Primary repository: `kuoyenai/kuotoyiting-birthday`. Production: `https://kuotoyiting-birthday.vercel.app/`; secondary: `https://kuoyenai.github.io/kuotoyiting-birthday/`.
- Entry order: invitation → birthday movie → movie interactive comic → illustrated novel/comic → birthday collection. The 2D starlight journey is accessible from the story experience.
- Preserve 10 chapters / 95 unique illustrated panels in original order, 100 blessing cards, complete-collection ZIP, four songs, selected-song MP4 downloads, manual mute preferences, movie playback, and personal collections.
- Keep the invitation's midnight blue, gold serif typography, subtle starlight, and Eunho's red-star motif. Characters and story remain the visual focus. Interface copy is Traditional Chinese.
- Preserve the existing non-official, non-commercial fan-creation notices; fictional character dialogue is not a statement from the actual members.

## 2D journey invariants

- Preserve original YITING walking artwork, continuous map, backtracking, read-then-auto-walk, matching companion camera angles, and correct group appearances. Chapter3's stationary five-member scene must not become a moving companion layer. Chapters7/8 and cake celebration retain appropriate full-group presence.
- Fixed-location dialogue, especially the cake sequence, continues at the same location rather than walking endlessly between lines.
- All 10 chapters are freely selectable. Jumping is not reading: preserve the separate `completed` asset IDs, contiguous `unlocked` prefix, cursor, bookmark, and original return location. Stars/keepsake/completion come from actual reading. Preserve legacy-save migration and reset behavior.
- Do not replace the active walking implementation with an older experimental rig/sprite just because a similarly named asset exists.

## Artwork and reference material

- Any `sources/` directory is read-only. Do not edit/rename/move/delete synced source references.
- Official appearance references already tracked: `assets/reference-yejun.jpg`, `assets/reference-noah-bamby.jpg`, `assets/reference-eunho-hamin.jpg`. The original six-person walking concept is `art-reviews/references/cohort-walking-concept.jpg`. Use these plus existing original artwork, `game-art-prompts.json`, and relevant `art-reviews/*.json`.
- Before accepting generated artwork, inspect faces, hair/eyes/outfits, full face and chin, five-finger anatomy where visible, joints, occlusion, and extra limbs. Minor top-of-head framing with the complete face/chin is permitted. Do not force occluded fingers to become visible.
- Use distinct wide/medium/close compositions; preserve a coherent side-on ground plane for walking assets. Do not crop existing faces to simulate all missing close-ups.
- Old `source` fields in art-review JSON can refer to the original desktop generator output. Use the tracked `path`/`ref` assets; those historical desktop paths are not required inputs.
- If image-generation tools are unavailable, complete feasible code/layout work and record exact prompts, reference files, dimensions, and remaining artwork. Do not claim to have generated or inspected an image that does not exist.

## Privacy and sharing

- Wishes and future-self replies remain local unless the visitor actively clicks `分享給Kuo`. That click sends immediately through the existing FormSubmit endpoint; do not reintroduce a second confirmation dialog.
- Keep the inline recipient/service disclosure and fixed recipient `kuoyen.ai@gmail.com`. Preserve private collection and text/SVG downloads. Loading, typing, collecting, downloading, and old stored text must never trigger email.
- Mock/intercept email services in tests. Do not send real test email, access a mailbox, or inspect/share visitor content without a fresh explicit request.
- A service acceptance response is not proof of inbox delivery or reading. Do not add passwords or access tokens to source code or Git history.

## Development and verification

- See `CODEX-CLOUD-HANDOFF.md` for portable setup and the test matrix. Use environment-installed Node >=20, Python3, and Playwright; no Windows-specific runtime paths.
- Test scripts normally resolve the repository from their own paths. Run them from the repository root; some legacy scripts also read relative data files. Create `../material-review` for diagnostic screenshots if writable. If that location is unavailable, adapt the output location explicitly and record it rather than claiming a test passed.
- At minimum run `python3 audit.py` when changing version/manifest/PWA settings, `node --check` for edited JavaScript, and relevant functional tests. Documentation-only changes do not require a full 95-panel browser run.
- Select tests for the change: free chapters/progress → `explore-free-chapters.cjs`; core route/autowalk/fixed scenes → `explore-complete-journey.cjs`; email → `wish-sharing.cjs` and `letter-sharing.cjs`; story/card mapping → `story-integrity.cjs`; media/collection preservation → `preservation-audit.cjs`; music → relevant `explore-music*.cjs`.
- Desktop Chromium/WebKit tests do not replace physical iPhone/iPad Safari or installed-PWA verification. State actual coverage and limitations.

## Save, release, and resume

- Every meaningful change updates `CLOUD-STATUS.md` and the current section of `README.md` / `CONTINUE-HERE.md` with behavior, files, actual checks, unresolved work, and branch/commit information.
- Preserve existing stable tags, especially `yiting-stable-20261019-v74` → `2ea28244ecc0348409caed5533c34acdf4b3f926`. Never move a stable tag.
- For product changes, synchronize the existing App version / Service Worker / entry cache parameters and inventory as required by `audit.py`. Do not bump the App version for documentation-only handoff changes.
- Commit or save a reviewable PR to GitHub before ending work. A local edit or task filesystem alone is not a cross-device handoff. Preserve unrelated changes and state exactly what is not yet committed/pushed.
- Follow the current task's publishing authorization and available permissions. If main publishing is authorized and supported, use the existing main/Vercel/Pages workflow; if only a PR is available, prepare it and report that it is not merged or deployed. Do not invent credentials or bypass restrictions.
- Only claim a site is live after checking its actual deployed version/content. Git push or CI success alone is insufficient.
- The hourly automation was explicitly cancelled and deleted. Do not restart a schedule; continue manually unless a new explicit scheduling request arrives.
- On temporary/Bad Request failures, save progress, inspect inputs, and retry the same step at most three times. Resume existing jobs/handles instead of starting duplicates. If still blocked, record the error and concrete next step; do not publish an unverified change.
