'use client';

import React from 'react';
import { Staff } from '../types';

interface CreateShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    staffNameInput: string;
    setStaffNameInput: (value: string) => void;
    staff: Staff[];
}

export const CreateShiftModal: React.FC<CreateShiftModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    staffNameInput,
    setStaffNameInput,
    staff,
}) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw] animate-in fade-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Shift</h3>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Staff Name
                        </label>
                        <input
                            autoFocus
                            type="text"
                            list="staff-suggestions"
                            value={staffNameInput}
                            onChange={(e) => setStaffNameInput(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Type or select staff..."
                            required
                        />
                        <datalist id="staff-suggestions">
                            {staffNameInput.length > 0 && staff.map(s => (
                                <option key={s.id} value={s.name} />
                            ))}
                        </datalist>
                        <p className="mt-1 text-xs text-gray-500">
                            Offers existing staff names as you type.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Create Shift
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
