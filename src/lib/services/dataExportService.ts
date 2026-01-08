import * as XLSX from 'xlsx';
import type { Staff, Shift } from '@/types';

interface ExportRow {
    'Staff Name': string;
    'Staff Color': string;
    'Start Date': string;
    'Start Time': string;
    'End Date': string;
    'End Time': string;
    'Notes': string;
}

interface ImportResult {
    staff: Array<{ name: string; color: string }>;
    shifts: Array<{ staffName: string; start: string; end: string; notes?: string }>;
}

/**
 * Format a date string to human-readable date (e.g., "2024-01-08")
 */
function formatDate(isoString: string): string {
    const date = new Date(isoString);
    // Use local date parts to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format a date string to human-readable time (e.g., "09:00 AM")
 */
function formatTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Convert Excel date serial number to Date object
 * Excel dates are stored as days since December 30, 1899
 */
function excelDateToDate(excelDate: number): Date {
    // Excel epoch is December 30, 1899 (accounting for the 1900 leap year bug)
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    return new Date(excelEpoch.getTime() + excelDate * msPerDay);
}

/**
 * Parse a date value that could be a string or Excel serial number
 */
function parseDateValue(value: string | number): string {
    if (typeof value === 'number') {
        // Excel date serial number
        const date = excelDateToDate(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    // String date - return as-is
    return String(value).trim();
}

/**
 * Parse a time value that could be a string or Excel time fraction
 */
function parseTimeValue(value: string | number): string {
    if (typeof value === 'number') {
        // Excel stores time as a fraction of a day (0.5 = 12:00 PM)
        const totalMinutes = Math.round(value * 24 * 60);
        let hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        if (hours > 12) hours -= 12;
        if (hours === 0) hours = 12;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
    }
    // String time - return as-is
    return String(value).trim();
}

/**
 * Parse date and time strings back to ISO format (in local timezone)
 */
function parseDateTime(dateStr: string, timeStr: string): string {
    // Handle various time formats
    const cleanTime = timeStr.trim().toUpperCase();
    const match = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);

    if (!match) {
        throw new Error(`Invalid time format: ${timeStr}`);
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3];

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    // Parse date components to avoid timezone issues
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) {
        throw new Error(`Invalid date format: ${dateStr}`);
    }

    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateParts[2], 10);

    // Create date in local timezone
    const date = new Date(year, month, day, hours, minutes, 0, 0);

    return date.toISOString();
}

/**
 * Export staff and shifts data to an Excel file
 */
export function exportToExcel(staff: Staff[], shifts: Shift[]): void {
    // Create staff lookup map
    const staffMap = new Map(staff.map(s => [s.id, s]));

    // Transform shifts to export format
    const rows: ExportRow[] = shifts.map(shift => {
        const staffMember = staffMap.get(shift.staffId);
        return {
            'Staff Name': staffMember?.name || 'Unknown',
            'Staff Color': staffMember?.color || '#808080',
            'Start Date': formatDate(shift.start),
            'Start Time': formatTime(shift.start),
            'End Date': formatDate(shift.end),
            'End Time': formatTime(shift.end),
            'Notes': shift.notes || '',
        };
    });

    // Sort by date and time
    rows.sort((a, b) => {
        const dateCompare = a['Start Date'].localeCompare(b['Start Date']);
        if (dateCompare !== 0) return dateCompare;
        return a['Start Time'].localeCompare(b['Start Time']);
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shifts');

    // Auto-size columns
    const colWidths = [
        { wch: 20 }, // Staff Name
        { wch: 12 }, // Staff Color
        { wch: 12 }, // Start Date
        { wch: 10 }, // Start Time
        { wch: 12 }, // End Date
        { wch: 10 }, // End Time
        { wch: 30 }, // Notes
    ];
    worksheet['!cols'] = colWidths;

    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `lightshift-schedule-${dateStr}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
}

/**
 * Parse an Excel file and return staff/shifts data
 */
export async function parseExcelImport(file: File): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });

                // Get the first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON - use raw option to get actual cell values
                const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(worksheet, { raw: true });

                // Extract unique staff members
                const staffSet = new Map<string, string>();
                const shifts: ImportResult['shifts'] = [];

                for (const row of rows) {
                    const staffNameRaw = row['Staff Name'];
                    const staffName = typeof staffNameRaw === 'string' ? staffNameRaw.trim() : String(staffNameRaw || '');
                    const staffColorRaw = row['Staff Color'];
                    const staffColor = typeof staffColorRaw === 'string' ? staffColorRaw.trim() : '#808080';

                    if (!staffName) continue;

                    // Track unique staff
                    if (!staffSet.has(staffName)) {
                        staffSet.set(staffName, staffColor);
                    }

                    // Parse shift data - handle both string and Excel serial number formats
                    const startDateRaw = row['Start Date'];
                    const startTimeRaw = row['Start Time'];
                    const endDateRaw = row['End Date'];
                    const endTimeRaw = row['End Time'];

                    if (startDateRaw === undefined || startTimeRaw === undefined ||
                        endDateRaw === undefined || endTimeRaw === undefined) continue;

                    try {
                        const startDate = parseDateValue(startDateRaw);
                        const startTime = parseTimeValue(startTimeRaw);
                        const endDate = parseDateValue(endDateRaw);
                        const endTime = parseTimeValue(endTimeRaw);

                        shifts.push({
                            staffName,
                            start: parseDateTime(startDate, startTime),
                            end: parseDateTime(endDate, endTime),
                            notes: typeof row['Notes'] === 'string' ? row['Notes'].trim() : undefined,
                        });
                    } catch (err) {
                        console.warn('Skipping invalid row:', row, err);
                    }
                }

                // Convert staff map to array
                const staff = Array.from(staffSet.entries()).map(([name, color]) => ({
                    name,
                    color,
                }));

                resolve({ staff, shifts });
            } catch (error) {
                reject(new Error('Failed to parse Excel file. Please ensure it\'s a valid LightShift export.'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file.'));
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * Get the current localStorage usage
 */
export function getStorageUsage(): { usedBytes: number; usedFormatted: string; percentUsed: number } {
    const STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB typical browser limit

    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const value = localStorage.getItem(key);
            if (value) {
                // Rough estimate: each character is 2 bytes in UTF-16
                totalBytes += (key.length + value.length) * 2;
            }
        }
    }

    // Format bytes to human-readable
    let usedFormatted: string;
    if (totalBytes < 1024) {
        usedFormatted = `${totalBytes} B`;
    } else if (totalBytes < 1024 * 1024) {
        usedFormatted = `${(totalBytes / 1024).toFixed(1)} KB`;
    } else {
        usedFormatted = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    const percentUsed = (totalBytes / STORAGE_LIMIT) * 100;

    return {
        usedBytes: totalBytes,
        usedFormatted,
        percentUsed: Math.min(percentUsed, 100),
    };
}
