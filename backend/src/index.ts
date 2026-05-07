import express from "express";
import cors from "cors";
const router = express.Router();
const app = express();
app.use(express.json());
app.use(cors());
import adminRouter from "./routes/adminRouter";
import userRouter from "./routes/userRouter";
import guardRouter from "./routes/guardRouter";
import { authLimiter, emailLimiter, generalLimiter } from "./middleware/rateLimiter";

app.set("trust proxy", 1);
app.use(generalLimiter);
app.use(["/api/user/signup", "/api/user/signin", "/api/admin/signup", "/api/admin/signin"], authLimiter);
app.use("/api/user/send", emailLimiter);
app.use("/api/admin",adminRouter);
app.use("/api/user",userRouter);
app.use("/api/guard",guardRouter);

app.listen("3000",()=>{
    console.log("The server is running on 3000");
})
