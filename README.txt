1exbug Portfolio — v23 Final Polish

Updated: 30.09.2026

Included:
- 1xSlots payout: 200 000 ₽
- ON-X Casino payout: 75 000 ₽
- Vodka Casino content left unchanged
- Stable RU/EN language switch with localStorage fallback
- Safe content-first animation fallback if GSAP/CDN is unavailable
- Fixed target-row navigation bug
- Fixed reveal/GSAP visibility conflicts
- Added real Stats section for the Stats navigation item
- Added responsive accessibility improvements (focus, skip link, mobile menu state)
- Hardened theme persistence and clipboard fallbacks
- Safe terminal output (typed HTML is rendered as text)
- Added payout data to both public write-up pages
- Removed unused Lenis CDN dependency; native smooth scrolling is used
- Added cache-busting query strings for main static assets

Deployment:
1. Replace the files in the GitHub Pages project folder with the archive contents.
2. In PowerShell:
   git add .
   git commit -m "Polish portfolio and finalize interactions"
   git push
3. Open https://1exbug.github.io/ and press Ctrl+F5.
