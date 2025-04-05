// src/GameManager.ts

import * as PIXI from 'pixi.js';
import { Inventory } from './Inventory';
import { UIManager } from './UIManager';
import { MachineInstance } from './MachineInstance';
import { getChemicalData } from './data/Chemicals';
import { getMachineTypeData } from './data/Machines'; // Keep this import

/**
 * Manages the overall game state, Pixi.js application, and game loop.
 */
export class GameManager {
    // --- Properties (remain the same) ---
    private app: PIXI.Application;
    private inventory: Inventory;
    private currency: number;
    private uiManager: UIManager;
    private machines: MachineInstance[];
    private machineIdCounter: number;
    private isPlacingMachine: boolean = false;
    private placementMachineType: string | null = null;
    private placementPreviewSprite: PIXI.Graphics | null = null;

    constructor() {
        // --- Constructor initializations (remain the same) ---
        console.log("GameManager initializing...");
        const startingCapacity = 50; this.inventory = new Inventory(startingCapacity); this.currency = 500;
        this.machines = []; this.machineIdCounter = 0; this.app = new PIXI.Application();
        this.initApp();
        console.log("GameManager initialization almost complete (waiting for Pixi App init).");
    }

    private async initApp() {
        // --- Pixi App Init (remains the same) ---
        await this.app.init({ width: window.innerWidth, height: window.innerHeight, backgroundColor: 0x808080, autoDensity: true, resolution: window.devicePixelRatio || 1, });
        console.log("Pixi Application initialized.");
        const appContainer = document.getElementById('app');
        if (appContainer) { appContainer.appendChild(this.app.canvas); } else { console.error("Could not find #app element!"); return; }

        // --- UIManager Setup ---
        // Pass the NEW handler for the Buy Heater button
        this.uiManager = new UIManager(
            this.app.stage,
            this.handleBuyChemicalA.bind(this),
            this.handleSellProductB.bind(this),
            this.handleBuyMixer.bind(this),
            this.handleBuyHeater.bind(this) // Added the new handler here
        );
        this.updateUIDisplays();

        // --- Event Listeners (remain the same) ---
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.app.stage.eventMode = 'static'; this.app.stage.hitArea = this.app.screen;
        this.app.stage.on('pointerdown', this.handleStageClick.bind(this));
        this.app.stage.on('rightclick', this.handleCancelPlacement.bind(this));
        this.app.stage.on('pointermove', this.handlePointerMove.bind(this));

        // --- Start Game Loop (remains the same) ---
        this.app.ticker.add(this.update.bind(this));
        console.log("Pixi ticker started. GameManager fully initialized.");
    }

    // --- handleResize, update, updateUIDisplays (remain the same) ---
    private handleResize() { this.app.renderer.resize(window.innerWidth, window.innerHeight); this.app.stage.hitArea = this.app.screen; console.log(`Resized canvas to ${window.innerWidth}x${window.innerHeight}`); }
    private update(ticker: PIXI.Ticker): void { const deltaMS = ticker.deltaMS; this.machines.forEach(machine => machine.update(deltaMS)); this.updateUIDisplays(); }
    private updateUIDisplays(): void { if (this.uiManager) { this.uiManager.updateCurrency(this.currency); this.uiManager.updateInventory(this.inventory); if (this.isPlacingMachine && this.placementMachineType) { this.uiManager.updatePlacementText(`Placing ${this.placementMachineType}. Click to confirm, Right-click/ESC to cancel.`); } else { this.uiManager.updatePlacementText(''); } } }

    // --- Chemical Buy/Sell Handlers (remain the same) ---
    private handleBuyChemicalA(): void { const id = 'Raw Chemical A'; const amt = 1; try { const d = getChemicalData(id); if (this.currency < d.buyCost * amt) { console.warn(`Need $${d.buyCost * amt}, have $${this.currency}`); return; } if (this.inventory.addChemical(id, amt)) { this.currency -= d.buyCost * amt; console.log(`Bought ${amt} ${id}. Currency: $${this.currency}`); } } catch (e) { console.error(`Error buying ${id}:`, e); } }
    private handleSellProductB(): void { const id = 'Product B'; const amt = 1; try { const d = getChemicalData(id); if (!this.inventory.hasEnough(id, amt)) { console.warn(`Not enough ${id} to sell.`); return; } if (this.inventory.removeChemical(id, amt)) { this.currency += d.sellPrice * amt; console.log(`Sold ${amt} ${id}. Currency: $${this.currency}`); } } catch (e) { console.error(`Error selling ${id}:`, e); } }
    // TODO: Add handleSellProductC later if needed

    // --- Machine Buy Handlers ---
    /** Initiates placement mode for a Mixer. */
    private handleBuyMixer(): void {
        this.initiatePlacement('Mixer');
    }

    /** NEW: Initiates placement mode for a Heater. */
    private handleBuyHeater(): void {
        this.initiatePlacement('Heater');
    }

    /** Generic function to initiate placement mode for any machine type. */
    private initiatePlacement(machineType: string): void {
        if (this.isPlacingMachine) {
            // If clicking the same button again, cancel. If different, switch? For now, just cancel.
            this.handleCancelPlacement();
            // Optionally, could immediately enter placement for the new type:
            // if (this.placementMachineType !== machineType) { /* logic to switch type */ }
            return;
        }

        try {
            const machineData = getMachineTypeData(machineType);
            if (this.currency >= machineData.cost) {
                this.isPlacingMachine = true;
                this.placementMachineType = machineType;
                console.log(`Started placement mode for ${machineType}. Cost: $${machineData.cost}`);
                this.createPlacementPreview(machineType); // Create preview based on type
            } else {
                console.warn(`Cannot buy ${machineType}. Need $${machineData.cost}, have $${this.currency}`);
                if (this.uiManager) this.uiManager.updatePlacementText(`Not enough money for ${machineType}! ($${machineData.cost})`);
                setTimeout(() => { if (this.uiManager && !this.isPlacingMachine) this.uiManager.updatePlacementText(''); }, 2000);
            }
        } catch (error) {
            console.error(`Error initiating buy for ${machineType}:`, error);
        }
    }

    // --- Placement Logic (handleStageClick, handleCancelPlacement, handleKeyDown, handlePointerMove, createPlacementPreview, destroyPlacementPreview, placeMachine) ---
    // These methods generally remain the same as they were designed to handle 'placementMachineType' generically.
    // We just need to ensure createPlacementPreview potentially handles different types later (Step 10).
    private handleStageClick(event: PIXI.FederatedPointerEvent): void { if (this.isPlacingMachine && this.placementMachineType) { const pos = event.global.clone(); console.log(`Attempting place ${this.placementMachineType} at (${pos.x.toFixed(0)}, ${pos.y.toFixed(0)})`); this.placeMachine(this.placementMachineType, pos); this.isPlacingMachine = false; this.placementMachineType = null; this.destroyPlacementPreview(); } }
    private handleCancelPlacement(): void { if (this.isPlacingMachine) { console.log("Placement cancelled."); this.isPlacingMachine = false; this.placementMachineType = null; this.destroyPlacementPreview(); } }
    private handleKeyDown(event: KeyboardEvent): void { if (event.key === 'Escape') { this.handleCancelPlacement(); } }
    private handlePointerMove(event: PIXI.FederatedPointerEvent): void { if (this.isPlacingMachine && this.placementPreviewSprite) { this.placementPreviewSprite.position.copyFrom(event.global); } }

    // createPlacementPreview might need adjustment in Step 10 for different sprites, but keep simple graphic for now
    private createPlacementPreview(machineType: string): void { this.destroyPlacementPreview(); this.placementPreviewSprite = new PIXI.Graphics() .rect(0, 0, 64, 64) .fill({ color: 0x00FF00, alpha: 0.5 }); if (this.app.renderer.events.rootPointerEvent) { this.placementPreviewSprite.position.copyFrom(this.app.renderer.events.rootPointerEvent.global); } else { this.placementPreviewSprite.position.set(this.app.screen.width/2, this.app.screen.height/2); } this.app.stage.addChild(this.placementPreviewSprite); }
    private destroyPlacementPreview(): void { if (this.placementPreviewSprite) { this.app.stage.removeChild(this.placementPreviewSprite); this.placementPreviewSprite.destroy(); this.placementPreviewSprite = null; } }

    // placeMachine remains generic and should work for Heaters too
    private placeMachine(machineType: string, position: { x: number, y: number }): void {
        try {
            const machineData = getMachineTypeData(machineType);
            if (this.currency < machineData.cost) { console.warn(`Place failed: Not enough currency for ${machineType}. Need $${machineData.cost}, have $${this.currency}`); return; }
            this.currency -= machineData.cost; console.log(`Spent $${machineData.cost} on ${machineType}. Currency: $${this.currency}`);
            const newMachineId = `machine_${this.machineIdCounter++}`;
            const adjustedPosition = { x: position.x - 32, y: position.y - 32 }; // Center graphic
            // This line works because MachineInstance constructor takes machineType and finds recipes
            const newMachine = new MachineInstance(newMachineId, machineType, this.inventory, adjustedPosition);
            this.machines.push(newMachine); this.app.stage.addChild(newMachine.getSprite());
            console.log(`Successfully placed ${newMachineId} (${machineType}) at (${adjustedPosition.x.toFixed(0)}, ${adjustedPosition.y.toFixed(0)}).`);
        } catch (error) { console.error(`Failed to place machine of type ${machineType}:`, error); }
    }
}