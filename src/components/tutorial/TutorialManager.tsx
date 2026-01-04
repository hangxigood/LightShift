'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { getTutorialStep, getTotalSteps } from '@/lib/config/tutorialSteps';
import { TutorialWelcome } from './TutorialWelcome';
import { TutorialOverlay } from './TutorialOverlay';
import { TutorialTooltip } from './TutorialTooltip';
import { TutorialButton } from './TutorialButton';
import { scrollToElement } from '@/lib/utils/tutorialHelpers';

export const TutorialManager: React.FC = () => {
    const {
        tutorialActive,
        tutorialStep,
        showWelcome,
        nextTutorialStep,
        previousTutorialStep,
        skipTutorial,
        completeTutorial,
    } = useStore();

    const currentStep = getTutorialStep(tutorialStep);
    const totalSteps = getTotalSteps();

    // Scroll to highlighted element when step changes
    useEffect(() => {
        if (tutorialActive && currentStep?.targetSelector) {
            // Small delay to ensure element is rendered
            setTimeout(() => {
                scrollToElement(currentStep.targetSelector);
            }, 100);
        }
    }, [tutorialActive, tutorialStep, currentStep]);

    // Handle completion modal
    useEffect(() => {
        if (currentStep?.id === 'completion') {
            // Show completion dialog
            const keepData = window.confirm(
                '🎉 Congratulations! You\'ve completed the tutorial!\n\n' +
                'Would you like to keep the sample data to continue practicing?\n\n' +
                'Click OK to keep the data, or Cancel to clear it.'
            );

            if (!keepData) {
                useStore.getState().clearSampleData();
            }

            completeTutorial();
        }
    }, [currentStep, completeTutorial]);

    if (!currentStep) return null;

    return (
        <>
            {/* Welcome Modal */}
            <TutorialWelcome />

            {/* Tutorial Overlay and Tooltip (only when tutorial is active) */}
            {tutorialActive && (
                <>
                    <TutorialOverlay
                        targetSelector={currentStep.targetSelector}
                        isActive={tutorialActive}
                    />

                    <TutorialTooltip
                        step={currentStep}
                        currentStepIndex={tutorialStep}
                        totalSteps={totalSteps}
                        onNext={nextTutorialStep}
                        onPrevious={previousTutorialStep}
                        onSkip={skipTutorial}
                    />
                </>
            )}

            {/* Help Button (always visible when not in tutorial) */}
            <TutorialButton />
        </>
    );
};
