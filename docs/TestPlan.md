# Test Plan: LightShift

This document defines the testing strategy to ensure the reliability of LightShift's "Local Logic" and "UI Interactions".

## 1. Testing Strategy Overview

We will employ a three-tier testing strategy:

| Level | Tooling | Focus |
| :--- | :--- | :--- |
| **Unit** | **Jest** | Pure logic functions (Conflict detection, Color algorithms). |
| **Integration** | **Jest + React Testing Library** | Store logic, Component interactions, and LocalStorage persistence. |
| **E2E** | **Playwright** | Critical user flows, Drag-and-drop mechanics, and Export functionality. |

## 2. Unit Testing Strategy

**Target:** `src/lib/utils/calendarUtils.ts`

### 2.1 Conflict Detection (`isShiftConflict`)
Verify the "Strict Blocking" logic (defined in PRD 3.2).

- [ ] **Exact Match:** New shift starts and ends at the exact same time as an existing one -> `true`.
- [ ] **Partial Overlap (Start):** New shift starts before existing ends -> `true`.
- [ ] **Partial Overlap (End):** New shift ends after existing starts -> `true`.
- [ ] **Enclosure:** New shift completely covers an existing shift -> `true`.
- [ ] **Inside:** New shift is completely inside an existing shift -> `true`.
- [ ] **Touching (Boundary):** New shift ends exactly when existing starts -> `false` (Allowed).
- [ ] **Different Staff:** Overlap with a DIFFERENT staff member -> `false` (Allowed).
- [ ] **Multi-Day Shifts:** New shift spans midnight (10 PM to 6 AM) -> Properly detects conflicts across date boundaries.

### 2.2 Color Generation (`getNextColor`)
- [ ] **Palette Rotation:** Ensure the first N staff get distinct palette colors.
- [ ] **Fallback:** Ensure the N+1 staff gets a generated HSL string.
- [ ] **Color Uniqueness:** When palette is exhausted, generated colors are visually distinct.

## 3. Integration Testing Strategy

**Target:** `src/store/useStore.ts` & Core Components

### 3.1 Store Logic
- [ ] **Add Staff:** Adds to state array with auto-generated color.
- [ ] **Update Staff (Rename):** Renaming a staff member updates all associated shifts.
- [ ] **Update Staff (Color):** Changing staff color updates all shift visual representations.
- [ ] **Delete Staff (Cascade):** Removes staff AND removes all their shifts.
- [ ] **Delete Staff (Count):** Returns the count of shifts that will be deleted.
- [ ] **Staff Selection:** Setting `selectedStaffId` correctly filters/highlights shifts in the view.
- [ ] **Persistence:**
    - Mock `localStorage`.
    - Action: Add Shift.
    - Assert: `localStorage.getItem` contains the new shift.
    - Action: Clear localStorage and reload.
    - Assert: Store is empty.

### 3.2 Component Interactions
- [ ] **Staff Sidebar - Delete:** Clicking "Delete" shows confirmation dialog with shift count.
- [ ] **Staff Sidebar - Edit:** Inline editing updates staff name in store.
- [ ] **Validation (Zod):** Reject invalid inputs (e.g., end time before start time, empty staff name).
- [ ] **Validation (Business Logic):** Reject shifts that conflict with existing ones for the same staff.

## 4. E2E Testing Strategy (Playwright)

**Target:** Critical User Flows in a real browser environment (Chromium/Webkit).

### 4.1 Flow 1: First Run Experience
1.  **Navigate** to `/`.
2.  **Assert** Calendar and Sidebar are visible.
3.  **Action:** Click a time slot.
4.  **Action:** Enter Staff Name "Alice".
5.  **Assert:** "Alice" appears in Sidebar.
6.  **Assert:** A blue shift block appears on the calendar.

### 4.2 Flow 2: Conflict Blocking (Drag & Drop)
1.  **Setup:** Create "Alice" with a shift at 9 AM - 10 AM.
2.  **Action:** Attempt to drag a new shift (or resize existing) to cover 9:30 AM.
3.  **Assert:** The drop is rejected (Event snaps back to original or doesn't appear).

### 4.3 Flow 3: Persistence Reload
1.  **Action:** Create Staff "Bob" and one shift.
2.  **Action:** Reload the page (`page.reload()`).
3.  **Assert:** "Bob" and his shift still exist on the screen.

### 4.4 Flow 4: Export (Visual Validation)
1.  **Action:** Click "Export Image".
2.  **Assert:** Verify the download event triggers.
3.  *(Optional)*: Use Visual Regression to check the calendar didn't look broken before export.

### 4.5 Flow 5: Multi-Day Shifts
1.  **Action:** Create a shift from 10 PM today to 6 AM tomorrow for "Charlie".
2.  **Assert:** The shift block spans across the midnight boundary visually.
3.  **Action:** Attempt to create another shift for "Charlie" at 11 PM today.
4.  **Assert:** Conflict is detected and shift is rejected.

### 4.6 Flow 6: Staff Management (Edit)
1.  **Setup:** Create "Dana" with a shift.
2.  **Action:** Click "Dana" in sidebar to edit name.
3.  **Action:** Change name to "Dana Smith".
4.  **Assert:** The shift label updates to "Dana Smith" on the calendar.
5.  **Action:** Change Dana's color from blue to red.
6.  **Assert:** The shift block changes color to red.

### 4.7 Flow 7: Staff Deletion with Confirmation
1.  **Setup:** Create "Eve" with 3 shifts.
2.  **Action:** Click "Delete" on Eve in the sidebar.
3.  **Assert:** Confirmation dialog appears showing "3 shifts will be removed".
4.  **Action:** Confirm deletion.
5.  **Assert:** Eve and all 3 shifts disappear from the UI.

### 4.8 Flow 8: Staff Selection & Highlighting (Phase 2)
1.  **Setup:** Create "Frank" and "Grace" each with 2 shifts.
2.  **Action:** Click "Frank" in the sidebar.
3.  **Assert:** Frank's shifts are highlighted (bright), Grace's shifts are dimmed.
4.  **Action:** Click again to deselect.
5.  **Assert:** All shifts return to normal brightness.

### 4.9 Flow 9: Auto-Staff Creation
1.  **Action:** Click a time slot and enter a NEW name "Henry".
2.  **Assert:** "Henry" is automatically added to the sidebar.
3.  **Assert:** Henry is assigned a unique color.
4.  **Action:** Create another shift for "Henry" (existing).
5.  **Assert:** No duplicate "Henry" appears in the sidebar.

### 4.10 Flow 10: Time Granularity
1.  **Action:** Create a shift using the grid (defaults to 15-min slots).
2.  **Assert:** Shift snaps to 15-minute boundaries (e.g., 9:00, 9:15, 9:30).
3.  **Action:** Manually type a shift time as "9:17 AM - 3:42 PM".
4.  **Assert:** Shift is created with minute-level precision.

## 5. Performance Testing Strategy

**Target:** Non-Functional Requirements (PRD Section 5)

### 5.1 Shift Creation Speed
- [ ] **Benchmark:** Measure time from click to shift appearing on screen.
- [ ] **Target:** < 200ms (PRD Requirement).
- [ ] **Tool:** Playwright's performance APIs or Chrome DevTools.

### 5.2 Page Load Speed
- [ ] **Benchmark:** Measure time to interactive (TTI) on 4G network throttling.
- [ ] **Target:** < 1 second (PRD Requirement).
- [ ] **Tool:** Lighthouse CI in Playwright.

### 5.3 Offline Capability
- [ ] **Test:** Disconnect network after initial load.
- [ ] **Action:** Create shifts, edit staff, export image.
- [ ] **Assert:** All features work without network.

