import z from "zod";

export const signupVal = z.object({
    name: z.string().trim().min(2).max(100),
    email:z.string().trim().email().toLowerCase(),
    parentEmail : z.string().trim().email().toLowerCase(),
    password : z.string().min(6).max(100),
    rollno : z.string().trim().min(1).max(50),
    hostelName : z.string().trim().min(2).max(100),
})

export const signinVal = z.object({
    email:z.string().trim().email().toLowerCase(),
    password : z.string().min(1).max(100)
})

export const userMail = z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid from date"),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid to date"),
    place: z.string().trim().min(2).max(200),
    reason: z.string().trim().min(3).max(1000),
  }).refine((data) => new Date(data.to) >= new Date(data.from), {
    message: "To date must be on or after from date",
    path: ["to"],
  });

export const tokenQueryVal = z.object({
    token: z.string().min(1),
});

export const pushSubscriptionVal = z.object({
    subscription: z.object({
        endpoint: z.string().url(),
        expirationTime: z.number().nullable().optional(),
        keys: z.object({
            p256dh: z.string().min(1),
            auth: z.string().min(1),
        }),
    }).passthrough(),
});