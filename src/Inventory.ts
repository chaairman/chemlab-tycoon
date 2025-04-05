// src/Inventory.ts

// It's good practice to import data types if needed, though not strictly required for keys here
// import { CHEMICAL_DATA } from './data/Chemicals'; // We don't need the full data here, just the IDs (strings)

/**
 * Manages the storage of chemicals, tracking counts and enforcing capacity limits.
 */
export class Inventory {
    // Private property to store the chemical counts.
    // Uses a Map for efficient lookups, additions, and deletions.
    // Key: Chemical ID (string, e.g., 'Raw Chemical A')
    // Value: Amount stored (number)
    private storage: Map<string, number>;

    // Private property for the maximum total units that can be stored across all chemicals.
    private _maxCapacity: number;

    /**
     * Creates a new Inventory instance.
     * @param maxCapacity - The maximum total number of chemical units this inventory can hold.
     */
    constructor(maxCapacity: number) {
        // Ensure maxCapacity is a non-negative number
        if (maxCapacity < 0) {
            console.warn(`Inventory maxCapacity cannot be negative. Setting to 0.`);
            this._maxCapacity = 0;
        } else {
            this._maxCapacity = maxCapacity;
        }
        // Initialize the storage map as empty.
        this.storage = new Map<string, number>();
        console.log(`Inventory created with max capacity: ${this._maxCapacity}`);
    }

    /**
     * Calculates the current total number of units stored across all chemicals.
     * @returns The total number of units currently in storage.
     */
    getCurrentLoad(): number {
        let currentLoad = 0;
        // Iterate over all values (amounts) in the storage map and sum them up.
        for (const amount of this.storage.values()) {
            currentLoad += amount;
        }
        return currentLoad;
    }

    /**
     * Checks if adding a certain amount would exceed the maximum capacity.
     * @param amountToAdd - The amount intended to be added.
     * @returns True if adding the amount would exceed capacity, false otherwise.
     */
    private wouldExceedCapacity(amountToAdd: number): boolean {
        return this.getCurrentLoad() + amountToAdd > this._maxCapacity;
    }

    /**
     * Adds a specified amount of a chemical to the inventory.
     * Checks for capacity limits before adding.
     * @param chemicalId - The ID of the chemical to add (e.g., 'Product B').
     * @param amount - The positive integer amount to add.
     * @returns True if the chemical was successfully added, false if it failed (e.g., due to capacity or invalid amount).
     */
    addChemical(chemicalId: string, amount: number): boolean {
        // Input validation: Amount must be positive.
        if (amount <= 0) {
            console.warn(`Inventory.addChemical: Cannot add non-positive amount (${amount}) of ${chemicalId}.`);
            return false;
        }

        // Capacity check: Ensure adding this amount doesn't exceed the total limit.
        if (this.wouldExceedCapacity(amount)) {
            console.warn(`Inventory.addChemical: Cannot add ${amount} of ${chemicalId}. Exceeds capacity (${this.getCurrentLoad()}/${this._maxCapacity}).`);
            // Optionally, could add only up to capacity, but strict failure is simpler for now.
            return false;
        }

        // Get the current amount of this chemical (defaults to 0 if not present).
        const currentAmount = this.storage.get(chemicalId) || 0;
        // Update the storage map with the new total amount.
        this.storage.set(chemicalId, currentAmount + amount);
        console.log(`Inventory: Added ${amount} ${chemicalId}. New total: ${this.storage.get(chemicalId)}`);
        // Signal success.
        return true;
    }

    /**
     * Removes a specified amount of a chemical from the inventory.
     * Checks if enough of the chemical is available before removing.
     * @param chemicalId - The ID of the chemical to remove (e.g., 'Raw Chemical A').
     * @param amount - The positive integer amount to remove.
     * @returns True if the chemical was successfully removed, false if it failed (e.g., not enough available or invalid amount).
     */
    removeChemical(chemicalId: string, amount: number): boolean {
        // Input validation: Amount must be positive.
        if (amount <= 0) {
            console.warn(`Inventory.removeChemical: Cannot remove non-positive amount (${amount}) of ${chemicalId}.`);
            return false;
        }

        // Availability check: Ensure we have enough to remove.
        const currentAmount = this.storage.get(chemicalId) || 0;
        if (currentAmount < amount) {
            console.warn(`Inventory.removeChemical: Not enough ${chemicalId}. Tried to remove ${amount}, but only have ${currentAmount}.`);
            return false;
        }

        // Calculate the new amount.
        const newAmount = currentAmount - amount;
        // Update the storage map. If the new amount is 0, remove the entry entirely (optional, keeps map cleaner).
        if (newAmount === 0) {
            this.storage.delete(chemicalId);
        } else {
            this.storage.set(chemicalId, newAmount);
        }
        console.log(`Inventory: Removed ${amount} ${chemicalId}. Remaining: ${newAmount}`);
        // Signal success.
        return true;
    }

    /**
     * Gets the current stored amount of a specific chemical.
     * @param chemicalId - The ID of the chemical to query.
     * @returns The amount currently stored (0 if none).
     */
    getAmount(chemicalId: string): number {
        return this.storage.get(chemicalId) || 0;
    }

    /**
     * Checks if there is at least the specified amount of a chemical available.
     * @param chemicalId - The ID of the chemical to check.
     * @param amount - The amount required.
     * @returns True if the stored amount is greater than or equal to the required amount, false otherwise.
     */
    hasEnough(chemicalId: string, amount: number): boolean {
        return this.getAmount(chemicalId) >= amount;
    }

    /**
     * Checks if the inventory is completely full (current load equals max capacity).
     * @returns True if the inventory is full, false otherwise.
     */
    isFull(): boolean {
        return this.getCurrentLoad() >= this._maxCapacity;
    }

    /**
     * Gets the maximum storage capacity of this inventory.
     * @returns The maximum total units allowed.
     */
    getCapacity(): number {
        return this._maxCapacity;
    }

    /**
     * Gets the current load (total units stored).
     * Useful for UI display alongside capacity.
     * @returns The total units currently stored.
     */
    getLoad(): number {
        return this.getCurrentLoad();
    }


    /**
     * Provides read-only access to the current chemical storage.
     * Useful for UI elements that need to display all stored items.
     * Returns a *copy* to prevent external modification of the internal map.
     * @returns A new Map containing the current chemical IDs and amounts.
     */
    getStoredChemicals(): Map<string, number> {
        return new Map(this.storage); // Return a copy
    }

    /**
     * Increases the maximum storage capacity.
     * @param additionalCapacity - The positive amount to increase the capacity by.
     * @returns True if capacity was increased, false if the input was invalid.
     */
    increaseCapacity(additionalCapacity: number): boolean {
        if(additionalCapacity <= 0) {
             console.warn(`Inventory.increaseCapacity: Cannot increase capacity by non-positive amount (${additionalCapacity}).`);
             return false;
        }
        this._maxCapacity += additionalCapacity;
        console.log(`Inventory capacity increased by ${additionalCapacity}. New max capacity: ${this._maxCapacity}`);
        return true;
    }
}