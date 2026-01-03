import { Shift } from "@/types";

// Color palette for staff assignment
const PALETTE = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
];

/**
 * Checks if a new shift conflicts with existing shifts for the same staff member.
 * Conflicts are only checked against shifts for the SAME staff member.
 * Multiple different staff members can have overlapping shifts.
 * 
 * @param newShift - The shift to check (must have staffId, start, end)
 * @param existingShifts - Array of existing shifts to check against
 * @returns true if there's a conflict, false otherwise
 */
export const isShiftConflict = (newShift: Omit<Shift, 'id'> | Shift, existingShifts: Shift[]): boolean => {
    const newStart = new Date(newShift.start);
    const newEnd = new Date(newShift.end);

    // If dates are invalid, we treat it as a conflict to block saving bad data
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
        return true;
    }

    return existingShifts.some(shift => {
        // Only check conflicts for the same staff member
        if (shift.staffId !== newShift.staffId) {
            return false;
        }

        const existingStart = new Date(shift.start);
        const existingEnd = new Date(shift.end);

        // Check for overlap: newStart < existingEnd AND newEnd > existingStart
        // This catches all overlap cases except touching boundaries
        return newStart < existingEnd && newEnd > existingStart;
    });
};

/**
 * Returns the next available color for a new staff member.
 * Finds the first color from the palette that isn't already in use.
 * Falls back to HSL colors if all palette colors are taken.
 * 
 * @param existingStaff - Array of existing staff members with their colors
 * @returns A color string (hex or HSL)
 */
export const getNextColor = (existingStaff: Array<{ color: string }>): string => {
    const usedColors = new Set(existingStaff.map(s => s.color));

    // Find first unused color from palette
    for (const color of PALETTE) {
        if (!usedColors.has(color)) {
            return color;
        }
    }

    // All palette colors are used, generate HSL color
    // Use the count as seed for deterministic but varied colors
    const index = existingStaff.length;
    const hue = (index * 137.508) % 360; // Golden angle for better distribution
    return `hsl(${Math.floor(hue)}, 70%, 50%)`;
};
