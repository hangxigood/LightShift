import { SampleStaff, SampleShift } from '@/types/tutorial';

/**
 * Check if this is the user's first time visiting the app
 */
export const isFirstTimeUser = (): boolean => {
    if (typeof window === 'undefined') return false;

    const hasVisited = localStorage.getItem('lightshift-has-visited');
    if (!hasVisited) {
        localStorage.setItem('lightshift-has-visited', 'true');
        return true;
    }
    return false;
};

/**
 * Generate sample data for tutorial mode
 */
export const getSampleData = (): { staff: SampleStaff[]; shifts: SampleShift[] } => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Get the start of the current week (Monday)
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust when day is Sunday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const staff: SampleStaff[] = [
        { name: 'Alice Johnson', color: '#3b82f6' },
        { name: 'Bob Smith', color: '#10b981' },
        { name: 'Carol Davis', color: '#f59e0b' },
    ];

    // Create shifts for the current week
    const mondayStr = formatDate(monday);
    const tuesday = new Date(monday);
    tuesday.setDate(monday.getDate() + 1);
    const tuesdayStr = formatDate(tuesday);

    const wednesday = new Date(monday);
    wednesday.setDate(monday.getDate() + 2);
    const wednesdayStr = formatDate(wednesday);

    const thursday = new Date(monday);
    thursday.setDate(monday.getDate() + 3);
    const thursdayStr = formatDate(thursday);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    const fridayStr = formatDate(friday);

    const shifts: SampleShift[] = [
        // Monday
        { staffName: 'Alice Johnson', start: `${mondayStr}T09:00:00`, end: `${mondayStr}T17:00:00` },
        { staffName: 'Bob Smith', start: `${mondayStr}T13:00:00`, end: `${mondayStr}T21:00:00` },

        // Tuesday
        { staffName: 'Carol Davis', start: `${tuesdayStr}T08:00:00`, end: `${tuesdayStr}T16:00:00` },
        { staffName: 'Alice Johnson', start: `${tuesdayStr}T12:00:00`, end: `${tuesdayStr}T20:00:00` },

        // Wednesday
        { staffName: 'Bob Smith', start: `${wednesdayStr}T09:00:00`, end: `${wednesdayStr}T17:00:00` },
        { staffName: 'Carol Davis', start: `${wednesdayStr}T14:00:00`, end: `${wednesdayStr}T22:00:00` },

        // Thursday
        { staffName: 'Alice Johnson', start: `${thursdayStr}T08:00:00`, end: `${thursdayStr}T16:00:00` },
        { staffName: 'Bob Smith', start: `${thursdayStr}T16:00:00`, end: `${fridayStr}T00:00:00` },

        // Friday
        { staffName: 'Carol Davis', start: `${fridayStr}T10:00:00`, end: `${fridayStr}T18:00:00` },
        { staffName: 'Alice Johnson', start: `${fridayStr}T18:00:00`, end: `${fridayStr}T23:00:00` },
    ];

    return { staff, shifts };
};

/**
 * Get the position of an element for tooltip placement
 */
export const getElementPosition = (selector: string): DOMRect | null => {
    if (typeof window === 'undefined') return null;

    const element = document.querySelector(selector);
    if (!element) return null;

    return element.getBoundingClientRect();
};

/**
 * Scroll to an element smoothly
 */
export const scrollToElement = (selector: string): void => {
    if (typeof window === 'undefined') return;

    const element = document.querySelector(selector);
    if (!element) return;

    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
    });
};

/**
 * Wait for an element to exist in the DOM
 */
export const waitForElement = (selector: string, timeout = 5000): Promise<Element> => {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
};
