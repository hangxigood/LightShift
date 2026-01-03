import { z } from 'zod';

// Schema for validating staff input (without id for creation)
export const StaffSchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name too long"),
});

// Full Staff schema with ID (for complete validation)
export const StaffWithIdSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "Name is required").max(50),
    color: z.string(),
    createdAt: z.string().optional(),
});

// Schema for validating shift input (without id for creation)
export const ShiftSchema = z.object({
    staffId: z.string(),
    start: z.string(),
    end: z.string(),
}).refine(data => new Date(data.end) > new Date(data.start), {
    message: "End time must be after start time",
    path: ["end"],
});

// Full Shift schema with ID (for complete validation)
export const ShiftWithIdSchema = z.object({
    id: z.string().uuid(),
    staffId: z.string().uuid(),
    start: z.string().datetime({ local: true }),
    end: z.string().datetime({ local: true }),
    notes: z.string().optional(),
}).refine(data => new Date(data.end) > new Date(data.start), {
    message: "End time must be after start time",
    path: ["end"],
});
