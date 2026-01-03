import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StaffSidebar } from '../StaffSidebar';
import { useStore } from '../../store/useStore';

// Mock the store
jest.mock('../../store/useStore');

describe('StaffSidebar', () => {
    const mockStaff = [
        { id: '1', name: 'Alice', color: '#0000ff' },
        { id: '2', name: 'Bob', color: '#ff0000' },
    ];

    beforeEach(() => {
        (useStore as unknown as jest.Mock).mockReturnValue({
            staff: mockStaff,
            selectedStaffId: null,
            deleteStaff: jest.fn(),
            getDeleteStaffCount: jest.fn().mockReturnValue(3),
            setSelectedStaffId: jest.fn(),
            updateStaff: jest.fn(),
        });
    });

    test('renders staff list', () => {
        render(<StaffSidebar />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    test('clicking Delete shows confirmation with shift count', async () => {
        render(<StaffSidebar />);

        // Assume there's a delete button for each staff
        const deleteButtons = screen.getAllByTestId('delete-staff-button');
        fireEvent.click(deleteButtons[0]);

        // Check for confirmation text as per TestPlan 4.7
        expect(await screen.findByText(/3 shifts will be removed/i)).toBeInTheDocument();
    });

    test('inline editing updates staff name in store', () => {
        const updateStaff = jest.fn();
        (useStore as unknown as jest.Mock).mockReturnValue({
            staff: mockStaff,
            updateStaff,
        });

        render(<StaffSidebar />);

        // Assume clicking the edit button enables edit mode
        const editButton = screen.getAllByTitle('Edit Name')[0];
        fireEvent.click(editButton);

        const input = screen.getByTestId('edit-staff-input');
        fireEvent.change(input, { target: { value: 'Alice Cooper' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(updateStaff).toHaveBeenCalledWith('1', { name: 'Alice Cooper' });
    });

    test('renders export button', () => {
        render(<StaffSidebar />);
        expect(screen.getByTestId('export-button')).toBeInTheDocument();
    });
});
