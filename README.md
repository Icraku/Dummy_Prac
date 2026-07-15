# The Room — AI Workplace Communication Simulator

A single-file, zero-dependency web app for practicing job interviews and
presentations against an AI that plays realistic, personality-driven roles.
No build step, no CDN, no framework — `index.html` is the whole app.

## What's actually built in this version

This build focuses on the two modules you asked to prioritize:

- **Interview Simulator** — paste a CV + job description, pick an
  interviewer persona (HR recruiter, technical lead, skeptical executive,
  startup founder, quiet observer), run a 3-question calibration round so
  coaching sounds like *you*, then a live adaptive interview (follow-ups,
  challenges, occasional silence, references to earlier answers), ending in
  a scored report with per-answer rewrites in your own voice.
- **Presentation Studio** — paste notes, pick a duration and audience,
  present out loud (Web Speech API) or by typing, watch a small reactive
  audience of animated faces, get overtime highlighted in red past your
  time limit, take AI-generated audience questions, then get a pacing/
  filler-word/engagement report with suggested rewrites for weak lines.

**Deliberately left out of this build** (so you know what's a real gap vs.
what's just missing polish):

- No PDF/DOCX parsing — paste text. Real parsing needs a library or a
  backend; adding it is straightforward later but wasn't in scope here.
- No camera-based facial expression / eye-contact / posture analysis. On
  Air already proved out MediaPipe FaceLandmarker for this — that pattern
  could be ported into the Presentation Studio in a follow-up pass.
- No Meeting Simulator, no cross-session replay/compare beyond a simple
  score list — the spec's other modules weren't in this round's ask.
- Progress is `localStorage` only, per browser, no account or backend.
- Live speech-to-text uses the browser's native `SpeechRecognition` API,
  which is solid in Chrome/Edge and unsupported in Firefox/Safari — those
  browsers fall back to typing.

## Files

- `index.html` — the entire app (UI, styling, provider logic, prompts).
- `api/chat.js` — optional Vercel serverless function. Some providers
  (Groq, Anthropic) block direct browser requests via CORS, so this relays
  the request server-side. It never reads or stores your key — it just
  forwards whatever `headers`/`body` the browser sends it, to an allowlisted
  set of provider hostnames only (not an open relay).
- `README.md` — this file.

## Running it

**Quickest:** open `index.html` directly in a browser. Providers that don't
need the proxy (Gemini, OpenAI) will work immediately once you paste a key
in Setup. Groq and Anthropic need the proxy — see below.

**With the proxy (recommended, needed for Groq/Anthropic):**
1. Push this folder to GitHub.
2. Import it into Vercel — it auto-detects `api/chat.js` as a serverless
   function, no config needed.
3. Deploy. Vercel gives you a URL; `index.html` can be hosted there too, or
   on GitHub Pages with the proxy URL field in Setup pointed at your Vercel
   deployment (e.g. `https://your-app.vercel.app/api/chat`).

## Testing before you deploy

If "Test connection" fails with something that looks like an HTML page
(often with `/_next/static/...` in it), that's a Next.js app's 404 page —
it means the request for `/api/chat` landed on whatever site is currently
hosting the page, not on a real `api/chat.js`. This happens if you open
`index.html` straight from disk, or preview it inside a chat tool: there's
no backend there, so Groq and Anthropic (which both require the proxy)
can't connect. Gemini and OpenAI don't need the proxy, so they'll still
work in that situation.

To actually test Groq/Anthropic before a full deploy, run the proxy
locally:

```bash
npm install -g vercel
cd the-room
vercel dev
```

This serves `index.html` and `api/chat.js` together on `localhost:3000`,
exactly like production. Open that URL, leave the Proxy URL field as
`/api/chat`, and test connection from there.

## Choosing a provider

| Provider | Cost | Notes |
|---|---|---|
| **Groq (default)** | Free, no card | ~30 req/min, roughly 1,000+ req/day on most models. `llama-3.3-70b-versatile` is the best default: high quota, solid quality. `moonshotai/kimi-k2-instruct` is the closest open-weight model to Claude Sonnet on reasoning/code benchmarks, but it has a smaller daily quota and has occasionally been dropped from Groq's free catalog — use it as an occasional step-up, not your daily driver. |
| **Gemini** | Free daily quota, or paid | `gemini-2.5-flash-lite` stretches the free tier furthest (same default this app used before). Enable billing to remove the wall. |
| **OpenAI** | Paid only | No free tier. |
| **Anthropic** | Paid only | No free tier, and always needs the proxy — the Anthropic API blocks direct browser calls. |

Groq quota figures above come from Groq's published rate limits as of
mid-2026; check `console.groq.com` for the current numbers before you rely
on them for anything time-sensitive.

## Known learnings carried over from The Room's earlier build

- **CDN dependencies are a liability** — this file has zero `<script src>`
  or `@font-face` from external CDNs. Fonts are system-stack only.
- **Gemini 2.5+ thinking tokens** eat your `maxOutputTokens` unless you set
  `thinkingConfig.thinkingBudget: 0` — already wired in for non-reasoning
  calls.
- **Silent fallbacks are dangerous** — if a report's JSON parse fails, the
  app shows an explicit "Estimated locally" badge with a locally-computed
  score, rather than silently swapping in a vague placeholder.
- Reports are built from a single AI call per module (not several), in
  keeping with the quota-conscious pattern from The Room's other modules.

## Roadmap ideas (not built yet)

- Camera-based delivery analysis in Presentation Studio (port the On Air
  MediaPipe pattern).
- CV/JD file upload with real PDF/DOCX text extraction.
- Meeting Simulator module (stand-ups, 1:1s, retros, conflict, negotiation).
- Session replay/compare in Progress, beyond the current flat list.
- 
