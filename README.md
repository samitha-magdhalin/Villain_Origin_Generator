# 🦹 Villain Origin Generator

Paste any WhatsApp chat, Twitter bio, or upload a chat screenshot — AI generates a comic-book supervillain origin story based on your texting patterns. Pure meme fuel, built to be screenshotted.

Built by [CodeLife Chronicles](https://instagram.com/codelifechronicles) 🎬

---

## ✨ Features

- **Text or screenshot input** — paste raw text or drag-drop a chat screenshot (OCR'd client-side, never uploaded)
- **3 villain vibes** — Petty Evil, Passive-Aggressive, Pure Chaos
- **Instant AI generation** — sub-second responses via Groq's free tier
- **Downloadable comic card** — export as PNG for Instagram/WhatsApp
- **Shareable links** — each villain gets a unique URL with a custom link-preview image, so it unfurls as the actual card when shared on WhatsApp/Twitter/Discord
- **Zero cost** — runs entirely on free tiers

---

## 🛠️ Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Frontend + API routes in one repo, free Vercel hosting |
| AI generation | Groq API (Llama 3.3 70B) | Free tier, fastest inference available — feels instant |
| Screenshot OCR | Tesseract.js | Runs in-browser, no image ever leaves the user's device |
| Styling | Tailwind CSS | Fast, consistent comic-panel styling |
| Fonts | Google Fonts (Bangers, Comic Neue) | Free, instant comic-book feel |
| Card export | html-to-image | Turns the card DOM node into a downloadable PNG |
| Database | Supabase (free tier) | Stores generated villains under a unique slug for shareable links |
| Dynamic OG images | @vercel/og | Server-renders a preview image per villain so shared links show the card, not a generic thumbnail |
| Rate limiting | Upstash Redis (free tier) | Protects the Groq quota from abuse |
| Hosting | Vercel (free tier) | Zero-config Next.js deploys |

---

## 📁 Project Structure

```
villain-origin/
├── app/
│   ├── page.tsx                        # Homepage — input form, vibe selector
│   ├── layout.tsx                      # Root layout, fonts, metadata
│   ├── api/
│   │   └── generate/
│   │       └── route.ts                # POST — rate limit → Groq call → save to Supabase
│   └── villain/
│       └── [slug]/
│           ├── page.tsx                # Renders the villain card for a given slug
│           └── opengraph-image.tsx     # Dynamic OG image for link previews
├── components/
│   ├── VillainCard.tsx                 # The comic-style card component
│   ├── UploadInput.tsx                 # Drag-drop + textarea + Tesseract OCR logic
│   └── VibeSelector.tsx                # Petty Evil / Passive-Aggressive / Pure Chaos tabs
├── lib/
│   ├── supabase.ts                     # Supabase client
│   ├── ratelimit.ts                    # Upstash Redis rate limiter
│   └── prompt.ts                       # Groq prompt template
├── public/
├── .env.example
├── tailwind.config.ts
└── package.json
```

---

## ⚙️ Setup

### 1. Clone & install
```bash
git clone <your-repo-url>
cd villain-origin
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env.local` and fill in:

```
GROQ_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | console.groq.com → free account, no card required |
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | supabase.com → new free project → Settings → API |
| `UPSTASH_REDIS_REST_URL` / `TOKEN` | upstash.com → new free Redis database |

### 3. Supabase table
Create a `villains` table:

| Column | Type |
|---|---|
| `id` | uuid, primary key |
| `slug` | text, unique |
| `villain_json` | jsonb |
| `created_at` | timestamp, default now() |

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy
Push to GitHub, import the repo in Vercel, add the same env vars in the Vercel dashboard, deploy.

---

## 🔒 Privacy

- Uploaded screenshots are OCR'd entirely in-browser (Tesseract.js) — the image itself is never sent to any server
- Only the final structured villain JSON is stored, never the raw pasted text or screenshot content
- No personal identifiers are requested or stored

---

## ⚠️ Disclaimer

This tool is satire. All output is AI-generated fiction for entertainment purposes and should not be interpreted as a real personality or psychological analysis.

---

## 📈 Roadmap / Ideas
- [ ] Add a "regenerate" button for a second AI attempt
- [ ] Villain "leaderboard" of most-shared cards
- [ ] Seasonal/themed vibe packs (e.g., "Corporate Villain," "Group Chat Villain")

---

## 🧑‍💻 Credit

Built as part of the **CodeLife Chronicles** micro-tool series — identifying gaps in existing products and shipping fast, shareable web tools.
