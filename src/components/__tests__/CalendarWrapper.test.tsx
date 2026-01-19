
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarWrapper } from '../CalendarWrapper';
import { useStore } from '../../store/useStore';

// Mock useStore
jest.mock('../../store/useStore', () => ({
    useStore: jest.fn(),
}));

// Mock FullCalendar
jest.mock('@fullcalendar/react', () => {
    return function DummyFullCalendar(props: any) {
        return (
            <div data-testid="full-calendar">
                <button
                    data-testid="trigger-select"
                    onClick={() => {
                        props.select({
                            startStr: '2023-01-01T09:00:00',
                            endStr: '2023-01-01T17:00:00',
                            start: new Date('2023-01-01T09:00:00'),
                            end: new Date('2023-01-01T17:00:00'),
                            view: {
                                type: 'timeGridWeek',
                                calendar: { unselect: jest.fn(), changeView: jest.fn() },
                                currentStart: new Date('2023-01-01')
                            }
                        });
                    }}
                >
                    Trigger Select
                </button>
            </div>
        );
    };
});

// Mock plugins to avoid errors if they are imported in CalendarWrapper
jest.mock('@fullcalendar/daygrid', () => ({}));
jest.mock('@fullcalendar/timegrid', () => ({}));
jest.mock('@fullcalendar/interaction', () => ({}));

// Mock CreateShiftModal
jest.mock('../CreateShiftModal', () => ({
    CreateShiftModal: ({ isOpen }: { isOpen: boolean }) => (
        isOpen ? <div data-testid="create-shift-modal">Modal Open</div> : null
    )
}));

describe('CalendarWrapper', () => {
    const mockAddShiftWithValidation = jest.fn();
    const mockClearAllSelections = jest.fn();
    const mockSetCurrentViewDate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockAddShiftWithValidation.mockReturnValue({ success: true });
    });

    it('opens modal when no staff is selected', () => {
        (useStore as unknown as jest.Mock).mockReturnValue({
            staff: [],
            shifts: [],
            selectedStaffId: null,
            selectedShiftId: null,
            deletingStaffId: null,
            updateShiftWithValidation: jest.fn(),
            addShiftWithValidation: mockAddShiftWithValidation,
            setSelectedShiftId: jest.fn(),
            clearAllSelections: mockClearAllSelections,
            setCurrentViewDate: mockSetCurrentViewDate,
        });

        render(<CalendarWrapper />);

        fireEvent.click(screen.getByTestId('trigger-select'));

        expect(screen.getByTestId('create-shift-modal')).toBeInTheDocument();
        expect(mockClearAllSelections).toHaveBeenCalled();
    });

    it('auto-assigns shift when staff is selected', () => {
        const mockStaff = [{ id: '123', name: 'Alice', color: 'red' }];

        (useStore as unknown as jest.Mock).mockReturnValue({
            staff: mockStaff,
            shifts: [],
            selectedStaffId: '123',
            selectedShiftId: null,
            deletingStaffId: null,
            updateShiftWithValidation: jest.fn(),
            addShiftWithValidation: mockAddShiftWithValidation,
            setSelectedShiftId: jest.fn(),
            clearAllSelections: mockClearAllSelections,
            setCurrentViewDate: mockSetCurrentViewDate,
        });

        render(<CalendarWrapper />);

        fireEvent.click(screen.getByTestId('trigger-select'));

        // Modal should NOT be open
        expect(screen.queryByTestId('create-shift-modal')).not.toBeInTheDocument();

        // Should call addShiftWithValidation
        expect(mockAddShiftWithValidation).toHaveBeenCalledWith(
            'Alice',
            '2023-01-01T09:00:00',
            '2023-01-01T17:00:00'
        );

        // Should NOT clear selections (so we can keep adding shifts for the same staff)
        expect(mockClearAllSelections).not.toHaveBeenCalled();
    });
});
