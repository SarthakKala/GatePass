import express from "express";
import cors from "cors";
const app = express();
app.use(express.json());
import adminRouter from "./routes/adminRouter";
import userRouter from "./routes/userRouter";
import guardRouter from "./routes/guardRouter";
import { authLimiter, emailLimiter, generalLimiter } from "./middleware/rateLimiter";
import { FRONTEND_URL } from "./config";

app.use(cors({
    origin: FRONTEND_URL,
}));

app.set("trust proxy", 1);

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "gatepass-api",
        timestamp: new Date().toISOString(),
    });
});

app.use(generalLimiter);
app.use(["/api/user/signup", "/api/user/signin", "/api/admin/signup", "/api/admin/signin"], authLimiter);
app.use("/api/user/send", emailLimiter);
app.use("/api/admin",adminRouter);
app.use("/api/user",userRouter);
app.use("/api/guard",guardRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`The server is running on ${PORT}`);
})
