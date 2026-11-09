# BEHIND THE WEB — SPH4U Physics Companion

An offline-capable, browser-based, interactive presentation aid for the **five selected team scenes from _Spider-Man: Homecoming_**:

1. Staten Island Ferry — tension, Young's modulus, elastic energy.
2. Vulture Drops Spider-Man — parachute drag, terminal speed, impulse.
3. Alien Weapon Cuts a Brick Wall — heat capacity, latent heat, beam power.
4. Washington Monument Elevator Rescue — work–energy, web spring, damping.
5. Spider-Man vs. The Shocker — locker impact, blast, bus torque, web restraint, moving car.

## Run it

**Fastest:** Unzip the project, then double-click `index.html`. All core features work without internet.

**In VS Code:** Open the folder; use the Live Server extension if you prefer a local server. No installation, npm, server, database, or account required.

## Controls

- Click a case card or the numbered case selectors.
- Move sliders to update the illustration, calculated values, and equation walkthrough.
- **PLAY MODEL** animates an explanatory schematic; **RESET** restarts.
- **LOCAL CLIP** loads your own MP4 from your device for temporary preview. It never uploads the file anywhere. Use **SHOW MODEL** to switch back.
- Use **NEXT STEP / BACK** for short calculations.
- Open **VIEW INPUTS & SOURCES** for uncertainty notes and research links.
- Press **P** to toggle presentation focus. On a case page use **← / →** to switch scenes.

## Academic limitations

This is a presentation **companion**, not a replacement for Mr. Li's requested MP4 video and PDF solution sheet.

The calculations deliberately distinguish between movie-referenced values, research values, and group-chosen assumptions. Interactions are sensitivity demonstrations rather than accurate frame-by-frame simulation of the film. The live illustrations are original schematics, **not footage or precise measurements from the movie**.

### Ferry assumptions

- Outward separating load per ferry half = 200 kN (chosen by team, not measured).
- 10 equal-load strands per half, angle = 30°, strand diameter = 10 mm, original length = 15 m.
- Representative spider-silk Young's modulus = 8.0 GPa; representative ultimate strength = 932 MPa.
- Spider-Man mass = 64 kg; his weight is not the horizontal force separating the ferry halves.

### Vulture drop assumptions

- Mass 64 kg, canopy diameter 7 m, air density 1.225 kg/m³, Cd 1.5.
- The main full-canopy descent model starts from rest under quadratic drag; film opening is a separate event.
- The modeled 1000 m height is an assumed input from a team report, not a confirmed film height.
- A separate illustrative impulse calculation assumes 2.5 seconds of free fall and 0.44 seconds of opening.

### Alien weapon assumptions

- Cut area 0.55491 m², thickness 0.092 m, heating duration 2.87 s.
- Density 1920 kg/m³, specific heat 840 J/(kg K), start temperature 25°C, melt temperature 1100°C, latent heat 250 kJ/kg.
- Treats removed material as an idealized clay-like brick and assumes complete uniform heating and melting.

### Elevator assumptions

- 1500 kg elevator + passengers, 10 m free fall, 2 m additional stopping distance.
- Includes a selectable energy loss term (original lossless assumption = 0 kJ).
- Critically damped model shown as a **separate extension**, not a jointly solved coupled model.

### Shocker assumptions

- The source report identifies the five moments but does not numerically specify each mass, speed, duration or force; calculator presets are illustrative assumptions only.

## References to consult in your submitted solution sheet

- The five team reports and their scene footage.
- Natural spider-silk reference: https://pmc.ncbi.nlm.nih.gov/articles/PMC7355793/
- Thermophysical reference sources: https://www.engineeringtoolbox.com/specific-heat-capacity-d_391.html and https://www.engineeringtoolbox.com/ceramics-properties-d_1227.html
- OpenStax University Physics: https://openstax.org/details/books/university-physics-volume-1
- Group-provided Shocker clip: https://www.youtube.com/watch?v=tu6FDI4JBDY

## Files

- `index.html` — semantic structure and navigation shell.
- `styles.css` — responsive cinematic/scientific style.
- `app.js` — five calculations, event system, SVG illustrations, and interactions.

Everything visible in the application is in English. No external script libraries and no network calls are required.
