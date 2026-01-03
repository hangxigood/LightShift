// Type definitions for the application

export interface Staff {
    id: string;
    name: string;
    color: string;
    createdAt: string;
}

export interface Shift {
    id: string;
    staffId: string;
    start: string;
    end: string;
    notes?: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
    extendedProps: {
        staffId: string;
        staffName: string;
    };
}
