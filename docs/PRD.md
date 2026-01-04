# PRD: LightShift – Minimalist Staff Scheduler

## 1. Project Overview
**LightShift** is a web-based utility for managers to quickly plan staff shifts on a calendar without creating an account. It focuses on speed, "zero-config" staff management, and easy distribution via visual exports.

## 2. Target Users
- **Small business owners:** Cafes, retail, small clinics.
- **Project leads:** Managing temporary volunteer shifts.
- **Excel Refugees:** Anyone who finds Excel too clunky for visual scheduling.

## 3. Key Functional Requirements

### 3.1 Smart Calendar Interface
- **Grid View:** Daily, Weekly, and Monthly views provided by a calendar interface.
- **Auto-Staff Creation:** When adding a shift, the user types a name. If the name doesn't exist in the "known staff" list, the system automatically creates a new staff profile.
- **Name Suggestions:** During shift creation, as the user begins typing, the system offers a dropdown of existing staff names for quick selection.
- **Drag & Drop:** Users can move shifts to different days or times instantly.
- **Visual Coding:** Each staff member is assigned a unique color automatically upon creation.
- **Shift Details:** Each shift block on the calendar must explicitly display the **Staff Name**, the **Time Range**, and the total **Calculated Duration**.
    - **Responsive Adaptive Display:** When shifts overlap or the calendar view narrows, the UI must adapt the displayed content:
        - **Full Width:** Show full names, localized time ranges (e.g., 9:00 AM - 5:00 PM), and duration badges.
        - **Medium Width:** Show abbreviated time ranges (e.g., 9A-5P).
        - **Narrow Width:** Show only the calculated duration or hide text.
    - **Hover Details:** Regardless of the display width, hovering over any shift block must show a tooltip with the complete **Staff Name**, **Full Time Range**, and **Total Duration**.
- **Task Selection & Deletion:**
    - **Single Task Selection:** Users can click on any shift block to select it. The selected shift should have a distinct visual indicator (e.g., highlighted border, elevated shadow, or selection outline).
    - **Keyboard Deletion:** When a task is selected, users can press the **Delete** or **Backspace** key to remove it.
    - **Double-Click Deletion:** Users can double-click on any shift block to delete it directly. A confirmation dialog will appear to prevent accidental deletions.
    - **Deselection:** Clicking elsewhere on the calendar or pressing **Escape** should deselect the current task.
- **Selection Behavior (Mutual Exclusivity):**
    - **Task Selection vs. Staff Filtering:** These two selection modes are mutually exclusive:
        - Selecting a **task** (shift block) automatically deselects any active **staff filter**.
        - Selecting a **staff member** (for filtering) automatically deselects any selected **task**.
    - **Rationale:** This prevents confusion and ensures a clear, single focus mode at any given time.

### 3.2 Scheduling Logic & Rules
- **Time Zone Strategy:** **Local Time** only. All times are stored and displayed based on the user's browser time. No time zone conversion is performed for shared exports (images).
- **Conflict Resolution:** **Strict Blocking**.
    - If a user attempts to drop or create a shift that overlaps with an existing shift for the *same staff member*, the action is rejected.
    - **Overlapping for different staff members is permitted** (e.g., Alice and Bob can both work from 9 AM to 12 PM).
    - The UI should provide visual feedback (e.g., snap back or red error outline) indicating the slot is occupied for that specific staff member.
- **Multi-Day Shifts:** Allowed. Shifts can span across midnight (e.g., 10 PM to 6 AM).
- **Granularity:** Shifts default to 30-minute increments

### 3.3 Staff Management
- **Creation:** Automatic via shift entry (typing a new name) or manual creation.
- **Editing:** Users can rename staff.
    - Renaming updates all historical and future shifts for that staff member.
- **Staff Filtering & Focus:**
    - **Selection:** Users can click on a staff member in the staff sidebar to filter and view only that staff member's tasks.
    - **Visual Indication:** When a staff member is selected:
        - Only their shifts are displayed on the calendar (all other shifts are hidden).
        - The selected staff member in the sidebar should have a distinct visual state (e.g., highlighted background, checkmark, or active state).
    - **Deselection:** Clicking the same staff member again or clicking a "Show All" button should deselect the filter and display all shifts for all staff members.
    - **Use Case:** This feature helps managers focus on individual workloads, identify scheduling gaps, and manage specific staff member schedules without visual clutter.
- **Deletion:** Users can delete a staff member.
    - **Action:** Deleting a staff member removes them from the "Known Staff" list AND removes all their associated shifts from the calendar.
    - **Confirmation:** A confirmation dialog is required before deletion and shows how many shifts will be removed.
    - **Visual Feedback:** When a user opens the deletion confirmation, all shifts assigned to that staff member should be highlighted (e.g., with a pulsing effect or distinct border) to visually confirm what will be lost.

### 3.4 Data Persistence (No Login)
- **Local-First:** All data is saved to the browser's local storage.
- **Session Continuity:** Users can close the tab and return later; their data remains as long as they don't clear their browser cache.

### 3.5 Export & Sharing (The "Output" Module)
- **Snapshot Mode:** One-click accessibility to distribution tools, located at the bottom of the staff management sidebar for constant availability.
- **Format:** High-Resolution PNG.
- **Distribution Options:**
    - **Physical Download:** Save as a file to the device.
    - **Native Share:** Integrated with the browser's native share sheet (Web Share API) for direct sending to messaging apps (Slack, WhatsApp, etc.).
    - **Copy to Clipboard:** One-tap to copy the generated image for instant pasting into chats or documents.
- **Quality:** Targeted for digital sharing (messaging apps/email) but legible if printed on standard letter paper.

## 4. User Flow
1. **Land:** User opens the website (blank calendar).
2. **Create:** User clicks a time slot (e.g., Monday 9 AM).
3. **Input:** A small popup asks for "Staff Name."
4. **Processing:**
   - User types "John".
   - System checks: Is "John" in the list?
   - **No** -> Create "John" + Assign color **Blue** -> Create Shift.
5. **Conflict Check:**
   - User tries to drag "John" to a slot where "John" is already working.
   - **System:** Rejects the drop, shift snaps back to original position.
6. **Distribute:** User clicks "Share" or "Download" to send the visual schedule to the group chat or team.

## 5. Non-Functional Requirements
- **Performance:**
    - "Instant" Shift Creation (< 200ms).
    - Application load time under 1 second on 4G networks.
- **Reliability:**
    - Offline Capable: The app must function fully without an internet connection after initial load.
- **Constraints:**
    - **Browser Only:** Data stays on the device. Clearing cache wipes data.
    - **Single User:** Designed for a single scheduler on a single device. No real-time collaboration.

## 6. Product Roadmap (Phased)

### Phase 1: The "Local Canvas" (MVP)
- **Goal:** Core scheduling functionality with local saving.
- **Features:**
    - Interactive calendar grid (FullCalendar).
    - Auto-creation of staff identities.
    - Drag-and-drop shift management with conflict blocking.

### Phase 2: The "Visual Export" & Focus
- **Goal:** Enable easy sharing and better management of the schedule.
- **Features:**
    - High-resolution image capture of the calendar.
    - Staff Management sidebar (Edit/Delete staff).
    - **Staff Filtering:** Selecting a staff member in the sidebar filters the calendar to show only that staff member's tasks, enabling focused workload management.
    - **Task Selection & Deletion:** Users can select individual shifts and delete them using either keyboard shortcuts (Delete/Backspace keys) or by double-clicking on the shift for faster task management.

### Phase 3: Premium Features (Income Generation)
- **Goal:** Monetization via advanced integrations.
- **Features:**
    - **Google Sync:**
        - Automated creation of a dedicated "Shift Calendar".
        - Generation of a public "Share Link" for staff.