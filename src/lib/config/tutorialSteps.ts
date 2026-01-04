import { TutorialStep } from '@/types/tutorial';

export const tutorialSteps: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to LightShift! 🌌',
        description: 'Let\'s take a quick tour of your new staff scheduling tool. This tutorial will guide you through all the key features.',
        targetSelector: '',
        position: 'center',
        skipable: true,
    },
    {
        id: 'add-staff',
        title: 'Add Your First Staff Member',
        description: 'Start by adding a staff member. Type a name in the input field and click "Add" or press Enter. Each staff member gets a unique color automatically!',
        targetSelector: '[data-tutorial="add-staff-input"]',
        position: 'right',
        action: 'wait',
        skipable: false,
    },
    {
        id: 'create-shift',
        title: 'Create a Shift',
        description: 'Click and drag on the calendar to create a shift. Select a time slot, then choose which staff member will work that shift.',
        targetSelector: '[data-tutorial="calendar"]',
        position: 'left',
        action: 'wait',
        skipable: false,
    },
    {
        id: 'drag-drop',
        title: 'Reschedule with Drag & Drop',
        description: 'Need to reschedule? Simply drag any shift to a new time slot. LightShift will prevent conflicts automatically!',
        targetSelector: '.fc-event',
        position: 'top',
        action: 'wait',
        skipable: true,
    },
    {
        id: 'staff-filter',
        title: 'Filter by Staff Member',
        description: 'Click on any staff member in the sidebar to view only their shifts. This helps you focus on individual schedules. Click again to show all shifts.',
        targetSelector: '[data-tutorial="staff-list"]',
        position: 'right',
        action: 'wait',
        skipable: true,
    },
    {
        id: 'delete-shift',
        title: 'Delete Shifts',
        description: 'To delete a shift, you can either: (1) Click to select it, then press Delete or Backspace, or (2) Double-click the shift for quick deletion.',
        targetSelector: '.fc-event',
        position: 'top',
        skipable: true,
    },
    {
        id: 'export',
        title: 'Share Your Schedule',
        description: 'When you\'re ready, use the export controls to save your schedule as an image. You can download it, copy to clipboard, or share directly!',
        targetSelector: '[data-tutorial="export-controls"]',
        position: 'top',
        skipable: true,
    },
    {
        id: 'completion',
        title: 'You\'re All Set! 🎉',
        description: 'Congratulations! You now know how to use LightShift. Start creating your real schedule, or keep the sample data to practice more.',
        targetSelector: '',
        position: 'center',
        skipable: false,
    },
];

export const getTutorialStep = (index: number): TutorialStep | null => {
    if (index < 0 || index >= tutorialSteps.length) {
        return null;
    }
    return tutorialSteps[index];
};

export const getTotalSteps = (): number => {
    return tutorialSteps.length;
};
