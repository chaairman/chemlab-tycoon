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
    icon?: string;
}

/**
 * A map holding the data for all available chemicals in the game, keyed by their ID.
 */
export const CHEMICAL_DATA: Record<string, ChemicalData> = {
    // --- Raw Chemicals ---
    'Raw Chemical A': {
        id: 'Raw Chemical A',
        buyCost: 10,
        sellPrice: 0,
        // icon: 'assets/icons/raw_a.png'
    },

    // --- Intermediate/Final Products ---
    'Product B': {
        id: 'Product B',
        buyCost: 0,
        sellPrice: 25, // Sell price for the output of the Mixer
        // icon: 'assets/icons/product_b.png'
    },

    // --- NEW CHEMICAL (Tier 2 Product) ---
    'Product C': {
        id: 'Product C',
        buyCost: 0,           // Cannot be bought directly
        sellPrice: 60,          // Sells for more, as it requires more processing
        // icon: 'assets/icons/product_c.png'
    }
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