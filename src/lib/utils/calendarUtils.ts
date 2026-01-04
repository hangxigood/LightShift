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

/**
 * Gets the start and end of a week (Sunday to Saturday) for a given date
 * @param referenceDate - Optional date to calculate week range for (defaults to today)
 * @returns Object with weekStart and weekEnd dates
 */
export const getWeekRange = (referenceDate?: Date): { weekStart: Date; weekEnd: Date } => {
    const date = referenceDate || new Date();
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Calculate start of week (Sunday at 00:00:00)
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    // Calculate end of week (Saturday at 23:59:59)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
};

/**
 * Calculates weekly statistics for a staff member
 * @param staffId - The staff member's ID
 * @param shifts - Array of all shifts
 * @param referenceDate - Optional date to calculate stats for (defaults to current week)
 * @returns Object with shift count and total hours for the specified week
 */
export const getWeeklyStats = (staffId: string, shifts: Shift[], referenceDate?: Date): { count: number; hours: number } => {
    const { weekStart, weekEnd } = getWeekRange(referenceDate);

    // Filter shifts for this staff member within the specified week
    const weeklyShifts = shifts.filter(shift => {
        if (shift.staffId !== staffId) return false;

        const shiftStart = new Date(shift.start);
        const shiftEnd = new Date(shift.end);

        // Check if shift overlaps with the week
        return shiftStart <= weekEnd && shiftEnd >= weekStart;
    });

    // Calculate total hours
    const totalHours = weeklyShifts.reduce((sum, shift) => {
        const shiftStart = new Date(shift.start);
        const shiftEnd = new Date(shift.end);
        const durationMs = shiftEnd.getTime() - shiftStart.getTime();
        const hours = durationMs / (1000 * 60 * 60); // Convert ms to hours
        return sum + hours;
    }, 0);

    return {
        count: weeklyShifts.length,
        hours: Math.round(totalHours * 10) / 10 // Round to 1 decimal place
    };
};
