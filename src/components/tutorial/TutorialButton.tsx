'use client';

import React from 'react';
import { useStore } from '@/store/useStore';

export const TutorialButton: React.FC = () => {
    const { tutorialActive, tutorialCompleted, resetTutorial } = useStore();

    // Don't show button during active tutorial
    if (tutorialActive) return null;

    const handleClick = () => {
        resetTutorial();
    };

    return (
        <button
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            title="Start Tutorial"
            aria-label="Start Tutorial"
        >
            {/* Question Mark Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>

            {/* Tooltip on hover */}
            <span className="absolute bottom-full mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tutorialCompleted ? 'Restart Tutorial' : 'Start Tutorial'}
            </span>

            {/* Pulse animation for first-time users */}
            {!tutorialCompleted && (
                <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75" />
            )}
        </button>
    );
};
