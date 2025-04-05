# Changelog: ChemLab Tycoon (Pixi.js Prototype)

**Date:** October 26, 2023

This document summarizes the development progress for the ChemLab Tycoon Pixi.js prototype based on completed implementation steps.

---

## [Unreleased] - Initial Development Phase

### Features Added

*   **Project Setup (Step 1):**
    *   Initialized project using Vite with the `vanilla-ts` template.
    *   Installed Node dependencies (`npm install`).
    *   Added `pixi.js` library (`npm install pixi.js`).
    *   Configured basic Git repository and `.gitignore`.
*   **Pixi.js Initialization (Step 2):**
    *   Created core `GameManager.ts` class.
    *   Implemented Pixi.js `PIXI.Application` initialization within `GameManager`.
    *   Set up the Pixi canvas to render fullscreen in `index.html` via `#app` div.
    *   Applied basic CSS for fullscreen layout (`style.css`).
    *   Set background color and implemented window resize handling.
    *   Started the Pixi ticker (`app.ticker`) calling a basic `update` loop in `GameManager`.
    *   Modified `main.ts` to instantiate `GameManager`.
*   **Core Data Definition (Step 3):**
    *   Created `src/data` directory.
    *   Defined data structures (`interfaces`) for `ChemicalData`, `RecipeData`, `MachineTypeData`.
    *   Implemented constant data objects (`CHEMICAL_DATA`, `RECIPE_DATA`, `MACHINE_TYPE_DATA`) for MVP items (Raw A, Product B, Mixer, A->B Recipe).
    *   Added helper functions (`getChemicalData`, etc.) for data access.
    *   Created placeholder asset directory structure (`public/assets/`).
*   **Inventory System (Step 4):**
    *   Created `src/Inventory.ts` with the `Inventory` class.
    *   Implemented storage logic using `Map<string, number>`.
    *   Implemented capacity checking (`maxCapacity`, `getCurrentLoad`, `isFull`).
    *   Added methods (`addChemical`, `removeChemical`, `hasEnough`, `getAmount`, etc.).
    *   Integrated `Inventory` instance into `GameManager`.
*   **Basic UI Display (Step 5):**
    *   Created `src/UIManager.ts` class.
    *   Implemented display of Currency and Inventory count/capacity using `PIXI.Text`.
    *   Defined basic text styles (`PIXI.TextStyle`).
    *   Positioned UI elements on the stage.
    *   Integrated `UIManager` into `GameManager`, passing the stage reference.
    *   Added `currency` state to `GameManager`.
    *   Implemented `updateUIDisplays` method in `GameManager` called in the game loop.
*   **Buy/Sell Buttons & Logic (Step 6):**
    *   Added `createButton` method in `UIManager` using `PIXI.Graphics` and `PIXI.Text`.
    *   Passed click handler callbacks (`handleBuyChemicalA`, `handleSellProductB`) from `GameManager` to `UIManager` constructor.
    *   Implemented `handleBuyChemicalA` and `handleSellProductB` in `GameManager` to modify currency and inventory based on `ChemicalData`.
    *   Created "Buy Raw A" and "Sell Product B" buttons in the UI.
*   **Machine Instance & Processing (Step 7 Refactored):**
    *   Created `src/MachineInstance.ts` (renamed from `Machine.ts`) with the `MachineInstance` class.
    *   Implemented machine states (`Idle`, `Processing`, `Blocked_Output`, etc.).
    *   Added recipe timer logic (`processingTimerSeconds`) updated via `deltaMS`.
    *   Implemented interaction with `Inventory` to check/consume inputs (`removeChemical`) and add outputs (`addChemical`).
    *   Created basic visual placeholder using `PIXI.Graphics` and `PIXI.Text` for status display.
    *   Added `updateVisualState` to change color/text based on status.
    *   Integrated `MachineInstance` management into `GameManager` (added `machines` array, updated game loop to call `machine.update()`).
*   **Machine Buying & Placement (Step 8):**
    *   Added "Buy Mixer" button to `UIManager`.
    *   Added placement state logic (`isPlacingMachine`, `placementMachineType`) to `GameManager`.
    *   Implemented `handleBuyMixer` in `GameManager` to check cost and enter placement mode.
    *   Added stage click (`pointerdown`) listener in `GameManager`'s `initApp`.
    *   Implemented `handleStageClick` to call `placeMachine` when `isPlacingMachine` is true.
    *   Implemented `placeMachine` method to deduct cost, create `MachineInstance`, add to list, and add sprite to stage.
    *   Added placement cancellation via Right-click (`rightclick`), Escape key (`keydown`), or clicking the buy button again.
    *   Added visual placement preview (`PIXI.Graphics`) that follows mouse (`pointermove`).
    *   Added placement feedback text via `UIManager.updatePlacementText`.
    *   **Fixed:** Used `event.stopPropagation()` on button clicks in `UIManager` to prevent events bubbling to the stage and causing immediate placement.

### Refactoring

*   **Clarity Rename (Step 7):** Renamed `src/Machine.ts` and class `Machine` to `src/MachineInstance.ts` and `MachineInstance` respectively to avoid confusion with `src/data/Machines.ts`. Updated all relevant imports and references.

---