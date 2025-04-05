# ChemLab Tycoon (Pixi.js Prototype)

## 1. Overview

ChemLab Tycoon is a 2D simulation/management game prototype built with TypeScript, Pixi.js, and Vite. The player manages a small chemical processing facility with the goal of maximizing profit ($) and expanding operations.

The core gameplay involves:
*   Buying basic raw chemicals.
*   Purchasing and placing processing machines (e.g., Mixers).
*   Machines automatically consuming input chemicals from inventory and processing them into more valuable products based on defined recipes.
*   Selling finished products for profit.
*   Using profits to buy more raw materials or expand the facility with more machines.

This project serves as both a functional game prototype and a learning exercise for developing web-based games using modern frontend technologies.

**Technology Stack:**
*   **Language:** TypeScript
*   **Rendering:** Pixi.js (v7+)
*   **Build Tool/Dev Server:** Vite
*   **Package Manager:** npm

## 2. Current Status (MVP v1.0 - Implemented)

The current version represents a Minimum Viable Product (MVP) demonstrating the core gameplay loop. Key implemented features include:

*   **Basic Game World:**
    *   A fullscreen Pixi.js canvas with a solid background color.
    *   Window resize handling.
*   **Core Game State:**
    *   Player `currency` tracked and displayed.
    *   `Inventory` system tracking chemical counts (`Raw Chemical A`, `Product B`) with a maximum capacity.
*   **Chemicals & Recipes:**
    *   Defined `Raw Chemical A` (purchasable).
    *   Defined `Product B` (sellable).
    *   Defined a `Mixer` machine type.
    *   Defined a recipe: `1 Raw Chemical A` -> `1 Product B` via `Mixer` (takes 5 seconds).
    *   Data managed via structured TypeScript objects/interfaces in the `src/data/` directory.
*   **Machines (`MachineInstance` class):**
    *   Functional `Mixer` machine instances can be placed.
    *   Machines have internal states (`Idle`, `Processing`, `Blocked_Output`, `No_Recipe`).
    *   Machines automatically check inventory for inputs and consume them.
    *   Machines process chemicals based on assigned recipe and timer.
    *   Machines automatically add output products to inventory (checking capacity).
    *   Basic visual representation using colored `PIXI.Graphics` squares that change color based on status (Blue=Idle, Yellow=Processing, Red=Blocked).
    *   Status text displayed below each machine.
*   **UI (`UIManager` class):**
    *   Displays current currency (`$`).
    *   Displays inventory load vs. capacity.
    *   Displays placement instructions/feedback text.
    *   Interactive UI Buttons (using `PIXI.Container` + `Graphics` + `Text`):
        *   "Buy Raw A ($10)"
        *   "Sell Product B ($25)"
        *   "Buy Mixer ($100)"
*   **Interaction:**
    *   Buy/Sell buttons modify currency and inventory correctly.
    *   "Buy Mixer" button initiates placement mode if funds allow.
    *   Player enters placement mode with a visual preview sprite (`PIXI.Graphics` square) following the cursor.
    *   Left-clicking on the stage during placement mode places the Mixer, deducts cost, and exits placement mode.
    *   Placement mode can be cancelled via Right-click, Escape key, or clicking the "Buy Mixer" button again.
    *   Event propagation from buttons to the stage is handled correctly (`event.stopPropagation()`).

## 3. Next Steps (Implementation Plan for v1.1)

The immediate goals are to expand the game's content and improve its visual presentation.

### Phase 1: Add More Content (Heater & Product C)

*   **Goal:** Introduce a second processing tier, requiring players to chain processes together.
*   **Tasks:**
    1.  **Define New Chemical:**
        *   In `src/data/Chemicals.ts`, add data for `'Product C'` (sellable, e.g., $60).
    2.  **Define New Machine Type:**
        *   In `src/data/Machines.ts`, add data for `'Heater'` (cost $300, requires a placeholder sprite path like `'assets/sprites/heater_placeholder.png'`).
    3.  **Define New Recipe:**
        *   In `src/data/Recipes.ts`, add a recipe for the Heater: `1 Product B -> 1 Product C` (e.g., 8 seconds).
    4.  **Add UI Button:**
        *   In `src/UIManager.ts`, add a "Buy Heater ($300)" button.
        *   Update the `UIManager` constructor to accept an `onBuyHeaterClick` callback.
    5.  **Add GameManager Logic:**
        *   In `src/GameManager.ts`, add the `handleBuyHeater` method to initiate placement for the 'Heater' type.
        *   Pass the new handler to the `UIManager` constructor.
    6.  **Testing:** Verify buying/placing Heaters, processing B->C, and selling C.

### Phase 2: Visual Polish (Sprites & Asset Loading)

*   **Goal:** Replace placeholder graphics with image-based sprites for a better look and feel.
*   **Tasks:**
    1.  **Acquire Sprite Assets:**
        *   Download or create simple `.png` sprite images (32x32 or 64x64 recommended) for the Mixer and Heater.
        *   **Recommended Source:** [Kenney.nl Assets](https://kenney.nl/assets) (search for suitable top-down objects/icons, ensure CC0 license).
        *   Place these files (e.g., `mixer.png`, `heater.png`) into the `public/assets/sprites/` directory.
    2.  **Update Machine Data:**
        *   In `src/data/Machines.ts`, update the `spritePath` values to match the actual filenames (e.g., `'assets/sprites/mixer.png'`).
    3.  **Implement Asset Pre-loading:**
        *   In `src/GameManager.ts`, within the `initApp` method (before creating UI/machines):
            *   Create a `private textures: Map<string, PIXI.Texture>;` property.
            *   Collect all unique `spritePath` values from `MACHINE_TYPE_DATA`.
            *   Use `await PIXI.Assets.load(arrayOfSpritePaths)` to load all textures.
            *   Store the loaded textures in the `textures` map, keyed by their path or machine type ID.
    4.  **Refactor `MachineInstance.ts`:**
        *   Modify the constructor to accept a `PIXI.Texture` instead of creating `PIXI.Graphics`.
        *   Replace the `bodyGfx: PIXI.Graphics` property with `private sprite: PIXI.Sprite`.
        *   Instantiate `this.sprite = new PIXI.Sprite(texture)` in the constructor and add it to the `spriteContainer`.
        *   Remove graphics drawing code.
        *   Update `updateVisualState` to use `this.sprite.tint` (e.g., `0xFFFFFF` for Idle, `0xFFDD00` for Processing, `0xFF0000` for Blocked) instead of changing fill color.
    5.  **Refactor `GameManager.ts`:**
        *   Modify `placeMachine` to retrieve the appropriate pre-loaded texture from the `textures` map based on the `machineType` and pass it to the `MachineInstance` constructor.
        *   Modify `createPlacementPreview` to create a `PIXI.Sprite` using the correct texture, setting its `alpha = 0.5` and potentially a green `tint = 0x00FF00`. Update `destroyPlacementPreview`.
    6.  **Testing:** Verify that machines and the placement preview now use the loaded sprites and that tinting works correctly for different machine states.

## 4. Getting Started

1.  **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) (which includes npm) installed.
2.  **Clone:** Clone this repository to your local machine.
3.  **Install Dependencies:** Open a terminal in the project root directory and run:
    ```bash
    npm install
    ```
4.  **Run Development Server:** Start the Vite development server:
    ```bash
    npm run dev
    ```
5.  **Open:** Open the local URL provided by Vite (usually `http://localhost:5173`) in your web browser.

## 5. Future Goals (Post v1.1)

*   Saving and Loading game state (`localStorage`).
*   Implementing inventory and machine upgrades.
*   Adding more complex chemical chains and machine types.
*   Sound effects and background music.
*   UI improvements (dedicated panels, better layout).
*   Potential optimization (e.g., updating UI only when state changes).