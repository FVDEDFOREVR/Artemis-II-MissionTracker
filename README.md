# Artemis II Live Mission Tracker

Real-time Artemis II mission tracker built with Next.js, TypeScript, and Tailwind CSS, using NASA-published Artemis II state vectors and JPL Horizons Moon vectors.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Canvas + CSS animation only

## Data Sources

- NASA Artemis II AROW OEM ephemeris
- JPL Horizons Moon vectors

## Local Development

```bash
npm install
npm run dev
```

The dev server is configured to listen on `0.0.0.0` so it can be viewed from other devices on the same network.

## Deployment

This project builds cleanly for Vercel with:

```bash
npm run build
```

No environment variables are required.

## Licensing Note

Recommended code license: MIT.

Repository code can be licensed under MIT, but NASA branding, Artemis marks, logos, and any third-party imagery or mission artwork may be subject to separate trademark, attribution, or media-use rules and should be treated as excluded from the code license unless you have confirmed otherwise.
