// src/GameManager.ts

import * as PIXI from 'pixi.js';
import { Inventory } from './Inventory';
import { UIManager } from './UIManager';
// Updated import for the renamed machine class
import { MachineInstance } from './MachineInstance'; // <-- RENAMED HERE
import { getChemicalData, ChemicalData } from './data/Chemicals';
import { getMachineTypeData } from './data/Machines';

/**
 * Manages the overall game state, Pixi.js application, and game loop.
 */
export class GameManager {
    private app: PIXI.Application;
    private inventory: Inventory;
    private currency: number;
    private uiManager: UIManager;
    // Updated type annotation for the array
    private machines: MachineInstance[]; // <-- RENAMED HERE
    private machineIdCounter: number;

    constructor() {
        console.log("GameManager initializing...");
        const startingCapacity = 50;
        this.inventory = new Inventory(startingCapacity);
        this.currency = 500;
        this.machines = []; // Initialize empty list
        this.machineIdCounter = 0;
        this.app = new PIXI.Application();
        this.initApp();
        console.log("GameManager initialization almost complete (waiting for Pixi App init).");
    }

    private async initApp() {
        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x808080,
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
        });
        console.log("Pixi Application initialized.");

        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.appendChild(this.app.canvas);
            console.log("Pixi canvas appended to DOM.");
        } else {
            console.error("Could not find #app element in the DOM!");
            return;
        }

        this.uiManager = new UIManager(
            this.app.stage,
            this.handleBuyChemicalA.bind(this),
            this.handleSellProductB.bind(this)
        );
        this.updateUIDisplays();

        // --- [TEMP] Create one machine instance for testing ---
        this.createTestMachine();
        // --- End Temp ---

        window.addEventListener('resize', this.handleResize.bind(this));
        this.app.ticker.add(this.update.bind(this));
        console.log("Pixi ticker started. GameManager fully initialized.");
    }

    private handleResize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        console.log(`Resized canvas to ${window.innerWidth}x${window.innerHeight}`);
    }

    /** The main game loop, called by the Pixi ticker every frame. */
    private update(ticker: PIXI.Ticker): void {
        const deltaMS = ticker.deltaMS;

        // Update All Machine Instances
        this.machines.forEach(machine => { // Iterate over MachineInstance array
            machine.update(deltaMS);
        });

        // UI Updates
        this.updateUIDisplays();
    }

    /** Updates all relevant UI elements via the UIManager. */
    private updateUIDisplays(): void {
        if (this.uiManager) {
            this.uiManager.updateCurrency(this.currency);
            this.uiManager.updateInventory(this.inventory);
        }
    }

    // --- Action Handlers for Buttons ---
    private handleBuyChemicalA(): void {
        const chemicalId = 'Raw Chemical A'; const amount = 1;
        try {
            const data = getChemicalData(chemicalId);
            if (this.currency < data.buyCost * amount) { console.warn(`Need $${data.buyCost * amount}, have $${this.currency}`); return; }
            if (this.inventory.addChemical(chemicalId, amount)) {
                this.currency -= data.buyCost * amount; console.log(`Bought ${amount} ${chemicalId}. Currency: $${this.currency}`);
            }
        } catch (e) { console.error(`Error buying ${chemicalId}:`, e); }
    }
    private handleSellProductB(): void {
        const chemicalId = 'Product B'; const amount = 1;
        try {
            const data = getChemicalData(chemicalId);
            if (!this.inventory.hasEnough(chemicalId, amount)) { console.warn(`Not enough ${chemicalId} to sell.`); return; }
            if (this.inventory.removeChemical(chemicalId, amount)) {
                this.currency += data.sellPrice * amount; console.log(`Sold ${amount} ${chemicalId}. Currency: $${this.currency}`);
            }
        } catch (e) { console.error(`Error selling ${chemicalId}:`, e); }
    }

    // --- Machine Management Methods ---

    /** [TEMP] Creates a single test machine instance. */
    private createTestMachine(): void {
        const machineType = 'Mixer';
        const position = { x: 100, y: 200 };
        try {
            const newMachineId = `machine_${this.machineIdCounter++}`;
            // Updated instantiation to use new class name
            const newMachine = new MachineInstance(newMachineId, machineType, this.inventory, position); // <-- RENAMED HERE

            this.machines.push(newMachine); // Add instance to the list
            this.app.stage.addChild(newMachine.getSprite()); // Add visuals to stage
            console.log(`[TEMP] Created test machine instance ${newMachineId} of type ${machineType}.`);
        } catch (error) {
            console.error("[TEMP] Failed to create test machine instance:", error);
        }
    }
    // public buyMachine(type: string): void { /* ... */ }
    // public placeMachine(type: string, position: {x: number, y: number}): void { /* ... Create MachineInstance ... */ }
}