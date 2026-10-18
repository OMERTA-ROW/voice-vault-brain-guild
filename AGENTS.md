<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Cyber Race architecture rules
- Demo state lives in `src/lib/store.ts` (localStorage, useSyncExternalStore) — no backend yet; swap for Cloud in Stage 1.
- Command safety classification is centralized in `src/lib/commands.ts` and covered by tests — every new intent must declare a risk level.
- Sensitive actions must route through the approval inbox with typed confirmation — never execute directly.
- Non-landing pages wrap content in `Shell` from `src/components/shell.tsx` for consistent nav and the demo banner.
