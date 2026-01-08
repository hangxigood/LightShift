import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getNextColor, isShiftConflict } from '../lib/utils/calendarUtils';
import { ShiftSchema } from '../lib/utils/validation';
import { getSampleData } from '../lib/utils/tutorialHelpers';
import { getTotalSteps } from '../lib/config/tutorialSteps';

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
    currentViewDate: Date; // Track the currently visible week in the calendar
    sidebarOpen: boolean; // Track sidebar visibility for mobile responsiveness

    // Tutorial State
    tutorialActive: boolean;
    tutorialStep: number;
    tutorialCompleted: boolean;
    showWelcome: boolean;
    sampleDataLoaded: boolean;

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

    // View Actions
    setCurrentViewDate: (date: Date) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    // Tutorial Actions
    startTutorial: () => void;
    nextTutorialStep: () => void;
    previousTutorialStep: () => void;
    skipTutorial: () => void;
    completeTutorial: () => void;
    resetTutorial: () => void;
    setShowWelcome: (show: boolean) => void;
    loadSampleData: () => void;
    clearSampleData: () => void;

    // Data Management Actions
    importData: (staff: Array<{ name: string; color: string }>, shifts: Array<{ staffName: string; start: string; end: string; notes?: string }>) => void;
    clearAllData: () => void;
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
            currentViewDate: new Date(),
            sidebarOpen: false, // Default to hidden for mobile-first approach

            // Tutorial initial state
            tutorialActive: false,
            tutorialStep: 0,
            tutorialCompleted: false,
            showWelcome: false,
            sampleDataLoaded: false,

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

            setCurrentViewDate: (date: Date) => {
                set({ currentViewDate: date });
            },

            toggleSidebar: () => {
                const state = get();
                set({ sidebarOpen: !state.sidebarOpen });
            },

            setSidebarOpen: (open: boolean) => {
                set({ sidebarOpen: open });
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

            // Tutorial Actions
            startTutorial: () => {
                set({
                    tutorialActive: true,
                    tutorialStep: 0,
                    showWelcome: false,
                });
            },

            nextTutorialStep: () => {
                const state = get();
                const totalSteps = getTotalSteps();
                if (state.tutorialStep < totalSteps - 1) {
                    set({ tutorialStep: state.tutorialStep + 1 });
                } else {
                    get().completeTutorial();
                }
            },

            previousTutorialStep: () => {
                const state = get();
                if (state.tutorialStep > 0) {
                    set({ tutorialStep: state.tutorialStep - 1 });
                }
            },

            skipTutorial: () => {
                set({
                    tutorialActive: false,
                    tutorialCompleted: true,
                    showWelcome: false,
                });
                // Clear sample data if it was loaded
                if (get().sampleDataLoaded) {
                    get().clearSampleData();
                }
            },

            completeTutorial: () => {
                set({
                    tutorialActive: false,
                    tutorialCompleted: true,
                    tutorialStep: 0,
                });
            },

            resetTutorial: () => {
                set({
                    tutorialActive: false,
                    tutorialStep: 0,
                    tutorialCompleted: false,
                    showWelcome: true,
                });
            },

            setShowWelcome: (show: boolean) => {
                set({ showWelcome: show });
            },

            loadSampleData: () => {
                const state = get();
                // Don't load if already loaded or if user has existing data
                if (state.sampleDataLoaded || state.staff.length > 0) {
                    return;
                }

                const sampleData = getSampleData();

                // Add sample staff
                const staffMap = new Map<string, Staff>();
                sampleData.staff.forEach(sampleStaff => {
                    const newStaff: Staff = {
                        id: generateId(),
                        name: sampleStaff.name,
                        color: sampleStaff.color,
                        createdAt: new Date().toISOString(),
                    };
                    staffMap.set(sampleStaff.name, newStaff);
                });

                // Add sample shifts
                const newShifts: Shift[] = sampleData.shifts.map(sampleShift => {
                    const staff = staffMap.get(sampleShift.staffName);
                    if (!staff) return null;

                    return {
                        id: generateId(),
                        staffId: staff.id,
                        start: sampleShift.start,
                        end: sampleShift.end,
                    };
                }).filter((shift): shift is Shift => shift !== null);

                set({
                    staff: Array.from(staffMap.values()),
                    shifts: newShifts,
                    sampleDataLoaded: true,
                });
            },

            clearSampleData: () => {
                const state = get();
                if (state.sampleDataLoaded) {
                    set({
                        staff: [],
                        shifts: [],
                        sampleDataLoaded: false,
                    });
                }
            },

            // Data Management Actions
            importData: (importedStaff, importedShifts) => {
                // Create staff with new IDs
                const staffMap = new Map<string, Staff>();
                importedStaff.forEach(s => {
                    const newStaff: Staff = {
                        id: generateId(),
                        name: s.name,
                        color: s.color,
                        createdAt: new Date().toISOString(),
                    };
                    staffMap.set(s.name, newStaff);
                });

                // Create shifts with references to new staff IDs
                const newShifts = importedShifts.map(s => {
                    const staff = staffMap.get(s.staffName);
                    if (!staff) return null;
                    const shift: Shift = {
                        id: generateId(),
                        staffId: staff.id,
                        start: s.start,
                        end: s.end,
                    };
                    if (s.notes) {
                        shift.notes = s.notes;
                    }
                    return shift;
                }).filter((shift): shift is Shift => shift !== null);

                set({
                    staff: Array.from(staffMap.values()),
                    shifts: newShifts,
                    sampleDataLoaded: false,
                    selectedStaffId: null,
                    selectedShiftId: null,
                    deletingStaffId: null,
                });
            },

            clearAllData: () => {
                set({
                    staff: [],
                    shifts: [],
                    sampleDataLoaded: false,
                    selectedStaffId: null,
                    selectedShiftId: null,
                    deletingStaffId: null,
                });
            },
        }),
        {
            name: 'lightshift-store',
            partialize: (state) => ({
                staff: state.staff,
                shifts: state.shifts,
                tutorialCompleted: state.tutorialCompleted,
                sampleDataLoaded: state.sampleDataLoaded,
                currentViewDate: state.currentViewDate,
                // Exclude UI states: sidebarOpen, selectedStaffId, selectedShiftId, deletingStaffId, tutorialActive, tutorialStep, showWelcome
            }),
        }
    )
);
