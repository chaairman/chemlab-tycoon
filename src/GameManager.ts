// src/GameManager.ts

import * as PIXI from 'pixi.js';
import { Inventory } from './Inventory';
import { UIManager } from './UIManager'; // Check spelling here
// Import data access functions and types
import { getChemicalData, ChemicalData } from './data/Chemicals'; // Added import

/**
 * Manages the overall game state, Pixi.js application, and game loop.
 */
export class GameManager {
    private app: PIXI.Application;
    private inventory: Inventory;
    private currency: number;
    private uiManager: UIManager; // Keep reference

    constructor() {
        console.log("GameManager initializing...");
        const startingCapacity = 50;
        this.inventory = new Inventory(startingCapacity);
        this.currency = 500;
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

        // --- Initialize UI Manager ---
        // Pass the bound methods as callbacks
        this.uiManager = new UIManager(
            this.app.stage,
            this.handleBuyChemicalA.bind(this), // Pass reference to buy handler
            this.handleSellProductB.bind(this)  // Pass reference to sell handler
        );
        this.updateUIDisplays();

        window.addEventListener('resize', this.handleResize.bind(this));
        this.app.ticker.add(this.update.bind(this));
        console.log("Pixi ticker started. GameManager fully initialized.");
    }

    private handleResize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        console.log(`Resized canvas to ${window.innerWidth}x${window.innerHeight}`);
    }

    private update(ticker: PIXI.Ticker): void {
        const deltaMS = ticker.deltaMS;
        // Game logic updates will go here later

        // UI Updates - can be optimized later to only update on change
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

    /**
     * Handles the logic when the "Buy Raw Chemical A" button is clicked.
     */
    private handleBuyChemicalA(): void {
        const chemicalId = 'Raw Chemical A';
        const amountToBuy = 1; // Buying one unit at a time for now

        try {
            const chemicalData = getChemicalData(chemicalId);

            // 1. Check cost
            if (this.currency < chemicalData.buyCost * amountToBuy) {
                console.warn(`Cannot buy ${amountToBuy} ${chemicalId}. Need $${chemicalData.buyCost * amountToBuy}, have $${this.currency}`);
                // TODO: Add visual feedback to the player later
                return; // Stop processing
            }

            // 2. Attempt to add to inventory (checks capacity internally)
            if (this.inventory.addChemical(chemicalId, amountToBuy)) {
                // 3. If successful, deduct cost
                this.currency -= chemicalData.buyCost * amountToBuy;
                console.log(`Bought ${amountToBuy} ${chemicalId} for $${chemicalData.buyCost * amountToBuy}. Current currency: $${this.currency}`);
                // 4. Update UI (handled by the main loop or called explicitly)
                // this.updateUIDisplays(); // Might call here for immediate feedback if loop updates aren't sufficient
            } else {
                // addChemical handles its own console warning about capacity
                 // TODO: Add visual feedback to the player later
            }

        } catch (error) {
            // Catch errors from getChemicalData if ID is invalid
            console.error(`Error buying chemical ${chemicalId}:`, error);
        }
    }

     /**
     * Handles the logic when the "Sell Product B" button is clicked.
     */
    private handleSellProductB(): void {
        const chemicalId = 'Product B';
        const amountToSell = 1; // Selling one unit at a time

        try {
            const chemicalData = getChemicalData(chemicalId);

            // 1. Check if we have enough to sell
            if (!this.inventory.hasEnough(chemicalId, amountToSell)) {
                console.warn(`Cannot sell ${amountToSell} ${chemicalId}. Only have ${this.inventory.getAmount(chemicalId)}.`);
                 // TODO: Add visual feedback to the player later
                return; // Stop processing
            }

            // 2. Attempt to remove from inventory
            if (this.inventory.removeChemical(chemicalId, amountToSell)) {
                 // 3. If successful, add currency
                 this.currency += chemicalData.sellPrice * amountToSell;
                 console.log(`Sold ${amountToSell} ${chemicalId} for $${chemicalData.sellPrice * amountToSell}. Current currency: $${this.currency}`);
                 // 4. Update UI (handled by the main loop or called explicitly)
                 // this.updateUIDisplays();
            } else {
                // removeChemical handles its own console warning (shouldn't happen if hasEnough passed, but belt-and-suspenders)
                 // TODO: Add visual feedback to the player later
            }

        } catch (error) {
            // Catch errors from getChemicalData if ID is invalid
            console.error(`Error selling chemical ${chemicalId}:`, error);
        }
    }

    // --- Placeholder methods for machine actions ---
    // public buyMachine(type: string): void { /* ... */ }
    // public placeMachine(): void { /* ... */ }
}