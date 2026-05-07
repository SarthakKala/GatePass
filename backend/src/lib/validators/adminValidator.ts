import z from "zod";
export const signupVal = z.object({
    name: z.string().trim().min(2).max(100),
    email:z.string().trim().email().toLowerCase(),
    password : z.string().min(6).max(100),
    hostelName : z.string().trim().min(2).max(100),
    adminCode: z.string().trim().min(1).max(100),
})

export const signinVal = z.object({
    email:z.string().trim().email().toLowerCase(),
    password : z.string().min(1).max(100)
})

export const paginationQueryVal = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const idQueryVal = z.object({
    id: z.string().min(1),
});