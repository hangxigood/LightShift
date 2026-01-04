'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Staff } from '@/types';
import { ExportControls } from './ExportControls';
import { getWeeklyStats } from '@/lib/utils/calendarUtils';

export const StaffSidebar: React.FC = () => {
    const { staff, shifts, currentViewDate, deleteStaff, getDeleteStaffCount, updateStaff, addStaff, selectedStaffId, setSelectedStaffId, setSelectedShiftId, setDeletingStaffId, clearAllSelections } = useStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [newStaffName, setNewStaffName] = useState('');

    const handleNameClick = (staffMember: Staff) => {
        setSelectedShiftId(null); // Clear single shift selection when selecting staff
        if (selectedStaffId === staffMember.id) {
            setSelectedStaffId(null);
        } else {
            setSelectedStaffId(staffMember.id);
        }
    };

    const handleEditClick = (e: React.MouseEvent, staffMember: Staff) => {
        e.stopPropagation(); // Prevent selection when clicking edit
        setEditingId(staffMember.id);
        setEditValue(staffMember.name);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
        if (e.key === 'Enter') {
            updateStaff(id, { name: editValue });
            setEditingId(null);
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeleteConfirmId(id);
        setDeletingStaffId(id);
    };

    const handleConfirmDelete = (id: string) => {
        deleteStaff(id);
        clearAllSelections();
    };

    const handleCancelDelete = () => {
        setDeleteConfirmId(null);
        setDeletingStaffId(null);
    };

    const handleAddStaff = () => {
        if (newStaffName.trim()) {
            addStaff(newStaffName.trim());
            setNewStaffName('');
        }
    };

    return (
        <aside
            data-testid="staff-sidebar"
            className="h-full flex flex-col p-6 bg-white border-r border-gray-200 cursor-default"
            onClick={(e) => e.target === e.currentTarget && clearAllSelections()}
        >
            <h1 className="text-3xl font-bold mb-6 text-gray-900">LightShift</h1>

            {/* Add Staff Section */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add New Staff</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStaff()}
                        placeholder="Enter name..."
                        data-tutorial="add-staff-input"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleAddStaff}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>


            {/* Staff List */}
            <div
                className="flex-1 overflow-y-auto"
                onClick={(e) => e.target === e.currentTarget && clearAllSelections()}
            >
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Staff ({staff.length})
                </h2>
                <ul data-testid="staff-list" className="space-y-2">
                    {staff.map((staffMember) => {
                        const weeklyStats = getWeeklyStats(staffMember.id, shifts, currentViewDate);

                        return (
                            <li
                                key={staffMember.id}
                                className={`rounded-lg p-3 border transition-all cursor-pointer ${selectedStaffId === staffMember.id
                                    ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                                    : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                                    }`}
                                onClick={() => handleNameClick(staffMember)}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: staffMember.color }}
                                    />
                                    {editingId === staffMember.id ? (
                                        <input
                                            data-testid="edit-staff-input"
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={(e) => handleEditKeyDown(e, staffMember.id)}
                                            onBlur={() => setEditingId(null)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="flex-1 min-w-0">
                                            <span className="font-medium text-gray-900 block">
                                                {staffMember.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {weeklyStats.count} shift{weeklyStats.count !== 1 ? 's' : ''} · {weeklyStats.hours}h this week
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        onClick={(e) => handleEditClick(e, staffMember)}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Edit Name"
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        data-testid="delete-staff-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(staffMember.id);
                                        }}
                                        onMouseEnter={() => !deleteConfirmId && setDeletingStaffId(staffMember.id)}
                                        onMouseLeave={() => !deleteConfirmId && setDeletingStaffId(null)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {deleteConfirmId === staffMember.id && (
                                    <div data-testid="delete-confirmation" className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                        <p className="text-sm text-red-800 mb-2">
                                            {getDeleteStaffCount(staffMember.id)} shifts will be removed
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleConfirmDelete(staffMember.id);
                                                }}
                                                className="flex-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancelDelete();
                                                }}
                                                className="flex-1 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
                {staff.length === 0 && (
                    <p className="text-gray-500 text-sm text-center mt-4">
                        No staff members yet. Add one above to get started!
                    </p>
                )}
            </div>

            {/* Share & Export Section */}
            <ExportControls />
        </aside>
    );
};
