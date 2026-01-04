'use client';

import React, { useEffect, useState } from 'react';
import { getElementPosition } from '@/lib/utils/tutorialHelpers';

interface TutorialOverlayProps {
    targetSelector: string;
    isActive: boolean;
    onBackdropClick?: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
    targetSelector,
    isActive,
    onBackdropClick,
}) => {
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!isActive || !targetSelector) {
            setHighlightRect(null);
            return;
        }

        const updateHighlight = () => {
            const rect = getElementPosition(targetSelector);
            setHighlightRect(rect);
        };

        // Initial update
        updateHighlight();

        // Update on resize and scroll
        window.addEventListener('resize', updateHighlight);
        window.addEventListener('scroll', updateHighlight, true);

        // Use MutationObserver to detect DOM changes
        const observer = new MutationObserver(updateHighlight);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
        });

        return () => {
            window.removeEventListener('resize', updateHighlight);
            window.removeEventListener('scroll', updateHighlight, true);
            observer.disconnect();
        };
    }, [targetSelector, isActive]);

    if (!isActive) return null;

    const padding = 8; // Padding around highlighted element

    return (
        <div
            className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-300"
            style={{ opacity: isActive ? 1 : 0 }}
        >
            {/* Backdrop with cutout */}
            <svg
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: onBackdropClick ? 'auto' : 'none' }}
                onClick={onBackdropClick}
            >
                <defs>
                    <mask id="tutorial-mask">
                        {/* White background (visible) */}
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />

                        {/* Black cutout (transparent) for highlighted element */}
                        {highlightRect && (
                            <rect
                                x={highlightRect.left - padding}
                                y={highlightRect.top - padding}
                                width={highlightRect.width + padding * 2}
                                height={highlightRect.height + padding * 2}
                                rx="8"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>

                {/* Semi-transparent backdrop */}
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0, 0, 0, 0.7)"
                    mask="url(#tutorial-mask)"
                />
            </svg>

            {/* Highlight border with pulse animation */}
            {highlightRect && (
                <div
                    className="absolute border-4 border-blue-500 rounded-lg animate-pulse-border pointer-events-none"
                    style={{
                        left: `${highlightRect.left - padding}px`,
                        top: `${highlightRect.top - padding}px`,
                        width: `${highlightRect.width + padding * 2}px`,
                        height: `${highlightRect.height + padding * 2}px`,
                        boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.3s ease-out',
                    }}
                />
            )}

            <style jsx>{`
        @keyframes pulse-border {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};
