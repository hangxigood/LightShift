'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

export const TutorialWelcome: React.FC = () => {
    const { showWelcome, startTutorial, skipTutorial, loadSampleData } = useStore();
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    if (!showWelcome) return null;

    const handleStart = () => {
        loadSampleData();
        startTutorial();
    };

    const handleSkip = () => {
        skipTutorial();
    };

    // Mobile version - suggest using desktop
    if (isMobile) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-slideUp">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                            Welcome to LightShift! 🌌
                        </h1>
                        <p className="text-lg text-gray-600 mb-4">
                            Your staff scheduling tool
                        </p>
                    </div>

                    {/* Mobile Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💻</span>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Tutorial Best on Desktop</h3>
                                <p className="text-sm text-gray-600">
                                    For the best tutorial experience, we recommend using a desktop or tablet device.
                                    You can still use LightShift on mobile - just skip the tutorial for now!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleSkip}
                        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        Get Started
                    </button>
                </div>

                <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
            </div>
        );
    }

    // Desktop version - full tutorial
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 animate-slideUp">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Welcome to LightShift! 🌌
                    </h1>
                    <p className="text-lg text-gray-600">
                        Let's take a quick tour of your new staff scheduling tool
                    </p>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <span className="text-2xl">⚡</span>
                        <div>
                            <h3 className="font-semibold text-gray-900">Quick Shift Creation</h3>
                            <p className="text-sm text-gray-600">Click and drag to create shifts instantly</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                        <span className="text-2xl">👥</span>
                        <div>
                            <h3 className="font-semibold text-gray-900">Auto Staff Management</h3>
                            <p className="text-sm text-gray-600">Staff members created automatically</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                        <span className="text-2xl">🎨</span>
                        <div>
                            <h3 className="font-semibold text-gray-900">Visual Color Coding</h3>
                            <p className="text-sm text-gray-600">Each staff gets a unique color</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                        <span className="text-2xl">📤</span>
                        <div>
                            <h3 className="font-semibold text-gray-900">Easy Export & Sharing</h3>
                            <p className="text-sm text-gray-600">Share schedules as images</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleStart}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        Start Tutorial
                    </button>
                    <button
                        onClick={handleSkip}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Skip for Now
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
        </div>
    );
};
