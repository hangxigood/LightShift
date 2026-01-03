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
- **Name Suggestions:** During shift creation, as the user begins typing, the system offers a dropdown of existing staff names for quick selection. To maintain a clean UI, suggestions are only shown once the user has started typing (not on empty input).
- **Drag & Drop:** Users can move shifts to different days or times instantly.
- **Visual Coding:** Each staff member is assigned a unique color automatically upon creation.

### 3.2 Scheduling Logic & Rules
- **Time Zone Strategy:** **Local Time** only. All times are stored and displayed based on the user's browser time. No time zone conversion is performed for shared exports (images).
- **Conflict Resolution:** **Strict Blocking**.
    - If a user attempts to drop or create a shift that overlaps with an existing shift for the *same staff member*, the action is rejected.
    - **Overlapping for different staff members is permitted** (e.g., Alice and Bob can both work from 9 AM to 12 PM).
    - The UI should provide visual feedback (e.g., snap back or red error outline) indicating the slot is occupied for that specific staff member.
- **Multi-Day Shifts:** Allowed. Shifts can span across midnight (e.g., 10 PM to 6 AM).
- **Granularity:** Shifts default to 15-minute increments but allow minute-level precision if typed manually.

### 3.3 Staff Management
- **Creation:** Automatic via shift entry (typing a new name).
- **Editing:** Users can rename staff or manually change their assigned color.
    - Renaming updates all historical and future shifts for that staff member.
- **Deletion:** Users can delete a staff member.
    - **Action:** Deleting a staff member removes them from the "Known Staff" list AND removes all their associated shifts from the calendar.
    - **Confirmation:** A confirmation dialog is required before deletion and shows how many shifts will be removed.
    - **Visual Feedback:** When a user hovers over the delete option or opens the deletion confirmation, all shifts assigned to that staff member should be highlighted (e.g., with a pulsing effect or distinct border) to visually confirm what will be lost.

### 3.4 Data Persistence (No Login)
- **Local-First:** All data is saved to the browser's local storage.
- **Session Continuity:** Users can close the tab and return later; their data remains as long as they don't clear their browser cache.

### 3.5 Export & Sharing (The "Output" Module)
- **Snapshot Mode:** One-click button to download the current calendar view.
- **Format:** High-Resolution PNG.
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
6. **Distribute:** User clicks "Download Image" to send to the group chat.

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
    - **Staff Selection & Highlighting:** Selecting a staff member in the sidebar highlights their shifts on the calendar (e.g., by dimming others or adding a visual focus) to help manage individual workloads.

### Phase 3: Premium Features (Income Generation)
- **Goal:** Monetization via advanced integrations.
- **Features:**
    - **Google Sync:**
        - Automated creation of a dedicated "Shift Calendar".
        - Generation of a public "Share Link" for staff.