# 🧀 Kaasbord — Untappd, maar dan voor kaas

Maak een foto van een kaas (of het etiket), laat **Claude** herkennen welke kaas het is,
geef sterren, schrijf notities en verzamel badges. Gebouwd met Next.js, klaar voor Vercel,
en te installeren als app op je iPhone.

## Functies
- 📷 Foto maken met de iPhone-camera → Claude herkent naam, soort, melk, land, rijping, smaak en combinaties
- ⭐ Beoordelen met halve sterren, notities en locatie
- 🏠 Feed met al je check-ins, 🏅 profiel met statistieken, top-5 en badges
- 💾 Gegevens blijven op je telefoon (IndexedDB) — export als JSON-backup
- 🔒 Optioneel wachtwoord zodat niemand anders jouw API-tegoed gebruikt

## Op Vercel zetten
1. Maak een API-sleutel op <https://console.anthropic.com/settings/keys>.
2. Ga naar <https://vercel.com/new> en importeer deze GitHub-repo (`thomlaer/Kaas`).
3. Voeg bij **Environment Variables** toe:
   - `ANTHROPIC_API_KEY` = je sleutel
   - `APP_PASSWORD` = een zelfgekozen wachtwoord (aanbevolen)
4. Klik **Deploy**.

## Op je iPhone installeren
1. Open de Vercel-URL in **Safari**.
2. Tik op **Deel** → **Zet op beginscherm**.
3. Open Kaasbord vanaf je beginscherm; bij de eerste check-in vraagt de app om je wachtwoord.

## Lokaal draaien
```bash
cp .env.example .env.local   # vul je sleutel in
npm install
npm run dev
```

## Hoe het werkt
- `app/api/identify/route.ts` stuurt de (verkleinde) foto naar de Claude API (`claude-opus-5`)
  met structured outputs, zodat er altijd netjes gestructureerde kaasinformatie terugkomt.
- `lib/badges.ts` bevat de badges — voeg er gerust zelf meer toe.
