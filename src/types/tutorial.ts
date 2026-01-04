// Tutorial type definitions

export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    targetSelector: string; // CSS selector for element to highlight
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    action?: 'wait' | 'click' | 'input'; // Expected user action
    skipable: boolean;
}

export interface TutorialState {
    isActive: boolean;
    currentStep: number;
    isCompleted: boolean;
    showWelcome: boolean;
}

export interface SampleStaff {
    name: string;
    color: string;
}

export interface SampleShift {
    staffName: string;
    start: string;
    end: string;
}
