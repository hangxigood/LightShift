'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { exportToExcel, parseExcelImport, getStorageUsage } from '@/lib/services/dataExportService';

export const DataManagement: React.FC = () => {
    const { staff, shifts, importData, clearAllData } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [storageInfo, setStorageInfo] = useState({ usedFormatted: '...', percentUsed: 0 });
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showImportConfirm, setShowImportConfirm] = useState(false);
    const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update storage info on mount and when data changes
    useEffect(() => {
        setStorageInfo(getStorageUsage());
    }, [staff, shifts]);

    const handleExport = () => {
        setError(null);
        try {
            exportToExcel(staff, shifts);
        } catch (err) {
            setError('Failed to export data.');
            console.error(err);
        }
    };

    const handleImportClick = () => {
        setError(null);
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input so the same file can be selected again
        e.target.value = '';

        // If there's existing data, show confirmation
        if (staff.length > 0 || shifts.length > 0) {
            setPendingImportFile(file);
            setShowImportConfirm(true);
        } else {
            await processImport(file);
        }
    };

    const processImport = async (file: File) => {
        setIsImporting(true);
        setError(null);

        try {
            const result = await parseExcelImport(file);
            importData(result.staff, result.shifts);
            setStorageInfo(getStorageUsage());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import file.');
            console.error(err);
        } finally {
            setIsImporting(false);
            setPendingImportFile(null);
        }
    };

    const handleConfirmImport = async () => {
        setShowImportConfirm(false);
        if (pendingImportFile) {
            await processImport(pendingImportFile);
        }
    };

    const handleClearData = () => {
        setShowClearConfirm(true);
    };

    const handleConfirmClear = () => {
        clearAllData();
        setShowClearConfirm(false);
        setStorageInfo(getStorageUsage());
    };

    return (
        <div
            data-tutorial="data-management"
            className="mt-4 pt-4 border-t border-gray-200"
        >
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Data Management
            </h3>

            {/* Storage Usage */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Storage Used</span>
                    <span>{storageInfo.usedFormatted} / 5 MB</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${storageInfo.percentUsed > 80 ? 'bg-red-500' :
                                storageInfo.percentUsed > 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${Math.max(storageInfo.percentUsed, 1)}%` }}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleExport}
                    disabled={shifts.length === 0}
                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <span>📥</span>
                    Export to Excel
                </button>

                <button
                    onClick={handleImportClick}
                    disabled={isImporting}
                    className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <span>📤</span>
                    {isImporting ? 'Importing...' : 'Import from Excel'}
                </button>

                <button
                    onClick={handleClearData}
                    disabled={staff.length === 0 && shifts.length === 0}
                    className="w-full px-3 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <span>🗑️</span>
                    Clear All Data
                </button>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Error message */}
            {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Clear Confirmation Modal */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Clear All Data?</h4>
                        <p className="text-gray-600 mb-4">
                            This will permanently delete all {staff.length} staff member(s) and {shifts.length} shift(s).
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleConfirmClear}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete All
                            </button>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Confirmation Modal */}
            {showImportConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Replace Existing Data?</h4>
                        <p className="text-gray-600 mb-4">
                            Importing will replace your current {staff.length} staff member(s) and {shifts.length} shift(s)
                            with the data from the file.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleConfirmImport}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Replace
                            </button>
                            <button
                                onClick={() => {
                                    setShowImportConfirm(false);
                                    setPendingImportFile(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
