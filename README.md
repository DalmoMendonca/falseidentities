False Identities Interactive App (scaffold)

What's included
- Next.js (App Router) website scaffold
- JSON schema + dataset skeleton for the 21 false identities
- Identity library search + filters + detail pages
- "Uncovering Your False Identity" AI-guided exercise
- AI-assisted helper endpoint stub (bring your own OpenAI key)
- PDF extraction script stub that *only* runs if you have licensed permission to reproduce text

Important
- This zip does NOT include any word-for-word content from the source PDF.
- To ship a production app that contains the PDF text verbatim, you must have written permission / licensing from the rights holder.
  Once you have that, you can populate `content/false_identities.json` (or generate it via `npm run extract:pdf` after placing the PDF in `content/source.pdf`).

Quick start
1) Install deps:
   npm i
2) Run dev:
   npm run dev
3) Add content:
   - Option A: Manually paste licensed text into `content/false_identities.json` following `content/schema.json`.
   - Option B: Put the licensed PDF at `content/source.pdf` and adapt `scripts/extract_from_pdf.py` to your PDF layout, then:
     npm run extract:pdf

Environment variables
- Copy `.env.local.example` to `.env.local` and fill values.

Deploy
- Vercel: import repo, set env vars, deploy.
- Any Node host: npm run build && npm start
