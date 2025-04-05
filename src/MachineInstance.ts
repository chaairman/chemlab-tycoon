// src/MachineInstance.ts

import * as PIXI from 'pixi.js';
import { Inventory } from './Inventory';
import { RecipeData, getRecipesForMachine } from './data/Recipes';
import { MachineTypeData, getMachineTypeData } from './data/Machines';

// Define possible states for the machine instance
type MachineStatus = 'Idle' | 'Processing' | 'Blocked_Output' | 'Blocked_Input' | 'No_Recipe';

/**
 * Represents a single instance of a processing machine in the factory.
 * Handles its own state, recipe execution, timer, and visualization.
 */
export class MachineInstance { // Renamed class
    // --- Properties ---
    public readonly id: string; // Unique identifier for this machine instance
    public readonly machineType: string; // Type of machine ('Mixer', 'Heater', etc.)
    private machineTypeData: MachineTypeData; // Data associated with the type
    private inventory: Inventory; // Reference to the shared game inventory
    private status: MachineStatus; // Current operational status
    private currentRecipe: RecipeData | null; // The recipe this machine is configured to run
    private processingTimerSeconds: number; // Countdown timer for recipe completion

    // Visual representation
    private spriteContainer: PIXI.Container; // Holds all visual elements
    private bodyGfx: PIXI.Graphics; // The main graphic for the machine
    private statusText: PIXI.Text; // Displays current status

    // --- Constants for Visuals ---
    private readonly GFX_WIDTH = 64;
    private readonly GFX_HEIGHT = 64;
    private readonly COLOR_IDLE = 0x0088FF; // Blue
    private readonly COLOR_PROCESSING = 0xFFDD00; // Yellow
    private readonly COLOR_BLOCKED = 0xFF0000; // Red
    private readonly COLOR_NO_RECIPE = 0x888888; // Grey

    /**
     * Creates a new MachineInstance.
     * @param id Unique ID for this machine instance.
     * @param machineType The type identifier (e.g., 'Mixer').
     * @param inventory A reference to the game's main inventory system.
     * @param position The initial x, y coordinates for the machine instance's visual sprite.
     */
    constructor(id: string, machineType: string, inventory: Inventory, position: { x: number, y: number }) {
        this.id = id;
        this.machineType = machineType;
        this.inventory = inventory;
        this.processingTimerSeconds = 0;

        // --- Data Loading ---
        try {
            this.machineTypeData = getMachineTypeData(machineType);
        } catch (error) {
            console.error(`Failed to create machine instance ${id}:`, error);
            throw new Error(`Invalid machine type "${machineType}" for machine instance ${id}.`);
        }

        // --- Recipe Setup ---
        const availableRecipes = getRecipesForMachine(this.machineType);
        if (availableRecipes.length > 0) {
            this.currentRecipe = availableRecipes[0];
            this.status = 'Idle';
            console.log(`MachineInstance ${this.id} (${this.machineType}) assigned recipe: ${this.currentRecipe.id}`);
        } else {
            this.currentRecipe = null;
            this.status = 'No_Recipe';
            console.warn(`MachineInstance ${this.id} (${this.machineType}) created, but no recipes found for this type.`);
        }

        // --- Visual Setup ---
        this.spriteContainer = new PIXI.Container();
        this.spriteContainer.position.set(position.x, position.y);

        this.bodyGfx = new PIXI.Graphics();
        this.spriteContainer.addChild(this.bodyGfx);

        this.statusText = new PIXI.Text({
            text: this.status,
            style: new PIXI.TextStyle({
                fontFamily: 'Arial', fontSize: 12, fill: 0xFFFFFF,
                stroke: { color: 0x000000, width: 2 }, align: 'center',
            })
        });
        this.statusText.anchor.set(0.5);
        this.statusText.position.set(this.GFX_WIDTH / 2, this.GFX_HEIGHT + 10);
        this.spriteContainer.addChild(this.statusText);

        this.updateVisualState(); // Draw initial state

        console.log(`MachineInstance ${id} (${machineType}) created at (${position.x}, ${position.y}). Status: ${this.status}`);
    }

    /** Updates the visual appearance based on the current status. */
    private updateVisualState(): void {
        this.bodyGfx.clear();
        let color = this.COLOR_NO_RECIPE;
        switch (this.status) {
            case 'Idle': color = this.COLOR_IDLE; break;
            case 'Processing': color = this.COLOR_PROCESSING; break;
            case 'Blocked_Input': case 'Blocked_Output': color = this.COLOR_BLOCKED; break;
        }
        this.bodyGfx.rect(0, 0, this.GFX_WIDTH, this.GFX_HEIGHT);
        this.bodyGfx.fill(color);
        this.bodyGfx.stroke({ width: 2, color: 0x000000 });
        this.statusText.text = this.status;
        if (this.status === 'Processing') {
            this.statusText.text = `Proc: ${this.processingTimerSeconds.toFixed(1)}s`;
        }
    }

    /** Main update logic for the machine instance, called every frame by GameManager. */
    public update(deltaMS: number): void {
        if (this.status === 'No_Recipe') return;

        // State: Idle or Blocked_Input
        if (this.status === 'Idle' || this.status === 'Blocked_Input') {
            if (!this.currentRecipe) {
                 this.status = 'No_Recipe'; this.updateVisualState(); return;
            }
            let canConsume = true;
            for (const chemId in this.currentRecipe.inputs) {
                if (!this.inventory.hasEnough(chemId, this.currentRecipe.inputs[chemId])) {
                    canConsume = false; break;
                }
            }
            if (canConsume) {
                let consumedSuccessfully = true;
                for (const chemId in this.currentRecipe.inputs) {
                     if (!this.inventory.removeChemical(chemId, this.currentRecipe.inputs[chemId])) {
                         consumedSuccessfully = false;
                         console.error(`MachineInstance ${this.id}: Failed to remove ${chemId}! Inventory inconsistent?`);
                         break;
                     }
                }
                if (consumedSuccessfully) {
                    this.status = 'Processing';
                    this.processingTimerSeconds = this.currentRecipe.processingTimeSeconds;
                    console.log(`MachineInstance ${this.id}: Started processing recipe ${this.currentRecipe.id}. Duration: ${this.processingTimerSeconds}s`);
                    this.updateVisualState();
                } else {
                    this.status = 'Blocked_Input'; // Or Idle? Let's stick to Blocked for errors.
                    console.warn(`MachineInstance ${this.id}: Failed to consume inputs for recipe ${this.currentRecipe.id}. Check logs.`);
                    this.updateVisualState();
                }
            } else {
                 this.status = 'Idle'; // Waiting for input
                 this.updateVisualState();
            }
        }
        // State: Processing
        else if (this.status === 'Processing') {
            this.processingTimerSeconds -= deltaMS / 1000;
            this.updateVisualState(); // Update timer display
            if (this.processingTimerSeconds <= 0) {
                this.finishProcessing();
            }
        }
        // State: Blocked_Output
        else if (this.status === 'Blocked_Output') {
            // Re-attempt adding output only when finishProcessing is called again (e.g., potentially by external logic later)
            // For now, it just sits blocked. Let's re-attempt processing logic which implicitly re-calls finishProcessing if timer is <= 0
             if (this.processingTimerSeconds <= 0) { // Ensure timer ran out before re-attempting
                 this.finishProcessing(); // Re-attempt to add outputs
             }
        }
    }

    /** Called when the processing timer reaches zero. Attempts to add output to inventory. */
    private finishProcessing(): void {
        if (!this.currentRecipe) {
            console.error(`MachineInstance ${this.id}: finishProcessing called with no recipe!`);
            this.status = 'Idle'; this.updateVisualState(); return;
        }
        console.log(`MachineInstance ${this.id}: Finished processing recipe ${this.currentRecipe.id}. Attempting output.`);
        let addedSuccessfully = true;
        for (const chemId in this.currentRecipe.outputs) {
            if (!this.inventory.addChemical(chemId, this.currentRecipe.outputs[chemId])) {
                addedSuccessfully = false; break;
            }
        }
        if (addedSuccessfully) {
            console.log(`MachineInstance ${this.id}: Output successfully added.`);
            this.status = 'Idle'; this.processingTimerSeconds = 0;
        } else {
            console.warn(`MachineInstance ${this.id}: Output blocked! Inventory likely full.`);
            this.status = 'Blocked_Output'; this.processingTimerSeconds = 0; // Reset timer even if blocked
        }
        this.updateVisualState();
    }

    /** Returns the PIXI Container for this machine instance's visuals. */
    public getSprite(): PIXI.Container {
        return this.spriteContainer;
    }
}