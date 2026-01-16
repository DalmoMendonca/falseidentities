# False Identities

An interactive web app to explore the 21 false identities, search and filter the library, and work through a guided reflection exercise.

## Features
- Searchable identity library with filters and detail pages
- "Uncovering Your False Identity" guided exercise
- Optional AI helper (requires an OpenAI API key)
- Optional PDF import script for licensed source material

## Requirements
- Node.js 18+ and npm

## Quick start
1) Install dependencies:
   npm install
2) Set env vars:
   copy `.env.local.example` to `.env.local` and fill values
3) Run the app:
   npm run dev
4) Open http://localhost:3000

## Content
This project does not include the original book text. You must have rights to use any source material you import.

Add or update the dataset:
- Option A: Manually edit `content/false_identities.json` using `content/schema.json` as the guide.
- Option B: Place a licensed PDF at `content/source.pdf`, adjust `scripts/extract_from_pdf.py` to the layout, then run:
  npm run extract:pdf

## Environment variables
- OPENAI_API_KEY: required only for the AI helper
- OPENAI_MODEL: model name (default in `.env.local.example`)
- NEXT_PUBLIC_SITE_URL: the public URL of the site

## Scripts
- npm run dev
- npm run build
- npm run start
- npm run lint
- npm run extract:pdf

## Deploy
- Vercel: import the repo, set env vars, deploy.
- Any Node host: npm run build && npm start
