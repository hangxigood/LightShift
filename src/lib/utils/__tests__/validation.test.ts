import { ShiftSchema, StaffSchema } from '../validation';

describe('Validation Schemas', () => {
    describe('StaffSchema', () => {
        test('rejects empty staff name', () => {
            const result = StaffSchema.safeParse({ name: '' });
            expect(result.success).toBe(false);
        });

        test('accepts valid staff name', () => {
            const result = StaffSchema.safeParse({ name: 'Valid Name' });
            expect(result.success).toBe(true);
        });
    });

    describe('ShiftSchema', () => {
        test('rejects end time before start time', () => {
            const result = ShiftSchema.safeParse({
                staffId: '1',
                start: '2023-10-10T10:00:00',
                end: '2023-10-10T09:00:00',
            });
            expect(result.success).toBe(false);
        });

        test('accepts valid time range', () => {
            const result = ShiftSchema.safeParse({
                staffId: '1',
                start: '2023-10-10T09:00:00',
                end: '2023-10-10T10:00:00',
            });
            expect(result.success).toBe(true);
        });
    });
});
