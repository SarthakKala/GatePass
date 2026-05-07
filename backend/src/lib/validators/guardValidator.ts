import z from "zod";
export const signupVal = z.object({
    name: z.string().trim().min(2).max(100),
    email:z.string().trim().email().toLowerCase(),
    password : z.string().min(6).max(100),
})

export const signinVal = z.object({
    email:z.string().trim().email().toLowerCase(),
    password : z.string().min(1).max(100)
})

export const idQueryVal = z.object({
    id: z.string().min(1),
});