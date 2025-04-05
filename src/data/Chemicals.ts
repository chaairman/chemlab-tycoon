// src/data/Chemicals.ts

/**
 * Defines the properties for a single type of chemical.
 */
export interface ChemicalData {
    /** The unique identifier and display name for the chemical. */
    id: string;
    /** The cost to purchase one unit of this chemical (0 if not purchasable). */
    buyCost: number;
    /** The price obtained when selling one unit of this chemical (0 if not sellable). */
    sellPrice: number;
    /** Optional: Path to an icon asset for this chemical (we'll add actual paths later). */
    icon?: string; // e.g., 'assets/icons/raw_a.png'
}

/**
 * A map holding the data for all available chemicals in the game, keyed by their ID.
 * This makes it easy to look up chemical data using its name (e.g., CHEMICAL_DATA['Raw Chemical A']).
 */
export const CHEMICAL_DATA: Record<string, ChemicalData> = {
    // --- Raw Chemicals ---
    'Raw Chemical A': {
        id: 'Raw Chemical A', // Use the key as the ID for simplicity
        buyCost: 10,         // Cost $10 to buy one unit
        sellPrice: 0,          // Cannot be sold directly
        // icon: 'assets/icons/raw_a.png' // Add actual asset path later
    },

    // --- Products ---
    'Product B': {
        id: 'Product B',
        buyCost: 0,            // Cannot be bought directly
        sellPrice: 25,         // Sells for $25 per unit
        // icon: 'assets/icons/product_b.png' // Add actual asset path later
    }

    // --- Future Chemicals can be added here ---
    // 'Acid X': { id: 'Acid X', buyCost: 5, sellPrice: 0 },
    // 'Compound Y': { id: 'Compound Y', buyCost: 0, sellPrice: 50 },
};

/**
 * Helper function to get chemical data by ID.
 * Provides type safety and throws an error if the chemical doesn't exist.
 * @param id The ID of the chemical to retrieve.
 * @returns The ChemicalData object.
 * @throws Error if the chemical ID is not found in CHEMICAL_DATA.
 */
export function getChemicalData(id: string): ChemicalData {
    const data = CHEMICAL_DATA[id];
    if (!data) {
        throw new Error(`Chemical data not found for ID: ${id}`);
    }
    return data;
}