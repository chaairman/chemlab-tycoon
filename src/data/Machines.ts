// src/data/Machines.ts

/**
 * Defines the properties for a type of placeable machine.
 */
export interface MachineTypeData {
    /** The unique identifier and display name for the machine type. */
    id: string;
    /** The cost to purchase one machine of this type. */
    cost: number;
    /** The path to the sprite/texture asset for this machine type. */
    spritePath: string;
}

/**
 * A map holding the data for all available machine types, keyed by their ID.
 */
export const MACHINE_TYPE_DATA: Record<string, MachineTypeData> = {
    'Mixer': {
        id: 'Mixer',
        cost: 100,
        spritePath: 'assets/sprites/mixer_placeholder.png', // We will replace this path later
    },

    // --- NEW MACHINE TYPE ---
    'Heater': {
        id: 'Heater',
        cost: 300,                                        // More expensive than Mixer
        spritePath: 'assets/sprites/heater_placeholder.png', // Placeholder path for now
    },
};

/**
 * Helper function to get machine type data by ID.
 * @param id The ID of the machine type (e.g., 'Mixer').
 * @returns The MachineTypeData object.
 * @throws Error if the machine type ID is not found.
 */
export function getMachineTypeData(id: string): MachineTypeData {
    const data = MACHINE_TYPE_DATA[id];
    if (!data) {
        throw new Error(`Machine type data not found for ID: ${id}`);
    }
    return data;
}