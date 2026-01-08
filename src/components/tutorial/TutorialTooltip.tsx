'use client';

import React, { useEffect, useState } from 'react';
import { TutorialStep } from '@/types/tutorial';
import { getElementPosition } from '@/lib/utils/tutorialHelpers';

interface TutorialTooltipProps {
    step: TutorialStep;
    currentStepIndex: number;
    totalSteps: number;
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
    step,
    currentStepIndex,
    totalSteps,
    onNext,
    onPrevious,
    onSkip,
}) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right' | 'center'>('center');

    useEffect(() => {
        if (step.position === 'center' || !step.targetSelector) {
            // Center the tooltip
            setTooltipPosition('center');
            return;
        }

        const updatePosition = () => {
            const targetRect = getElementPosition(step.targetSelector);
            if (!targetRect) return;

            const tooltipWidth = 400;
            const tooltipHeight = 250;
            const padding = 20;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            let top = 0;
            let left = 0;
            let finalPosition = step.position;

            // Calculate position based on preferred placement
            switch (step.position) {
                case 'top':
                    top = targetRect.top - tooltipHeight - padding;
                    left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

                    // Check if tooltip fits above
                    if (top < 0) {
                        finalPosition = 'bottom';
                        top = targetRect.bottom + padding;
                    }
                    break;

                case 'bottom':
                    top = targetRect.bottom + padding;
                    left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

                    // Check if tooltip fits below
                    if (top + tooltipHeight > windowHeight) {
                        finalPosition = 'top';
                        top = targetRect.top - tooltipHeight - padding;
                    }
                    break;

                case 'left':
                    top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                    left = targetRect.left - tooltipWidth - padding;

                    // Check if tooltip fits on left
                    if (left < 0) {
                        finalPosition = 'right';
                        left = targetRect.right + padding;
                    }
                    break;

                case 'right':
                    top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
                    left = targetRect.right + padding;

                    // Check if tooltip fits on right
                    if (left + tooltipWidth > windowWidth) {
                        finalPosition = 'left';
                        left = targetRect.left - tooltipWidth - padding;
                    }
                    break;
            }

            // Ensure tooltip stays within viewport horizontally
            if (left < padding) left = padding;
            if (left + tooltipWidth > windowWidth - padding) {
                left = windowWidth - tooltipWidth - padding;
            }

            // Ensure tooltip stays within viewport vertically
            if (top < padding) top = padding;
            if (top + tooltipHeight > windowHeight - padding) {
                top = windowHeight - tooltipHeight - padding;
            }

            setPosition({ top, left });
            setTooltipPosition(finalPosition);
        };

        updatePosition();

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [step.targetSelector, step.position]);

    const isCenter = tooltipPosition === 'center';

    return (
        <div
            className={`fixed z-50 bg-white rounded-xl shadow-2xl border-2 border-blue-500 transition-all duration-300 ${isCenter ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
                }`}
            style={
                isCenter
                    ? { maxWidth: '500px', width: '90%' }
                    : {
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        maxWidth: '400px',
                        width: 'auto',
                    }
            }
        >
            {/* Arrow indicator (only for non-center positions) */}
            {!isCenter && (
                <div
                    className={`absolute w-4 h-4 bg-white border-blue-500 transform rotate-45 ${tooltipPosition === 'top'
                        ? 'bottom-[-10px] left-1/2 -translate-x-1/2 border-b-2 border-r-2'
                        : tooltipPosition === 'bottom'
                            ? 'top-[-10px] left-1/2 -translate-x-1/2 border-t-2 border-l-2'
                            : tooltipPosition === 'left'
                                ? 'right-[-10px] top-1/2 -translate-y-1/2 border-t-2 border-r-2'
                                : 'left-[-10px] top-1/2 -translate-y-1/2 border-b-2 border-l-2'
                        }`}
                />
            )}

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            Step {currentStepIndex + 1} of {totalSteps}
                        </span>
                    </div>
                    {step.skipable && (
                        <button
                            onClick={onSkip}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Skip Tutorial
                        </button>
                    )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentStepIndex
                                ? 'w-8 bg-blue-600'
                                : index < currentStepIndex
                                    ? 'w-2 bg-blue-400'
                                    : 'w-2 bg-gray-300'
                                }`}
                        />
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onPrevious}
                        disabled={currentStepIndex === 0}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentStepIndex === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={onNext}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};
