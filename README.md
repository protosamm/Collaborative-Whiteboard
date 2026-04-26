# Collaborative Whiteboard

Live Demo:- https://wedraw-5xs3.onrender.com

A real-time collaborative whiteboard built from scratch with vanilla JavaScript, Canvas API, Node.js and Socket.io. No frameworks, no canvas libraries — just the web platform.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)

---

## Features

### Drawing Tools
- **Pen** — freehand drawing with smooth curve interpolation
- **Rectangle** — hold `Shift` for perfect squares
- **Ellipse** — hold `Shift` for perfect circles
- **Line** — hold `Shift` to snap to 45° angles
- **Eraser** — segment-aware eraser that detects strokes anywhere along their path

### Canvas
- Huge canvas with pan and zoom
- Dot grid that scales with zoom level
- Two-layer rendering for smooth performance — static layer for completed strokes, dynamic layer for live preview

### Multiplayer
- Create or join rooms with a room code and optional password
- Live cursor positions for all connected users
- Host migration — if the host leaves, another user becomes host automatically
- Session persistence — refresh the page and automatically rejoin your room
- Shareable room URL — share the URL directly to invite others

### Other
- Undo / Redo — per-action history that works correctly in multiplayer
- Save / Load — export your board as a `.wboard` file and reload it later
- Stroke and fill color pickers with swap and sync options
- Adjustable stroke width
- Zoom slider with percentage display
- Keyboard shortcuts for everything
- ~~Responsive layout — left toolbar on landscape, bottom toolbar on portrait.~~

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `P` | Pen tool |
| `E` | Eraser tool |
| `R` | Rectangle tool |
| `O` | Ellipse tool |
| `L` | Line tool |
| `[` / `]` | Decrease / Increase stroke width |
| `0` | ~~Reset zoom to 100%~~ |                                     ( not implemented yet )
| `N` | Toggle Toolbar
| `Space + drag` | Pan canvas |
| `Scroll` | Zoom in / out |
| `Shift + drag` | Constrain shape proportions |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + S` | Save board to file |
| `Ctrl + O` | Load board from file |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Drawing | HTML5 Canvas 2D API |
| Multiplayer | Socket.io |
| Server | Node.js + Express |
| Styling | Vanilla CSS |
| Modules | ES Modules (no bundler) |

No frontend framework. No canvas library. No build step.

---

## Project Structure

```
Collaborative_Whiteboard/
├── client/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js          # entry point
│       ├── canvas.js        # canvas references
│       ├── state.js         # shared app state
│       ├── renderer.js      # two-layer rendering
│       ├── history.js       # undo/redo
│       ├── fileManager.js   # save/load .wboard files
│       ├── utils.js         # shared utilities
│       ├── camera.js    # pan, zoom, coordinate conversion
│       ├── grid.js      # infinite dot grid
│       ├── tools/
│       │   ├── pen.js
│       │   ├── eraser.js
│       │   ├── rect.js
│       │   ├── ellipse.js
│       │   └── line.js
│       ├── events/
│       │   ├── keyboard.js  # keyboard shortcuts
│       │   └── mouse.js     # mouse event handling
|       |   └── ui.js
│       └── multiplayer/
│           ├── socket.js    # socket connection + emit helpers
│           ├── room.js      # create/join room logic
│           └── cursors.js   # live cursor rendering
└── server/
    ├── index.js             # Express + Socket.io server
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+

### Local Development

```bash
# clone the repo
git clone https://github.com/yourusername/collaborative-whiteboard.git
cd collaborative-whiteboard

# install server dependencies
cd server
npm install

# start the server
node index.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For multiplayer, open the same URL in another tab or share it on your local network.

---

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |

Update `server/index.js` to use `process.env.PORT`:

```js
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`server running on port ${PORT}`));
```

---

## How It Works

### Infinite Canvas
The canvas never actually moves — instead a `camera` object tracks `x`, `y`, and `zoom`. Before drawing anything, `ctx.translate(camera.x, camera.y)` and `ctx.scale(camera.zoom, camera.zoom)` shift the entire world. Panning updates `camera.x/y`, zooming updates `camera.zoom` while keeping the center point fixed.

### Two-Layer Rendering
Two stacked canvases solve the performance problem of redrawing everything on every mouse move:
- **Static canvas** — redrawn only when a stroke is completed or deleted
- **Dynamic canvas** — redrawn on every mouse move for live preview and cursors

### Vector Storage
Every stroke is stored as a plain JavaScript object with world-space coordinates. This makes undo/redo, save/load, and multiplayer sync straightforward — strokes are just JSON.

### Multiplayer Sync
The server stores room state in memory — no database. When a stroke is completed, it's emitted to the server which broadcasts it to all other clients in the room. The server keeps a copy of all strokes so new joiners get the full board state immediately without asking the host.

### Undo/Redo in Multiplayer
Each undo/redo action is translated into the equivalent draw or erase operation and synced to peers — so undoing a stroke emits an erase event, and redoing it emits a stroke-added event. No special undo protocol needed.

---

## License

MIT
