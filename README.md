# 🧀 Formatica

Untappd, maar dan voor kaas. Maak een foto van een kaas (of het etiket), laat **Claude**
herkennen welke kaas het is, geef sterren, schrijf notities en verzamel badges.
Gebouwd met Next.js, gehost op Vercel en te installeren als app op je iPhone.

## Functies
- 👤 Inloggen met alleen je naam (nog geen wachtwoord)
- 📷 Foto maken met de iPhone-camera → Claude herkent naam, soort, melk, land, rijping, smaak en combinaties
- ⭐ Beoordelen met halve sterren, notities en locatie
- 🏠 Gedeelde feed met de check-ins van iedereen, 🏅 profiel met statistieken, top-5 en badges
- 🗄️ Alles wordt opgeslagen in **Vercel Blob** (check-ins als JSON, foto's als JPEG)

## Op Vercel zetten
1. Importeer deze repo op <https://vercel.com/new>.
2. Maak onder **Storage** een **Blob**-store aan en koppel hem aan het project
   (dit zet `BLOB_READ_WRITE_TOKEN` automatisch).
3. Voeg bij **Settings → Environment Variables** `ANTHROPIC_API_KEY` toe
   (sleutel van <https://console.anthropic.com/settings/keys>).
4. Deploy (opnieuw) zodat de variabelen actief worden.

## Op je iPhone installeren
Open de Vercel-URL in **Safari** → **Deel** → **Zet op beginscherm**.

## Lokaal draaien
```bash
cp .env.example .env.local   # of: vercel env pull .env.local
npm install
npm run dev
```

## Hoe het werkt
- `app/api/identify/route.ts` stuurt de verkleinde foto naar de Claude API (`claude-opus-5`)
  met structured outputs, zodat er altijd gestructureerde kaasinformatie terugkomt.
- `app/api/checkins/route.ts` + `lib/db.ts` lezen en schrijven check-ins in Vercel Blob.
- `lib/badges.ts` bevat de badges — voeg er gerust zelf meer toe.
