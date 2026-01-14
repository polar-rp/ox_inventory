import { Slot } from '../typings';

/**
 * Calculates how many slots should be displayed for an inventory
 * Shows only the rows needed for occupied slots (no extra empty rows)
 * @param items - Array of inventory slots
 * @param totalSlots - Total available slots in inventory
 * @param gridCols - Number of columns in grid (default 5)
 * @returns Number of slots to display
 */
export const calculateDisplaySlots = (items: Slot[], totalSlots: number, gridCols: number = 5): number => {
    // Find highest occupied slot index
    let highestOccupied = 0;

    for (const item of items) {
        if (item.name && item.slot > highestOccupied) {
            highestOccupied = item.slot;
        }
    }

    // If no items, show minimum 1 row
    if (highestOccupied === 0) {
        return gridCols;
    }

    // Calculate rows needed for occupied slots (rounded up)
    const occupiedRows = Math.ceil(highestOccupied / gridCols);

    // Calculate total slots to display (just occupied rows, no extra)
    const calculatedSlots = occupiedRows * gridCols;

    // Max totalSlots
    const finalSlots = Math.min(calculatedSlots, totalSlots);

    return finalSlots;
};
