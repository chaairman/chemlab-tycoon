// src/GameManager.ts

// Import the main Pixi.js Application class
import * as PIXI from 'pixi.js';

/**
 * Manages the overall game state, Pixi.js application, and game loop.
 */
export class GameManager {
    // Reference to the Pixi.js Application
    private app: PIXI.Application;

    /**
     * Initializes the GameManager and the Pixi Application.
     */
    constructor() {
        console.log("GameManager initializing...");

        // --- Pixi.js Application Setup ---

        // Create a Pixi Application
        this.app = new PIXI.Application();

        // Initialize the application asynchronously
        // Waits for the application to be ready before proceeding.
        this.initApp();

        console.log("GameManager initialization complete.");
    }

    /**
     * Asynchronously initializes the Pixi.js application settings
     * and appends its view to the DOM.
     */
    private async initApp() {
        await this.app.init({
            // Set the width and height to match the browser window size
            width: window.innerWidth,
            height: window.innerHeight,
            // Set the background color (e.g., a light grey)
            backgroundColor: 0x808080, // Pixi uses hexadecimal color codes
            // Auto-density helps with scaling on different resolution displays
            autoDensity: true,
            // Use device pixel ratio for sharper rendering on high-DPI screens
            resolution: window.devicePixelRatio || 1,
        });
        console.log("Pixi Application initialized.");

        // --- DOM Integration ---

        // Find the div element with the id 'app' in index.html
        const appContainer = document.getElementById('app');

        if (appContainer) {
            // Append the Pixi.js canvas (this.app.canvas) to the div
            appContainer.appendChild(this.app.canvas);
            console.log("Pixi canvas appended to DOM.");
        } else {
            console.error("Could not find #app element in the DOM!");
            // Handle the error appropriately, maybe show a message to the user
            // For now, we'll just stop execution if the container isn't found.
            return;
        }

        // --- Setup Resize Handling ---
        // Add an event listener to resize the canvas when the window size changes
        window.addEventListener('resize', this.handleResize.bind(this));

        // --- Start Game Loop (Example) ---
        // We'll add more sophisticated game loop logic later
        // For now, let's just log that the ticker is running
        this.app.ticker.add(this.update.bind(this)); // Add the update method to the ticker
        console.log("Pixi ticker started.");
    }

    /**
     * Handles window resize events to keep the canvas full screen.
     */
    private handleResize() {
        // Update the renderer size based on the new window dimensions
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        console.log(`Resized canvas to ${window.innerWidth}x${window.innerHeight}`);
        // You might need to reposition elements here later if they are
        // positioned relative to the screen edges.
    }

    /**
     * The main game loop, called by the Pixi ticker every frame.
     * @param delta - Represents the time elapsed since the last frame (in Ticker units, often related to frames).
     *                Use app.ticker.deltaMS for milliseconds.
     */
    private update(ticker: PIXI.Ticker): void {
        // Delta time in milliseconds (useful for time-based calculations)
        const deltaMS = ticker.deltaMS;

        // Game logic updates will go here in future steps
        // For example:
        // this.updateMachines(deltaMS);
        // this.updateUI();

        // console.log(`Update loop running - deltaMS: ${deltaMS.toFixed(2)}`); // Avoid logging every frame, it's noisy!
    }

    // --- Other GameManager Methods (will be added later) ---

    // public buyChemical(name: string): void { /* ... */ }
    // public sellProduct(name: string): void { /* ... */ }
    // public buyMachine(type: string): void { /* ... */ }
    // public placeMachine(): void { /* ... */ }
}