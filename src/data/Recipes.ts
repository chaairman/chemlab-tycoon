// src/data/Recipes.ts

/** Defines the input requirements (Chemical ID -> Amount). */
export type RecipeInput = Record<string, number>;

/** Defines the output generated (Chemical ID -> Amount). */
export type RecipeOutput = Record<string, number>;

/** Defines the structure for a single processing recipe. */
export interface RecipeData {
    /** Unique identifier for the recipe. */
    id: string;
    /** Type of machine required. */
    machineType: string;
    /** Input chemicals and amounts required. */
    inputs: RecipeInput;
    /** Output chemicals and amounts produced. */
    outputs: RecipeOutput;
    /** Time required (in seconds). */
    processingTimeSeconds: number;
}

/** A list containing all available recipes in the game. */
export const RECIPE_DATA: RecipeData[] = [
    // --- Mixer Recipe ---
    {
        id: 'Mix A to B',
        machineType: 'Mixer',
        inputs: { 'Raw Chemical A': 1 },
        outputs: { 'Product B': 1 },
        processingTimeSeconds: 5,
    },

    // --- NEW RECIPE (Heater) ---
    {
        id: 'Heat B to C',                // Unique recipe name
        machineType: 'Heater',           // Requires a Heater machine
        inputs: { 'Product B': 1 },      // Needs 1 unit of Product B (output from Mixer)
        outputs: { 'Product C': 1 },     // Produces 1 unit of Product C
        processingTimeSeconds: 8,        // Takes 8 seconds (longer than Mixer)
    },
];

/**
 * Helper function to find recipes compatible with a specific machine type.
 * @param machineType The type of machine (e.g., 'Mixer', 'Heater').
 * @returns An array of RecipeData objects that can be performed by that machine type.
 */
export function getRecipesForMachine(machineType: string): RecipeData[] {
    return RECIPE_DATA.filter(recipe => recipe.machineType === machineType);
}