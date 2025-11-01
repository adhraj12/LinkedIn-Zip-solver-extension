<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Works-success?logo=google-chrome&style=for-the-badge" alt="Chrome"/>
  <img src="https://img.shields.io/badge/Edge-Works-success?logo=microsoft-edge&style=for-the-badge" alt="Edge"/>
  <img src="https://img.shields.io/badge/Brave-Works-success?logo=brave&style=for-the-badge" alt="Brave"/>
</p>

<h1 align="center">LinkedIn Zip Solver 🧩</h1>
<p align="center">
  A lightweight browser extension that automatically solves Zip (Number Net) puzzles in LinkedIn Minigames.
</p>

<p align="center">
  <a href="#installation"><img src="https://img.shields.io/badge/Install-📦%20Load%20Unpacked-2f80ed?style=for-the-badge" alt="Install"/></a>
  <a href="#demo"><img src="https://img.shields.io/badge/Demo-🎬%20GIF-27ae60?style=for-the-badge" alt="Demo"/></a>
  <a href="#usage"><img src="https://img.shields.io/badge/Usage-🚀%20How%20to%20Use-f39c12?style=for-the-badge" alt="Usage"/></a>
  <a href="#troubleshooting"><img src="https://img.shields.io/badge/Troubleshooting-🛠️-e74c3c?style=for-the-badge" alt="Troubleshooting"/></a>
</p>

<p align="center">
  <a href="https://github.com/adhraj12/LinkedIn-Zip-solver-extension/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/adhraj12/LinkedIn-Zip-solver-extension?style=social"></a>
  <a href="https://github.com/adhraj12/LinkedIn-Zip-solver-extension/issues"><img alt="Issues" src="https://img.shields.io/github/issues/YOUR_GITHUB/YOUR_REPO?label=issues"></a>
  <a href="https://github.com/adhraj12/LinkedIn-Zip-solver-extension/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/adhraj12/LinkedIn-Zip-solver-extension"></a>
  <img alt="Last commit" src="https://img.shields.io/github/last-commit/adhraj12/LinkedIn-Zip-solver-extension">
</p>

---

## Demo

<p align="center">
  <img src="./docs/demo.gif" alt="LinkedIn Zip Solver demo" width="780">
</p>

## Features

- One-Click Solve: Click the extension icon and the puzzle solves itself.
- Automatic Detection: Finds the grid, numbers, and walls—no manual selection.
- Visual Path: Draws the full number-to-number path directly on the grid.
- Clear Feedback: In-page toasts for “Solving…”, “Solved!”, and errors.
- Local-Only: Everything runs in your browser; no data leaves your machine.

## Installation

Works on Chromium-based browsers (Chrome, Edge, Brave).

1) Download  
- Click the green <> Code button on this repo → Download ZIP.  
- Unzip it. Ensure the folder contains `manifest.json` and extension files.

2) Open Extensions  
- Chrome: visit `chrome://extensions`  
- Edge: visit `edge://extensions`  
- Brave: visit `brave://extensions`

3) Enable Developer Mode  
- Toggle Developer mode on the top right.

4) Load Unpacked  
- Click Load unpacked (top left).  
- Select the unzipped folder that contains `manifest.json`.

5) Pin It  
- Click the puzzle icon 🧩 in the toolbar and pin “LinkedIn Zip Solver”.

## Usage

1) Open a LinkedIn Zip puzzle page.  
2) Click the extension icon (or pin and click from the toolbar).  
3) Watch the solver draw the solution path.

## How It Works (high-level)

- DOM parsing: Detects the puzzle grid and reads tiles, numbers, and walls from the LinkedIn minigame DOM.
- Modeling: Builds an internal grid graph with constraints from numbers and walls.
- Solver: Finds a valid continuous path that visits numbers in the required order using graph search + heuristics.
- Rendering: Overlays the path back on the puzzle with a lightweight canvas/SVG.

## Permissions

This extension only requests the minimum needed to run on LinkedIn puzzle pages.

```json
{
  "name": "LinkedIn Zip Solver",
  "manifest_version": 3,
  "version": "1.0.0",
  "description": "Automatically solves Zip (Number Net) puzzles on LinkedIn.",
  "icons": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" },
  "action": { "default_title": "Solve LinkedIn Zip" },
  "permissions": ["activeTab", "scripting"],
  "host_permissions": ["https://*.linkedin.com/*"],
  "background": { "service_worker": "background.js" }
}
```

## Troubleshooting

- Button does nothing  
  - Make sure you’re on a LinkedIn Zip puzzle page.  
  - Refresh the page, then click the icon again (dynamic content sometimes needs a reload).

- “Load unpacked” is disabled  
  - Enable Developer mode on the extensions page.

- “Manifest file is missing or unreadable”  
  - Ensure you selected the folder that directly contains `manifest.json`.

## Related

<p align="center">
  <a href="https://github.com/adhraj12/LinkedIn-Sudoku-solver-extension">
    <img src="https://img.shields.io/badge/LinkedIn%20Sudoku%20Solver-2f80ed?style=for-the-badge&logo=github&logoColor=white" alt="LinkedIn Sudoku Solver" />
  </a>
  <a href="https://github.com/adhraj12/LinkedIn-Tango-solver-extension">
    <img src="https://img.shields.io/badge/LinkedIn%20Tango%20Solver-2f80ed?style=for-the-badge&logo=github&logoColor=white" alt="LinkedIn Tango Solver" />
  </a>
</p>


## Disclaimer

This project is not affiliated with, associated with, or endorsed by LinkedIn. Use at your own discretion.

## License

Apache-2.0 — see LICENSE.
