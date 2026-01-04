'use client';

import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useStore } from '../store/useStore';
import type { CalendarEvent } from '../types';
import type { EventDropArg, DateSelectArg, EventContentArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';

import { CreateShiftModal } from './CreateShiftModal';

export const CalendarWrapper: React.FC = () => {
    const {
        staff,
        shifts,
        selectedStaffId,
        selectedShiftId,
        deletingStaffId,
        updateShiftWithValidation,
        addShiftWithValidation,
        setSelectedShiftId,
        clearAllSelections,
        setCurrentViewDate
    } = useStore();
    const calendarRef = useRef<FullCalendar>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<DateSelectArg | null>(null);
    const [staffNameInput, setStaffNameInput] = useState('');
    const [viewType, setViewType] = useState('timeGridWeek');

    const handleDatesSet = (arg: any) => {
        setViewType(arg.view.type);
        // Update the current view date to track the visible week
        if (arg.view.currentStart) {
            setCurrentViewDate(new Date(arg.view.currentStart));
        }
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
        setModalData(null);
        setStaffNameInput('');
        if (modalData) {
            modalData.view.calendar.unselect();
        }
    };

    // Handle Keyboard Shortcuts (Escape to close modal, Delete/Backspace to remove shift)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleModalClose();
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShiftId && !isModalOpen) {
                // If the user is typing in a field, don't delete
                if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

                useStore.getState().deleteShift(selectedShiftId);
                setSelectedShiftId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, selectedShiftId, setSelectedShiftId]);

    // Convert shifts to calendar events
    const events: CalendarEvent[] = shifts.map(shift => {
        const staffMember = staff.find(s => s.id === shift.staffId);
        const isSelected = selectedShiftId === shift.id;
        const isDeleting = deletingStaffId === shift.staffId;
        const isStaffSelected = selectedStaffId === shift.staffId;


        return {
            id: shift.id,
            title: staffMember?.name || 'Unknown',
            start: shift.start,
            end: shift.end,
            backgroundColor: staffMember?.color || '#gray',
            borderColor: isDeleting ? '#ef4444' : (isSelected ? '#000000' : (staffMember?.color || '#gray')),
            classNames: [
                isSelected ? 'selected-shift' : '',
                isDeleting ? 'deleting-preview' : '',
                isStaffSelected ? 'staff-highlighted' : '',
                (selectedStaffId && !isStaffSelected) ? 'event-dimmed' : ''
            ].filter(Boolean),
            extendedProps: {
                staffId: shift.staffId,
                staffName: staffMember?.name || 'Unknown',
            },
        };
    });

    // Track click timing for double-click detection
    const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastClickedIdRef = useRef<string | null>(null);

    // Handle event click for selection and double-click for deletion
    const handleEventClick = (clickInfo: any) => {
        const eventId = clickInfo.event.id;

        // Check if this is a double-click (same event clicked within 300ms)
        if (clickTimerRef.current && lastClickedIdRef.current === eventId) {
            // Double-click detected - delete the shift
            clearTimeout(clickTimerRef.current);
            clickTimerRef.current = null;
            lastClickedIdRef.current = null;

            if (confirm('Delete this shift?')) {
                useStore.getState().deleteShift(eventId);
                setSelectedShiftId(null);
            }
        } else {
            // Single click - select/deselect the shift
            if (clickTimerRef.current) {
                clearTimeout(clickTimerRef.current);
            }

            lastClickedIdRef.current = eventId;
            clickTimerRef.current = setTimeout(() => {
                setSelectedShiftId(eventId === selectedShiftId ? null : eventId);
                clickTimerRef.current = null;
                lastClickedIdRef.current = null;
            }, 300);
        }
    };

    // Handle event drop (drag and drop)
    const handleEventDrop = (info: EventDropArg) => {
        const { event } = info;

        const result = updateShiftWithValidation(event.id, {
            start: event.startStr,
            end: event.endStr,
        });

        if (!result.success) {
            info.revert();
            alert(result.error);
        }
    };

    const handleEventResize = (info: EventResizeDoneArg) => {
        const { event } = info;

        const result = updateShiftWithValidation(event.id, {
            start: event.startStr,
            end: event.endStr,
        });

        if (!result.success) {
            info.revert();
            alert(result.error);
        }
    };

    const handleDateSelect = (selectInfo: DateSelectArg) => {
        if (selectInfo.view.type === 'dayGridMonth') {
            const calendarApi = selectInfo.view.calendar;
            calendarApi.changeView('timeGridWeek', selectInfo.start);
            calendarApi.unselect();
            return;
        }
        clearAllSelections(); // Clear ALL selections when starting a new one
        setModalData(selectInfo);
        setIsModalOpen(true);
        setStaffNameInput('');
    };

    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!staffNameInput || !modalData) return;

        const result = addShiftWithValidation(
            staffNameInput,
            modalData.startStr,
            modalData.endStr
        );

        if (!result.success) {
            alert(result.error);
            return;
        }

        handleModalClose();
    };

    // Helper function to calculate duration
    const calculateDuration = (start: Date, end: Date): string => {
        const durationMs = end.getTime() - start.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours === 0) {
            return `${minutes}m`;
        } else if (minutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${minutes}m`;
        }
    };

    const renderEventContent = (eventInfo: EventContentArg) => {
        const staffId = eventInfo.event.extendedProps.staffId as string;
        const isDeleting = deletingStaffId === staffId;

        // Calculate duration and time range
        const start = eventInfo.event.start;
        const end = eventInfo.event.end;

        const duration = start && end ? calculateDuration(start, end) : '';

        const formatTime = (date: Date) => {
            return date.toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        };

        const formatTimeShort = (date: Date) => {
            return date.toLocaleTimeString([], {
                hour: 'numeric',
                hour12: true
            });
        };

        const timeRange = start && end ? `${formatTime(start)} - ${formatTime(end)}` : '';
        const timeRangeShort = start && end ? `${formatTimeShort(start)}-${formatTimeShort(end)}` : '';

        return (
            <div
                className={`fc-event-main-frame ${isDeleting ? 'is-deleting' : ''} p-1`}
                title={`${eventInfo.event.title}\n${timeRange}\n${duration}`}
            >
                <div className="fc-event-title-container flex flex-col h-full justify-between overflow-hidden">
                    <div className="min-w-0">
                        <div className="fc-event-title font-bold leading-tight truncate">{eventInfo.event.title}</div>
                        {timeRange && (
                            <>
                                {/* Full time range - hidden when too narrow */}
                                <div className="fc-event-time-full text-[10px] opacity-90 leading-tight whitespace-nowrap">
                                    {timeRange}
                                </div>
                                {/* Short time range - shown when narrow */}
                                <div className="fc-event-time-short text-[9px] opacity-90 leading-tight whitespace-nowrap">
                                    {timeRangeShort}
                                </div>
                                {/* Ultra-compact - just duration badge */}
                                <div className="fc-event-time-compact text-[8px] opacity-90 leading-tight">
                                    {duration}
                                </div>
                            </>
                        )}
                    </div>
                    {duration && (
                        <div className="fc-event-duration-badge text-[10px] bg-black/10 px-1 rounded self-start mt-1 whitespace-nowrap">
                            {duration}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div data-testid="calendar-wrapper" id="calendar-root" className="h-full relative">
            <style jsx global>{`
                /* Responsive time display based on event width */
                .fc-event-time-full {
                    display: block;
                }
                .fc-event-time-short {
                    display: none;
                }
                .fc-event-time-compact {
                    display: none;
                }
                .fc-event-duration-badge {
                    display: block;
                }

                /* When event is narrow (< 80px), hide full time and show short */
                .fc-timegrid-event {
                    min-width: 0 !important;
                }
                
                .fc-timegrid-event.fc-event-mirror,
                .fc-timegrid-event {
                    overflow: visible !important;
                }

                /* Medium width: show abbreviated time */
                @container (max-width: 100px) {
                    .fc-event-time-full {
                        display: none !important;
                    }
                    .fc-event-time-short {
                        display: block !important;
                    }
                    .fc-event-duration-badge {
                        display: none !important;
                    }
                }

                /* Very narrow: show only compact duration */
                @container (max-width: 60px) {
                    .fc-event-time-full {
                        display: none !important;
                    }
                    .fc-event-time-short {
                        display: none !important;
                    }
                    .fc-event-time-compact {
                        display: block !important;
                    }
                    .fc-event-duration-badge {
                        display: none !important;
                    }
                }

                /* Ultra narrow: hide all time text, rely on tooltip */
                @container (max-width: 40px) {
                    .fc-event-time-full,
                    .fc-event-time-short,
                    .fc-event-time-compact,
                    .fc-event-duration-badge {
                        display: none !important;
                    }
                }

                /* Enable container queries on event elements */
                .fc-timegrid-event-harness,
                .fc-daygrid-event-harness {
                    container-type: inline-size;
                }

                .selected-shift {
                    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1), 0 0 0 2px black !important;
                    z-index: 20 !important;
                    filter: brightness(1.05);
                    animation: pulse-select 2s infinite;
                }
                .staff-highlighted {
                    z-index: 10 !important;
                    box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                    transform: scale(1.02);
                    filter: brightness(1.02);
                }
                .event-dimmed {
                    opacity: 0.15 !important;
                    filter: grayscale(100%) !important;
                    transition: opacity 0.2s ease, filter 0.2s ease;
                }
                @keyframes pulse-select {
                    0% { box-shadow: 0 0 0 0px rgba(0, 0, 0, 0.2), 0 0 0 2px black !important; }
                    50% { box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1), 0 0 0 2px black !important; }
                    100% { box-shadow: 0 0 0 0px rgba(0, 0, 0, 0.2), 0 0 0 2px black !important; }
                }
                .deleting-preview {
                    z-index: 30 !important;
                    animation: pulse-destructive 1.5s infinite;

                }
                @keyframes pulse-destructive {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.98); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .is-deleting {
                    color: white !important;
                }
            `}</style>
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                editable={viewType !== 'dayGridMonth'}
                selectable={true}
                selectMirror={viewType !== 'dayGridMonth'}
                dayMaxEvents={true}
                weekends={true}
                allDaySlot={false}
                events={events}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                select={handleDateSelect}
                datesSet={handleDatesSet}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                slotMinTime="06:00:00"
                slotMaxTime="24:00:00"
                height="100%"
            />

            <CreateShiftModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={handleModalSubmit}
                staffNameInput={staffNameInput}
                setStaffNameInput={setStaffNameInput}
                staff={staff}
            />
        </div>
    );
};
