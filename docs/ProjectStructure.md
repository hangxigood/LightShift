# Project Structure & Implementation Guide

This document outlines the file organization and the responsibilities of each key module in LightShift.

## 📂 File Tree

```text
src/
├── app/
│   ├── globals.css          # Tailwind directives + FullCalendar overrides
│   ├── layout.tsx           # Root layout (Metadata, Fonts)
│   └── page.tsx             # Main View (Sidebar + Calendar Layout)
├── components/
│   ├── CalendarWrapper.tsx  # FullCalendar React Component
│   ├── CreateShiftModal.tsx # Modal for adding new shifts
│   ├── StaffSidebar.tsx     # Staff List UI & Controls
│   └── ui/                  # Shared micro-components (Modals, Inputs, Buttons)
├── store/
│   └── useStore.ts          # Zustand Store (AppState, Actions, Persistence)
├── lib/
│   ├── utils/
│   │   └── calendarUtils.ts # Scheduling Algorithms (Conflict, Colors)
│   └── services/
│       └── exportService.ts # Image Generation Logic (html2canvas)
└── types/
    └── index.ts             # Shared TypeScript Interfaces (Staff, Shift)
```

## 🧩 Key Modules & Functions

### 1. Store (`src/store/useStore.ts`)
The central brain of the application. Handles state and business logic.

#### State
| State | Description |
| :--- | :--- |
| **`staff`** | Array of all staff members. |
| **`shifts`** | Array of all scheduled shifts. |
| **`selectedStaffId`** | ID of the currently selected staff member (for highlighting). |
| **`selectedShiftId`** | ID of the currently selected shift (for keyboard deletion). |

#### Staff Actions
| Function | Description |
| :--- | :--- |
| **`addStaff(name)`** | Creates a new Staff entity with an auto-assigned color from the palette. |
| **`updateStaff(id, updates)`** | Updates a staff member's properties (e.g., name, color). |
| **`deleteStaff(id)`** | Cascading delete: removes the staff member AND all their assigned shifts. |
| **`getDeleteStaffCount(id)`** | Returns the number of shifts that would be deleted with a staff member. |

#### Shift Actions (Low-level)
| Function | Description |
| :--- | :--- |
| **`addShift(shift)`** | Adds a shift with runtime validation (Zod schema). Does NOT check conflicts. |
| **`updateShift(id, updates)`** | Updates a shift's properties with runtime validation. Does NOT check conflicts. |
| **`deleteShift(id)`** | Removes a shift from the schedule. |

#### Shift Actions (High-level with Business Logic)
| Function | Description |
| :--- | :--- |
| **`addShiftWithValidation(staffName, start, end)`** | **Recommended for UI.** Auto-creates staff if needed, checks for conflicts, validates data, and adds the shift. Returns `{ success, error? }`. |
| **`updateShiftWithValidation(id, updates)`** | **Recommended for UI.** Checks for conflicts before updating. Returns `{ success, error? }`. |

#### Selection Actions
| Function | Description |
| :--- | :--- |
| **`setSelectedStaffId(id)`** | Sets the currently selected staff member for highlighting. |
| **`setSelectedShiftId(id)`** | Sets the currently selected shift for keyboard operations. |

#### Persistence
| Mechanism | Description |
| :--- | :--- |
| **`persist` middleware** | Automatically syncs all state changes to `localStorage` under the key `lightshift-store`. |

### 2. Calendar Wrapper (`src/components/CalendarWrapper.tsx`)
The interactive scheduling grid. **Thin component** that delegates business logic to the store.

| Function / Handler | Description |
| :--- | :--- |
| **`handleEventDrop`** | Triggered when a shift is dragged. Calls `updateShiftWithValidation`. Reverts if blocked. |
| **`handleEventResize`** | Triggered when a shift is resized. Calls `updateShiftWithValidation`. Reverts if blocked. |
| **`handleDateSelect`** | Triggered when user clicks/drags an empty slot. Opens `CreateShiftModal`. |
| **`handleEventClick`** | Triggered when a shift is clicked. Toggles `selectedShiftId` for keyboard deletion. |
| **`renderEventContent`** | Custom rendering for shift blocks. Applies "Dimmed" class if a different staff is selected. Applies selection border if shift is selected. |
| **Keyboard Shortcuts** | `Delete`/`Backspace` to remove selected shift. `Escape` to close modal. |

### 3. Create Shift Modal (`src/components/CreateShiftModal.tsx`)
The popup for adding new shifts.

| Prop / Handler | Description |
| :--- | :--- |
| **`isOpen`** | Controls modal visibility. |
| **`staffNameInput`** | Controlled input state for staff name with autocomplete (datalist). |
| **`staff`** | Array of existing staff for autocomplete suggestions. |
| **`onSubmit`** | Calls `addShiftWithValidation` from the store. Displays error if validation fails. |
| **`onClose`** | Closes the modal and clears the calendar selection. |

### 4. Staff Sidebar (`src/components/StaffSidebar.tsx`)
The management panel.

| Function | Description |
| :--- | :--- |
| **`handleStaffClick`** | Sets the `selectedStaffId` to highlight that person's shifts on the calendar. |
| **`handleEditName`** | Inline editing of staff names via the edit (✏️) button. |
| **`handleExport`** | Triggers the screenshot generation via `exportService`. |

### 5. Utilities (`src/lib/utils/calendarUtils.ts`)
Pure functions for logic isolation.

| Function | Description |
| :--- | :--- |
| **`isShiftConflict(newShift, existingShifts)`** | Returns `true` if a proposed shift overlaps with existing shifts for the same staff member. Treats invalid dates as conflicts. |
| **`getNextColor(index)`** | Returns a hex code from a predefined palette or generates an HSL color for new staff. |

### 6. Export Service (`src/lib/services/exportService.ts`)

| Function | Description |
| :--- | :--- |
| **`downloadCalendarSnapshot`** | Finds the `.fc` (FullCalendar) DOM element, converts it to a canvas, and triggers a PNG download. |
