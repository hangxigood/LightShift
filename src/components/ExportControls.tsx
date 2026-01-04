'use client';

import React, { useState } from 'react';
import { downloadCalendarSnapshot, shareCalendarSnapshot, copyCalendarToClipboard } from '../lib/services/exportService';

export const ExportControls: React.FC = () => {
    const [copySuccess, setCopySuccess] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    return (
        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2" data-tutorial="export-controls">
            <div className="flex gap-2">
                <button
                    data-testid="share-button"
                    onClick={async () => {
                        setIsSharing(true);
                        await shareCalendarSnapshot();
                        setIsSharing(false);
                    }}
                    disabled={isSharing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-all font-medium flex items-center justify-center gap-2 shadow-sm active:transform active:scale-95"
                >
                    <span>{isSharing ? '⌛' : '🔗'}</span> {isSharing ? 'Sharing...' : 'Share'}
                </button>
                <button
                    data-testid="copy-button"
                    onClick={async () => {
                        const success = await copyCalendarToClipboard();
                        if (success) {
                            setCopySuccess(true);
                            setTimeout(() => setCopySuccess(false), 2000);
                        }
                    }}
                    className={`flex-1 px-4 py-2 text-gray-700 rounded-md transition-all font-medium flex items-center justify-center gap-2 border shadow-sm active:transform active:scale-95 ${copySuccess ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                >
                    <span>{copySuccess ? '✅' : '📋'}</span> {copySuccess ? 'Copied' : 'Copy'}
                </button>
            </div>
            <button
                data-testid="export-button"
                onClick={downloadCalendarSnapshot}
                className="w-full px-4 py-2 bg-white text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-all font-medium border border-gray-200 flex items-center justify-center gap-2 shadow-sm active:transform active:scale-95"
            >
                <span>📥</span> Download PNG
            </button>
        </div>
    );
};
