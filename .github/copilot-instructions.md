<!-- .github/copilot-instructions.md - guidance for AI coding agents -->

# ApocalypseCalculus — Copilot instructions

This file gives concise, actionable guidance for automated coding agents working on the ApocalypseCalculus repository.

Keep it short. Only change code when you can run or validate the change in this repo (static checks / open the HTML). Reference these files when making edits: `index.html`, `README.md`, `LICENSE`.

1. Big picture

   - This is a single-file, client-side web app: `index.html` contains all UI, logic and the `operations` generators array. There is no backend. Changes should preserve the single-file deploy model unless adding a clear migration (create new files only when necessary).
   - Math rendering uses KaTeX (CDN). The app shows challenges from `operations` (in `index.html`) and exposes `getRandomOperation()` and `operations` array that agents can call via the DOM for headless training loops.

2. What to modify and why

   - Small bug fixes and new operations: edit `index.html` only. Example: fix derivative rendering bug by ensuring `resultTex` is always defined (see derivative generator near the bottom of `operations`).
   - Add new math ops by appending to the `operations` array. Keep each operation pure (return an object with `expr`, `result`, `tex`, optional `resultTex`). Follow existing shape.
   - If adding JS modules or many new assets, add a short note in `README.md` explaining deployment implications (GitHub Pages still serves static files).

3. Patterns and conventions (discoverable in `index.html`)

   - Operation shape: { expr: string, result: any, tex: string, resultTex?: string }
     - `expr` is human-readable challenge text.
     - `result` is the canonical answer used for equality checks (loose equality == used in UI). Prefer strings for non-numeric answers.
     - `tex` is rendered via KaTeX. If symbolic answers are used, include `resultTex` to render the expected result (example: derivative op sets `resultTex`).
   - Leveling: `getLevel()` derives difficulty from score (integer division by 10). Use `getLevel()` inside generators to scale numbers.
   - Timeouts: auto-submit runs after 30s (`setTimeout(autoSubmit, 30000)`). Don't remove without updating README and UI text.

4. Tests / verification

   - There is no test harness. Verify changes by opening `index.html` in a browser or serving the directory (README suggests `npx serve .` or `python -m http.server 8000`). When changing math rendering, visually confirm KaTeX output.
   - Quick local checks: ensure no uncaught exceptions in console (especially from KaTeX rendering with invalid TeX strings). Use `katex.renderToString(tex, { throwOnError: false })` style used in the file.

5. Common pitfalls & examples from repo

   - Derivative generator may produce '0' as plain text and not wrap it for KaTeX. When returning symbolic results, populate `resultTex` (example in `index.html` derivative op) and prefer `'0'` -> `'0'` with proper TeX formatting when needed.
   - Loose equality: UI compares with `==` (not strict). Keep `result` and user input types compatible (number vs string). For new ops that return floats, follow existing `.toFixed(2)` pattern.
   - Avoid adding heavy client dependencies. This project intentionally uses CDN KaTeX and zero-build single-file HTML.

6. Developer workflows (documented / discoverable)

   - Run locally: open `index.html` or serve with a static server:
     ```bash
     npx serve .
     # or
     python -m http.server 8000
     ```
   - Deploy: push to GitHub and enable GitHub Pages (single-file HTML works out-of-the-box).

7. If you need to create new files

   - Add a short note to `README.md` describing why multiple files are required and how to deploy (keep the README style and section headings).
   - Add only minimal assets (e.g., `api.js` for a small Express proof-of-concept) and document it in README. Mark any backend additions as opt-in — they change the single-file nature.

8. Communication style for PRs

   - Provide a one-paragraph rationale and a brief test plan (how to open `index.html`, sample inputs to trigger new ops, KaTeX render checks).
   - For visual/math changes include before/after screenshots or rendered TeX snippets.

9. Ask the maintainer if unclear
   - If a behavior depends on runtime metrics (score, level, or animation timing), ask whether to preserve UX (animations/timeouts) or optimize for headless agent runs.

---

If anything above is unclear or you want more detail (example snippets for adding a new operation, or a small test harness), tell me what you'd like and I'll expand the file.
