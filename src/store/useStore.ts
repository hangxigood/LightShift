import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getNextColor, isShiftConflict } from '../lib/utils/calendarUtils';
import { ShiftSchema } from '../lib/utils/validation';

// ... (types and generateId helper remain the same)

// Type definitions
interface Staff {
    id: string;
    name: string;
    color: string;
    createdAt: string;
}

interface Shift {
    id: string;
    staffId: string;
    start: string;
    end: string;
    notes?: string;
}

interface AppState {
    staff: Staff[];
    shifts: Shift[];
    selectedStaffId: string | null;
    selectedShiftId: string | null;
    deletingStaffId: string | null;

    // Staff Actions
    addStaff: (name: string) => Staff;
    updateStaff: (id: string, updates: Partial<Staff>) => void;
    deleteStaff: (id: string) => void;
    getDeleteStaffCount: (id: string) => number;

    // Shift Actions (Low-level)
    addShift: (shift: Omit<Shift, 'id'> | Shift) => void;
    updateShift: (id: string, updates: Partial<Shift>) => void;
    deleteShift: (id: string) => void;

    // Shift Actions (High-level with validation)
    addShiftWithValidation: (staffName: string, start: string, end: string) => { success: boolean; error?: string };
    updateShiftWithValidation: (id: string, updates: Partial<Shift>) => { success: boolean; error?: string };

    // Selection Actions
    setSelectedStaffId: (id: string | null) => void;
    setSelectedShiftId: (id: string | null) => void;
    setDeletingStaffId: (id: string | null) => void;
    clearAllSelections: () => void;
}

// Helper to generate UUID
const generateId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            staff: [],
            shifts: [],
            selectedStaffId: null,
            selectedShiftId: null,
            deletingStaffId: null,

            addStaff: (name: string) => {
                const state = get();
                const newStaff: Staff = {
                    id: generateId(),
                    name,
                    color: getNextColor(state.staff),
                    createdAt: new Date().toISOString(),
                };

                set({ staff: [...state.staff, newStaff] });
                return newStaff;
            },

            updateStaff: (id: string, updates: Partial<Staff>) => {
                const state = get();
                set({
                    staff: state.staff.map(s =>
                        s.id === id ? { ...s, ...updates } : s
                    ),
                });
            },

            deleteStaff: (id: string) => {
                const state = get();
                set({
                    staff: state.staff.filter(s => s.id !== id),
                    shifts: state.shifts.filter(shift => shift.staffId !== id),
                });
                // Clear all selections after deletion
                get().clearAllSelections();
            },

            getDeleteStaffCount: (id: string) => {
                const state = get();
                return state.shifts.filter(shift => shift.staffId === id).length;
            },

            addShift: (shift: Omit<Shift, 'id'> | Shift) => {
                // Runtime validation
                const validationResult = ShiftSchema.safeParse(shift);
                if (!validationResult.success) {
                    console.error('Invalid shift data:', validationResult.error);
                    return;
                }

                const state = get();
                const newShift: Shift = 'id' in shift
                    ? shift as Shift
                    : {
                        ...shift,
                        id: generateId(),
                    };

                set({ shifts: [...state.shifts, newShift] });
            },

            updateShift: (id: string, updates: Partial<Shift>) => {
                const state = get();
                const currentShift = state.shifts.find(s => s.id === id);
                if (!currentShift) return;

                // Validate the combined result
                const validationResult = ShiftSchema.safeParse({ ...currentShift, ...updates });
                if (!validationResult.success) {
                    console.error('Invalid shift update:', validationResult.error);
                    return;
                }

                set({
                    shifts: state.shifts.map(shift =>
                        shift.id === id ? { ...shift, ...updates } : shift
                    ),
                });
            },

            deleteShift: (id: string) => {
                const state = get();
                set({
                    shifts: state.shifts.filter(shift => shift.id !== id),
                });
            },

            setSelectedStaffId: (id: string | null) => {
                // Clear shift selection when selecting staff (mutual exclusivity per PRD)
                set({ selectedStaffId: id, selectedShiftId: null });
            },

            setSelectedShiftId: (id: string | null) => {
                // Clear staff selection when selecting shift (mutual exclusivity per PRD)
                set({ selectedShiftId: id, selectedStaffId: null });
            },

            setDeletingStaffId: (id: string | null) => {
                set({ deletingStaffId: id });
            },

            clearAllSelections: () => {
                set({ selectedStaffId: null, selectedShiftId: null, deletingStaffId: null });
            },

            addShiftWithValidation: (staffName: string, start: string, end: string) => {
                const state = get();
                const trimmedName = staffName.trim();

                // Find or create staff
                let staffMember = state.staff.find(s => s.name.toLowerCase() === trimmedName.toLowerCase());
                if (!staffMember) {
                    staffMember = get().addStaff(trimmedName);
                }

                const newShift = {
                    staffId: staffMember.id,
                    start,
                    end,
                };

                // Check for conflicts
                if (isShiftConflict(newShift, state.shifts)) {
                    return { success: false, error: 'This shift conflicts with an existing shift for this staff member!' };
                }

                // Add the shift
                get().addShift(newShift);
                return { success: true };
            },

            updateShiftWithValidation: (id: string, updates: Partial<Shift>) => {
                const state = get();
                const currentShift = state.shifts.find(s => s.id === id);
                if (!currentShift) {
                    return { success: false, error: 'Shift not found' };
                }

                const updatedShift = { ...currentShift, ...updates };
                const otherShifts = state.shifts.filter(s => s.id !== id);

                // Check for conflicts
                if (isShiftConflict(updatedShift, otherShifts)) {
                    return { success: false, error: 'This shift conflicts with an existing shift for this staff member!' };
                }

                // Update the shift
                get().updateShift(id, updates);
                return { success: true };
            },
        }),
        {
            name: 'lightshift-store',
        }
    )
);
