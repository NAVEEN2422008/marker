# marker — AR Solar System & Video

An AR.js/A-Frame marker-based experience that renders an orbiting 3D solar system and plays a video when specific printed markers are detected.

## Features
- Marker-triggered AR solar system (Sun, Earth, Moon) with real textures and materials.
- Orbital mechanics: Earth/Moon orbit + self-rotation, animated sun glow.
- Second marker triggers an in-scene video player.
- Pinch-to-zoom camera control on touch devices.
- On-screen status overlay ("Searching for markers…" → active indicator).

## Tech Stack
- A-Frame 1.4.0, AR.js (aframe-ar)
- Three.js (via A-Frame), aframe-extras
- Custom pattern markers (`.patt`) + sample planet textures

## Project Structure
```
├── index.html           # AR scene + components
├── solar-system.js      # orbital animation component
└── ar/
    ├── solar/           # solar marker (.patt, .png)
    └── output/          # video marker + output.mp4
```

## Installation
- Serve the repo over **HTTPS** (required for webcam on most browsers).

## Usage
```bash
# serve with a static server, e.g.
python3 -m http.server 8080
```
1. Allow camera access and print/augment the markers in `ar/`.
2. Point the camera at the solar pattern to spawn the solar system.
3. Point at the output pattern to play the video.