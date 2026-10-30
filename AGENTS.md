# Project instructions

- Do not push to GitHub unless explicitly requested.
- This repository is the application root; do not write project files into the parent brief/ directory.
- Use Electron + React + Vite and JavaScript/JSX. No TypeScript, database or global state framework.
- Implement the approved four-page P01–P04 flow on a fixed 1080 × 1920 canvas, preserving every formal item in the four reference designs, including gender. Match their fonts, sizes and positions using the bundled PNGs/fonts. Pages and keyboards never scroll; date/time wheel columns support touch scrolling. All floating panels are centered within the canvas, square-cornered, borderless and softly shadowed.
- All inputs are required: nickname (50 Unicode code points), gender (male/female, no default), Gregorian date, hour, minute, free-text global birthplace (120 code points).
- Day stem comes from DeepSeek using only the entered Gregorian date. Do not shift using gender, time, birthplace, OS timezone or true solar time. Gender may affect entertainment percentages. Preserve the validated AI percentages exactly, including when the day element is not highest. Highlight only the day stem's element with a 2-second breathing glow, and place the "日主" label directly beneath its icon.
- DeepSeek calls belong in the main process: disabled thinking, temperature 0, max_tokens 500, JSON mode, 30-second timeout, no automatic retries. Keep the versioned prompt and validator testable without Electron.
- Never expose API keys in the renderer, VITE_ variables, logs, installer sources or Git. Identify the fixed offline browser demo in its tab title; desktop must not silently fall back to it.
- Keep five element bead names, ten distinct stem meanings and ten-stem assignments in content/fortune.json. Preserve the five original meanings in their corresponding stem entries and treat the other five as editable drafts. Read once at startup, outside app.asar at resources/content/fortune.json when packaged. Browser loads standalone same-origin JSON; do not compile it into JavaScript. Fail explicitly on invalid configuration.
- Participant data and AI/receipt snapshots stay in memory only. Clear on return/finish, idle timeout and reload. Abort requests and reject late replies. No localStorage, personal files or participant logs.
- Preserve contextIsolation=true, nodeIntegration=false, sandbox=true. Expose narrow named preload methods and validate IPC senders.
- Print only main-process validated snapshots, never recompute at printing. Preserve task deduplication, write-before-submit minimal records, and no automatic replay of uncertain jobs. Receipts have no barcode or test labels. Wait for fonts and images before printing. P04 feeds paper from a 24px exposed lower edge after 700ms, for exactly 3000ms linear; this visual effect is independent of hardware status and excluded from physical printing.
- Browser preview must work without Electron or runtime network. Bundle future fonts/images locally.
- Use Node.js 24, committed npm lockfile and npm ci. Run lint, tests and build after relevant changes, with proportionate focused UI checks; avoid repeated real AI calls and physical printing during UI verification.
- Do not claim real AI, hardware, touch-driver or physical paper verification without actually checking it.
- Keep README and verification notes current. Do not commit node_modules, build output, ignored tools, credentials or participant data.
