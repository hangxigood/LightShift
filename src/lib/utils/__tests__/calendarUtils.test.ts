import { isShiftConflict, getNextColor } from '../calendarUtils';

describe('calendarUtils', () => {
    describe('isShiftConflict', () => {
        const existingShift = {
            id: '1',
            staffId: 'staff1',
            start: '2023-10-10T09:00:00',
            end: '2023-10-10T10:00:00',
        };
        const existingShifts = [existingShift];
        const staffId = 'staff1';

        test('Exact Match: New shift starts and ends at the exact same time -> true', () => {
            const newShift = {
                id: '2',
                staffId,
                start: '2023-10-10T09:00:00',
                end: '2023-10-10T10:00:00',
            };
            expect(isShiftConflict(newShift, existingShifts)).toBe(true);
        });

        test('Partial Overlap (Start): New shift starts before existing ends -> true', () => {
            const newShift = {
                id: '2',
                staffId,
                start: '2023-10-10T08:30:00',
                end: '2023-10-10T09:30:00',
            };
            expect(isShiftConflict(newShift, existingShifts)).toBe(true);
        });

        test('Partial Overlap (End): New shift ends after existing starts -> true', () => {
            const newShift = {
                id: '2',
                staffId,
                start: '2023-10-10T09:30:00',
                end: '2023-10-10T10:30:00',
            };
            expect(isShiftConflict(newShift, existingShifts)).toBe(true);
        });

        test('Enclosure: New shift completely covers an existing shift -> true', () => {
            const newShift = {
                id: '2',
                staffId,
                start: '2023-10-10T08:00:00',
                end: '2023-10-10T11:00:00',
            };
            expect(isShiftConflict(newShift, existingShifts)).toBe(true);
        });

        test('Inside: New shift is completely inside an existing shift -> true', () => {
            const newShift = {
                id: '2',
                staffId,
                start: '2023-10-10T09:15:00',
                end: '2023-10-10T09:45:00',
            };
            expect(isShiftConflict(newShift, existingShifts)).toBe(true);
        });

        test('Touching (Boundary): New shift ends exactly when existing starts -> false', () => {
            const newShift = {
                id: '2',
                staffId,
                start: '2023-10-10T08:00:00',
                end: '2023-10-10T09:00:00',
            };
            expect(isShiftConflict(newShift, existingShifts)).toBe(false);
        });

        test('Touching (Boundary): New shift starts exactly when existing ends -> false', () => {
            const newShift = {
                id: '2',
                staffId,
                start: '2023-10-10T10:00:00',
                end: '2023-10-10T11:00:00',
            };
            expect(isShiftConflict(newShift, existingShifts)).toBe(false);
        });

        test('Different Staff: Overlap with a DIFFERENT staff member -> false', () => {
            const newShift = {
                id: '2',
                staffId: 'staff2', // Different ID
                start: '2023-10-10T09:00:00',
                end: '2023-10-10T10:00:00',
            };
            expect(isShiftConflict(newShift, existingShifts)).toBe(false);
        });

        test('Multi-Day Shifts: Properly detects conflicts across date boundaries', () => {
            // Existing shift: 10 PM to 6 AM (next day)
            const overnightShift = {
                id: '2',
                staffId: 'staff1',
                start: '2023-10-10T22:00:00',
                end: '2023-10-11T06:00:00',
            };

            // Conflict at 11 PM on the first day
            const conflictingShift1 = {
                id: '3',
                staffId: 'staff1',
                start: '2023-10-10T23:00:00',
                end: '2023-10-11T00:00:00',
            };
            // Conflict at 5 AM on the next day
            const conflictingShift2 = {
                id: '4',
                staffId: 'staff1',
                start: '2023-10-11T05:00:00',
                end: '2023-10-11T07:00:00',
            };

            expect(isShiftConflict(conflictingShift1, [overnightShift])).toBe(true);
            expect(isShiftConflict(conflictingShift2, [overnightShift])).toBe(true);
        });
    });

    describe('getNextColor', () => {
        test('Returns first palette color when no staff exist', () => {
            const color = getNextColor([]);
            expect(color).toBe('#3B82F6'); // First color in palette (Blue)
        });

        test('Returns second palette color when one staff exists', () => {
            const existingStaff = [{ color: '#3B82F6' }];
            const color = getNextColor(existingStaff);
            expect(color).toBe('#EF4444'); // Second color (Red)
        });

        test('Reuses deleted staff colors', () => {
            // Staff 1 (Blue) and Staff 3 (Emerald) exist, Staff 2 (Red) was deleted
            const existingStaff = [
                { color: '#3B82F6' }, // Blue
                { color: '#10B981' }, // Emerald
            ];
            const color = getNextColor(existingStaff);
            expect(color).toBe('#EF4444'); // Should reuse Red (the first gap)
        });

        test('Returns HSL color when all palette colors are used', () => {
            const existingStaff = [
                { color: '#3B82F6' },
                { color: '#EF4444' },
                { color: '#10B981' },
                { color: '#F59E0B' },
                { color: '#8B5CF6' },
                { color: '#EC4899' },
                { color: '#06B6D4' },
                { color: '#F97316' },
            ];
            const color = getNextColor(existingStaff);
            expect(color.startsWith('hsl')).toBeTruthy();
        });

        test('Color Uniqueness: Generated HSL colors are visually distinct', () => {
            // Start with all 8 palette colors used
            const paletteStaff = [
                { color: '#3B82F6' },
                { color: '#EF4444' },
                { color: '#10B981' },
                { color: '#F59E0B' },
                { color: '#8B5CF6' },
                { color: '#EC4899' },
                { color: '#06B6D4' },
                { color: '#F97316' },
            ];

            const generatedColors = new Set();
            let currentStaff = [...paletteStaff];

            // Generate 10 more colors beyond the palette
            for (let i = 0; i < 10; i++) {
                const newColor = getNextColor(currentStaff);
                generatedColors.add(newColor);
                currentStaff.push({ color: newColor });
            }

            // All 10 should be unique
            expect(generatedColors.size).toBe(10);
        });
    });
});
