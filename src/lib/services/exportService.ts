import html2canvas from 'html2canvas';

export const downloadCalendarSnapshot = async (): Promise<void> => {
    const calendarElement = document.getElementById('calendar-root');

    if (!calendarElement) {
        console.error('Calendar element not found');
        return;
    }

    try {
        const canvas = await html2canvas(calendarElement, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
        });

        // Convert to blob and download
        canvas.toBlob((blob) => {
            if (!blob) return;

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `schedule-${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    } catch (error) {
        console.error('Error generating snapshot:', error);
        alert('Failed to generate calendar image');
    }
};
