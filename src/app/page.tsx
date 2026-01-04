'use client';

import { CalendarWrapper } from '@/components/CalendarWrapper';
import { StaffSidebar } from '@/components/StaffSidebar';
import { TutorialManager } from '@/components/tutorial/TutorialManager';
import { useStore } from '@/store/useStore';
import { isFirstTimeUser } from '@/lib/utils/tutorialHelpers';
import { useEffect } from 'react';

export default function Home() {
  const { clearAllSelections, setShowWelcome, tutorialCompleted } = useStore();

  // Check for first-time user on mount
  useEffect(() => {
    if (isFirstTimeUser() && !tutorialCompleted) {
      setShowWelcome(true);
    }
  }, [setShowWelcome, tutorialCompleted]);

  const handleGlobalClick = (e: React.MouseEvent) => {
    // If the user clicks directly on the main flex container or padded areas
    // that are not part of specific interactive components, clear everything.
    if (e.target === e.currentTarget) {
      clearAllSelections();
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50 cursor-default"
      onClick={handleGlobalClick}
    >
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <StaffSidebar />
      </div>

      {/* Main Calendar Area */}
      <div
        className="flex-1 p-6 overflow-auto"
        onClick={handleGlobalClick}
      >
        <CalendarWrapper />
      </div>

      {/* Tutorial System */}
      <TutorialManager />
    </div>
  );
}
