# Among the Stars 🌌

A 3-stage interactive galactic-themed website:

1. **Hero / Wallpaper stage** — animated starfield + "Begin the Journey" button
2. **Introduction stage** — your gratitude letter, with a cosmic warp-travel
   animation when she clicks "Continue"
3. **Main stage** — three realistic, particle-rendered spiral galaxies
   revealed **one at a time**. Each galaxy is clickable, opens a personal
   message, and auto-plays its own song. A warp/travel animation plays
   between every transition, and a **Back** button lets her retrace her steps.

Everything is plain HTML/CSS/JS — no build tools, no frameworks, so it
runs directly from GitHub Pages.

```
crush-galaxy-journey/
├── index.html      → all 3 stages + modal + finale
├── style.css        → galactic theme (glassmorphism, glow, nebulas)
├── script.js         → stage flow, warp transitions, galaxy rendering, audio
├── music/
│   ├── opm1.mp3      → placeholder song for Galaxy 1 (replace me)
│   ├── opm2.mp3      → placeholder song for Galaxy 2 (replace me)
│   └── opm3.mp3      → placeholder song for Galaxy 3 (replace me)
└── README.md
```

---

## 1. Replace the placeholder songs

The `music/` folder currently has 3-second soft placeholder tones so the
project runs out of the box. Swap in your real songs **using the exact
same filenames**:

```
music/opm1.mp3
music/opm2.mp3
music/opm3.mp3
```

If you want different filenames, update the three `src="music/..."` lines
near the bottom of `index.html`, or the `audio:`/id references in
`GALAXIES` at the top of `script.js`.

To edit the messages, titles, or colors for each galaxy, open `script.js`
and edit the `GALAXIES` array at the very top — it's all plain text.

---

## 2. Put this project in its own Termux folder

Open Termux and run:

```bash
pkg update -y && pkg install git -y

mkdir -p ~/projects/crush-galaxy-journey
cd ~/projects/crush-galaxy-journey
```

Now copy `index.html`, `style.css`, `script.js`, `README.md`, and the
`music/` folder (with your real mp3s inside) into
`~/projects/crush-galaxy-journey/`.

If you downloaded a zip of this project onto your phone, you can unzip it
straight into that folder with:

```bash
pkg install unzip -y
unzip /path/to/crush-galaxy-journey.zip -d ~/projects/crush-galaxy-journey
```

(adjust the download path — usually `~/storage/downloads/...` after
running `termux-setup-storage`)

---

## 3. Push it to GitHub

```bash
cd ~/projects/crush-galaxy-journey

git init
git add .
git commit -m "Among the Stars — first launch"

git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

(Create the empty repo on GitHub first, in the app or at github.com — no
README/license needed there, since you already have one.)

---

## 4. Turn on GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under "Build and deployment", set **Source: Deploy from a branch**
3. Branch: `main`, folder: `/ (root)` → **Save**
4. Wait ~1 minute, then your site is live at:
   `https://<your-username>.github.io/<repo-name>/`

Send her that link. 🌠

---

## Notes

- Autoplay: browsers require a user gesture before audio can play. Since
  she has to *click* the galaxy to open it, that click satisfies the
  browser's autoplay requirement, so the song starts immediately.
- Everything is self-contained — no external CDN, no API keys, no backend.
  It will work even on a very restricted network.
- Mobile-friendly and touch-enabled (tested interaction paths for both
  mouse click and touch tap on the galaxies).
