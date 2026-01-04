'use client';

import { CalendarWrapper } from '@/components/CalendarWrapper';
import { StaffSidebar } from '@/components/StaffSidebar';
import { TutorialManager } from '@/components/tutorial/TutorialManager';
import { useStore } from '@/store/useStore';
import { isFirstTimeUser } from '@/lib/utils/tutorialHelpers';
import { useEffect } from 'react';

export default function Home() {
  const { clearAllSelections, setShowWelcome, tutorialCompleted, sidebarOpen, toggleSidebar, setSidebarOpen } = useStore();

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

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50 cursor-default relative"
      onClick={handleGlobalClick}
    >
      {/* Mobile Hamburger Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {sidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative
          inset-y-0 left-0
          w-80 flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
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
