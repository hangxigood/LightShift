import { toBlob, toPng } from 'html-to-image';

const getCalendarBlob = async (): Promise<Blob | null> => {
    const calendarElement = document.getElementById('calendar-root');

    if (!calendarElement) {
        console.error('Calendar element not found');
        return null;
    }

    try {
        // html-to-image is much better with Tailwind 4's oklab/oklch colors
        const blob = await toBlob(calendarElement, {
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            cacheBust: true,
            style: {
                // Ensure visibility during capture if needed
                visibility: 'visible',
            }
        });

        return blob;
    } catch (error) {
        console.error('Error generating snapshot:', error);
        return null;
    }
};

export const downloadCalendarSnapshot = async (): Promise<void> => {
    const blob = await getCalendarBlob();
    if (!blob) {
        alert('Failed to generate calendar image');
        return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schedule-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const shareCalendarSnapshot = async (): Promise<void> => {
    const blob = await getCalendarBlob();
    if (!blob) {
        alert('Failed to generate calendar image');
        return;
    }

    const file = new File([blob], `schedule-${new Date().toISOString().split('T')[0]}.png`, {
        type: 'image/png',
    });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                files: [file],
                title: 'Staff Schedule',
                text: 'Here is the staff schedule.',
            });
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Error sharing:', error);
                alert('Failed to share schedule');
            }
        }
    } else {
        alert('Sharing is not supported on this browser. Try downloading instead.');
    }
};

export const copyCalendarToClipboard = async (): Promise<boolean> => {
    const blob = await getCalendarBlob();
    if (!blob) {
        alert('Failed to generate calendar image');
        return false;
    }

    try {
        await navigator.clipboard.write([
            new ClipboardItem({
                'image/png': blob,
            }),
        ]);
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Failed to copy image to clipboard');
        return false;
    }
};
