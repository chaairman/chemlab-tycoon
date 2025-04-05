// src/main.ts

// Import the main stylesheet (Vite handles the CSS injection)
import './style.css';

// Import our GameManager class
import { GameManager } from './GameManager';

// --- Application Entry Point ---

// Create an instance of the GameManager
// The GameManager's constructor will initialize Pixi.js and set up the game.
const gameManager = new GameManager();

// You could potentially expose the gameManager globally for debugging,
// but it's generally better practice to avoid global variables.
// (window as any).gameManager = gameManager; // Uncomment for debugging if needed

console.log("main.ts execution finished. GameManager is now running.");