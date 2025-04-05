// src/GameManager.ts

import * as PIXI from 'pixi.js';
import { Inventory } from './Inventory';
import { UIManager } from './UIManager';
import { MachineInstance } from './MachineInstance';
import { getChemicalData } from './data/Chemicals';
import { getMachineTypeData } from './data/Machines'; // Need this!

/**
 * Manages the overall game state, Pixi.js application, and game loop.
 */
export class GameManager {
    private app: PIXI.Application;
    private inventory: Inventory;
    private currency: number;
    private uiManager: UIManager;
    private machines: MachineInstance[];
    private machineIdCounter: number;

    // --- Placement State ---
    private isPlacingMachine: boolean = false;
    private placementMachineType: string | null = null;
    // Simple placement preview (optional enhancement)
    private placementPreviewSprite: PIXI.Graphics | null = null;

    constructor() {
        console.log("GameManager initializing...");
        // ... (other initializations as before) ...
        const startingCapacity = 50;
        this.inventory = new Inventory(startingCapacity);
        this.currency = 500;
        this.machines = [];
        this.machineIdCounter = 0;
        this.app = new PIXI.Application();
        this.initApp();
        console.log("GameManager initialization almost complete (waiting for Pixi App init).");
    }

    private async initApp() {
        await this.app.init({ /* ... as before ... */
             width: window.innerWidth, height: window.innerHeight, backgroundColor: 0x808080,
             autoDensity: true, resolution: window.devicePixelRatio || 1,
        });
        console.log("Pixi Application initialized.");

        const appContainer = document.getElementById('app');
        if (appContainer) { appContainer.appendChild(this.app.canvas); }
        else { console.error("Could not find #app element!"); return; }

        // --- UIManager Setup ---
        // Pass the new handler for the Buy Mixer button
        this.uiManager = new UIManager(
            this.app.stage,
            this.handleBuyChemicalA.bind(this),
            this.handleSellProductB.bind(this),
            this.handleBuyMixer.bind(this) // Added callback
        );
        this.updateUIDisplays(); // Initial UI update

        // --- Global Event Listeners ---
        window.addEventListener('resize', this.handleResize.bind(this));
        // Add listener for Escape key to cancel placement
        window.addEventListener('keydown', this.handleKeyDown.bind(this));

        // --- Stage Interaction Setup (for placement) ---
        // Stage interaction is enabled/disabled dynamically
        this.app.stage.eventMode = 'static'; // Enable basic events on the stage
        this.app.stage.hitArea = this.app.screen; // Make the whole stage clickable
        // Listener for placing machine
        this.app.stage.on('pointerdown', this.handleStageClick.bind(this));
        // Listener for canceling placement with right-click
        this.app.stage.on('rightclick', this.handleCancelPlacement.bind(this));
        // Listener for updating placement preview position
        this.app.stage.on('pointermove', this.handlePointerMove.bind(this));


        // --- Start Game Loop ---
        // Remove the temporary createTestMachine() call from here
        this.app.ticker.add(this.update.bind(this));
        console.log("Pixi ticker started. GameManager fully initialized.");
    }

    private handleResize() { /* ... as before ... */
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.app.stage.hitArea = this.app.screen; // Update hit area on resize
        console.log(`Resized canvas to ${window.innerWidth}x${window.innerHeight}`);
    }

    /** Main game loop */
    private update(ticker: PIXI.Ticker): void {
        const deltaMS = ticker.deltaMS;
        // Update machines
        this.machines.forEach(machine => machine.update(deltaMS));
        // Update UI
        this.updateUIDisplays();
    }

    /** Updates UI Texts */
    private updateUIDisplays(): void {
        if (this.uiManager) {
            this.uiManager.updateCurrency(this.currency);
            this.uiManager.updateInventory(this.inventory);
            // Update placement text based on state
            if (this.isPlacingMachine && this.placementMachineType) {
                this.uiManager.updatePlacementText(`Placing ${this.placementMachineType}. Click to confirm, Right-click/ESC to cancel.`);
            } else {
                this.uiManager.updatePlacementText(''); // Clear text if not placing
            }
        }
    }

    // --- Action Handlers ---
    private handleBuyChemicalA(): void { /* ... as before ... */
        const chemicalId = 'Raw Chemical A'; const amount = 1;
        try {
            const data = getChemicalData(chemicalId);
            if (this.currency < data.buyCost * amount) { console.warn(`Need $${data.buyCost * amount}, have $${this.currency}`); return; }
            if (this.inventory.addChemical(chemicalId, amount)) {
                this.currency -= data.buyCost * amount; console.log(`Bought ${amount} ${chemicalId}. Currency: $${this.currency}`);
            }
        } catch (e) { console.error(`Error buying ${chemicalId}:`, e); }
    }
    private handleSellProductB(): void { /* ... as before ... */
        const chemicalId = 'Product B'; const amount = 1;
        try {
            const data = getChemicalData(chemicalId);
            if (!this.inventory.hasEnough(chemicalId, amount)) { console.warn(`Not enough ${chemicalId} to sell.`); return; }
            if (this.inventory.removeChemical(chemicalId, amount)) {
                this.currency += data.sellPrice * amount; console.log(`Sold ${amount} ${chemicalId}. Currency: $${this.currency}`);
            }
        } catch (e) { console.error(`Error selling ${chemicalId}:`, e); }
    }

    /** Initiates placement mode for a Mixer. */
    private handleBuyMixer(): void {
        const machineType = 'Mixer';
        if (this.isPlacingMachine) {
             // If already placing, treat clicking the button again as cancel
            this.handleCancelPlacement();
            return;
        }

        try {
            const machineData = getMachineTypeData(machineType);
            if (this.currency >= machineData.cost) {
                this.isPlacingMachine = true;
                this.placementMachineType = machineType;
                console.log(`Started placement mode for ${machineType}. Cost: $${machineData.cost}`);
                // Create and show placement preview
                this.createPlacementPreview(machineType);
                // Update UI text via the main loop's updateUIDisplays()
            } else {
                console.warn(`Cannot buy ${machineType}. Need $${machineData.cost}, have $${this.currency}`);
                // Optionally show feedback message via UIManager
                if(this.uiManager) this.uiManager.updatePlacementText(`Not enough money for ${machineType}! ($${machineData.cost})`);
                // Clear message after a delay?
                setTimeout(() => { if(this.uiManager) this.uiManager.updatePlacementText(''); }, 2000);
            }
        } catch (error) {
            console.error(`Error initiating buy for ${machineType}:`, error);
        }
    }

    /** Handles clicks on the main stage (used for placing machines). */
    private handleStageClick(event: PIXI.FederatedPointerEvent): void {
        // Only act if we are in placement mode
        if (this.isPlacingMachine && this.placementMachineType) {
            const position = event.global.clone(); // Get click position in global coords
            console.log(`Attempting to place ${this.placementMachineType} at (${position.x.toFixed(0)}, ${position.y.toFixed(0)})`);
            this.placeMachine(this.placementMachineType, position);

            // Exit placement mode regardless of success (placeMachine handles cost/failure)
            this.isPlacingMachine = false;
            this.placementMachineType = null;
            this.destroyPlacementPreview(); // Remove preview
            // UI text update happens in the next frame via updateUIDisplays()
        }
        // Otherwise, ignore stage clicks
    }

     /** Handles right-click or Escape key press to cancel placement mode. */
     private handleCancelPlacement(): void {
        if (this.isPlacingMachine) {
            console.log("Placement cancelled.");
            this.isPlacingMachine = false;
            this.placementMachineType = null;
            this.destroyPlacementPreview(); // Remove preview
            // UI text update happens in the next frame
        }
    }

     /** Handles Escape key presses */
     private handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.handleCancelPlacement();
        }
    }

    /** Updates the position of the placement preview sprite */
    private handlePointerMove(event: PIXI.FederatedPointerEvent): void {
        if (this.isPlacingMachine && this.placementPreviewSprite) {
             // Convert global mouse coords to stage local coords if needed,
             // but for simple top-level stage, global might be fine.
             // Let's assume global is okay for now.
             const position = event.global;
             this.placementPreviewSprite.position.copyFrom(position);
             // Adjust position slightly so cursor isn't directly over the center? (optional)
             // this.placementPreviewSprite.position.set(position.x - 32, position.y - 32); // Offset example
        }
    }


    // --- Machine Management ---

    /** Creates the visual preview for machine placement */
    private createPlacementPreview(machineType: string): void {
        this.destroyPlacementPreview(); // Remove any existing preview

        // Simple rectangle placeholder for preview
        this.placementPreviewSprite = new PIXI.Graphics()
            .rect(0, 0, 64, 64) // Use same size as MachineInstance graphic for now
            .fill({ color: 0x00FF00, alpha: 0.5 }); // Green, semi-transparent

         // Set initial position (will be updated by pointermove)
         if (this.app.renderer.events.rootPointerEvent) {
             this.placementPreviewSprite.position.copyFrom(this.app.renderer.events.rootPointerEvent.global);
         } else {
             // Fallback position if no initial pointer data available
             this.placementPreviewSprite.position.set(this.app.screen.width/2, this.app.screen.height/2);
         }

        this.app.stage.addChild(this.placementPreviewSprite);
    }

     /** Removes the placement preview sprite from the stage */
    private destroyPlacementPreview(): void {
        if (this.placementPreviewSprite) {
            this.app.stage.removeChild(this.placementPreviewSprite);
            this.placementPreviewSprite.destroy(); // Free up memory
            this.placementPreviewSprite = null;
        }
    }


    /** Creates a MachineInstance, deducts cost, adds it to the list and stage. */
    private placeMachine(machineType: string, position: { x: number, y: number }): void {
        try {
            const machineData = getMachineTypeData(machineType);

            // Double-check cost before placing
            if (this.currency < machineData.cost) {
                console.warn(`Placement failed: Not enough currency for ${machineType}. Need $${machineData.cost}, have $${this.currency}`);
                // Show feedback via UI manager?
                return;
            }

            // Deduct cost *before* creating, standard practice
            this.currency -= machineData.cost;
            console.log(`Spent $${machineData.cost} on ${machineType}. Current currency: $${this.currency}`);

            // Create the actual machine instance
            const newMachineId = `machine_${this.machineIdCounter++}`;
            // Adjust position slightly? Maybe place based on top-left corner, matching preview?
            // For now, place center where clicked.
            const adjustedPosition = { x: position.x - 32, y: position.y - 32 }; // Center the 64x64 graphic on cursor

            const newMachine = new MachineInstance(newMachineId, machineType, this.inventory, adjustedPosition);

            this.machines.push(newMachine); // Add to managed list
            this.app.stage.addChild(newMachine.getSprite()); // Add visuals to stage

            console.log(`Successfully placed ${newMachineId} (${machineType}) at (${adjustedPosition.x.toFixed(0)}, ${adjustedPosition.y.toFixed(0)}).`);

            // Explicitly update UI here for immediate cost feedback if desired
            // this.updateUIDisplays();

        } catch (error) {
            console.error(`Failed to place machine of type ${machineType}:`, error);
            // CRITICAL: Consider refunding currency if creation fails AFTER cost deduction?
            // For MVP, maybe just log the error.
        }
    }
}