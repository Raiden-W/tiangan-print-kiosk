# Project instructions

- Do not push to GitHub automatically. Push only when the user explicitly requests it for the current work.

- This repository is the application root. Keep project files here; do not write into the parent `brief/` directory.
- Use Electron + React + Vite and JavaScript/JSX. Do not introduce TypeScript, remote services, a database, AI APIs, or a global state framework without a concrete requirement.
- Preserve the three-page flow and supplied copy. The visual styling is provisional.
- Calculate only the day stem from the entered Gregorian date. Never shift it using time, gender, birthplace, residence, the OS timezone, or a user-selected timezone.
- Keep the calculator and content lookup usable in both Node.js and the browser. Keep bead names, meanings and assignments in `content/fortune.json`.
- All current bead data is explicitly marked as placeholder. Do not invent production bead mappings or cultural claims. Production content and independent almanac verification are release gates.
- Participant information is in-memory only. Clear it on return/finish, idle timeout or renderer reload. Do not put it in logs, localStorage, files or Git.
- Renderer permissions: contextIsolation=true, nodeIntegration=false, sandbox=true. Expose only named, narrow preload methods and validate IPC senders.
- Printing is not implemented in this foundation. Do not simulate successful printing or generate a redeemable-looking voucher. Before implementing, follow `docs/PLAN.md`: main-process IDs, write-before-submit records, one canonical barcode value, deduplicated requests and no automatic replay of uncertain jobs.
- Browser preview must work without Electron and without network access at runtime. Bundle future fonts/images locally.
- Use Node.js 24, the committed npm lockfile and `npm ci`. Run `npm run lint`, `npm test`, and `npm run build` before committing relevant changes. Windows integration, installer and printer checks require Windows.
- Do not claim real hardware, touch-keyboard behavior or physical paper output has been verified unless it has actually been checked.
- Keep development steps and known gaps documented in README.md. Do not commit node_modules, build output, machine-specific bootstrap tools, credentials or participant data.
