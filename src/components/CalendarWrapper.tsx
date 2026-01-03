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
        clearAllSelections
    } = useStore();
    const calendarRef = useRef<FullCalendar>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<DateSelectArg | null>(null);
    const [staffNameInput, setStaffNameInput] = useState('');
    const [viewType, setViewType] = useState('timeGridWeek');

    const handleDatesSet = (arg: any) => {
        setViewType(arg.view.type);
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

    // Handle event click for selection
    const handleEventClick = (clickInfo: any) => {
        setSelectedShiftId(clickInfo.event.id === selectedShiftId ? null : clickInfo.event.id);
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

        // Calculate duration
        const duration = eventInfo.event.start && eventInfo.event.end
            ? calculateDuration(eventInfo.event.start, eventInfo.event.end)
            : '';

        return (
            <div className={`fc-event-main-frame ${isDeleting ? 'is-deleting' : ''}`}>
                <div className="fc-event-title-container">
                    <div className="fc-event-title">{eventInfo.event.title}</div>
                    {duration && (
                        <div className="fc-event-duration" style={{
                            fontSize: '0.75em',
                            opacity: 0.9,
                            marginTop: '2px'
                        }}>
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
