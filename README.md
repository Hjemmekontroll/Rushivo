# RUSHIVO

**Fast games. Good friends.**

Made in Norway 🇳🇴

RUSHIVO is a simple pass-the-phone party game for iPhone.

## First playable MVP

- 2–8 local players
- QUICK 3 game mode
- Random challenge cards
- 5-second countdown
- GOT IT / FAILED scoring
- 3 rounds per player
- Final leaderboard and winner
- Play again
- No backend, accounts, login, or online multiplayer

## Tech

- React Native
- Expo SDK 57
- EAS Build
- iOS first
- Bundle ID: `no.hjemmekontroll.rushivo`

## Development

```bash
npm install
npx expo install --fix
npx tsc --noEmit
npx expo start --dev-client
```

The project is intentionally separate from Hjemmekontroll and Build Rush.
