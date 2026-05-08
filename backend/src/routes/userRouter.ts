import express, {Request, Response} from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { signupVal } from "../lib/validators/userValidator";
import { signinVal } from "../lib/validators/userValidator";
import { pushSubscriptionVal, tokenQueryVal, userMail } from "../lib/validators/userValidator";
import { EMAIL_FROM, FRONTEND_URL, JWT_SECRET, MAIL_HOST, MAIL_PASS, MAIL_PORT, MAIL_USER } from "../config";
import uAuth from "../middleware/uAuth"
import nodemailer from "nodemailer";
import crypto from "crypto";
import {addHours} from "date-fns";
import { prisma } from "../db";
import { validate } from "../middleware/validate";
import { PushSubscription, sendPushNotification } from "../utils/webPush";

const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: MAIL_PORT === 465,
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
    },
});

router.get("/me",uAuth,async(req:Request,res:Response):Promise<any>=>{
    const userId = req.userId;
    if(!userId){
        return res.status(401).json({msg:"Unauthorized"});
    }
    const user = await prisma.user.findFirst({
        where:{
            id: userId
        },
        select:{
            id:true,
            name:true,
            parentAuth:true,
            adminAuth:true,
            parentAuthToken:true,
            rollno:true
        }
    })
    return res.json({id:user?.id,name:user?.name,rollno:user?.rollno,parentAuth:user?.parentAuth,adminAuth:user?.adminAuth,parentAuthToken:user?.parentAuthToken})
})
router.post("/signup",validate(signupVal),async(req:Request,res:Response):Promise<any>=>{
    const userBody = req.body;
    try{
        const user  = await prisma.user.create({
            data:userBody}
        );
        const token = jwt.sign({id:user.id}, JWT_SECRET);
        res.status(200).json({token:token});
    
    }catch(e){
        return res.status(409).json({msg:"User already exists"});
    }
    
})
router.post("/signin",validate(signinVal),async(req:Request,res:Response):Promise<any>=>{
    const signinBody = req.body;
    try{
        const user = await prisma.user.findFirst({
            where:{
                email:signinBody.email,
                password:signinBody.password
            }
        })
        if(!user){
            return res.status(401).json({msg:"User does not exist"});
        }
        const token = jwt.sign({id:user.id},JWT_SECRET);
        res.status(200).json({msg:"Signin Success",token:token});
    }catch(e){
        return res.status(500).json({msg:"An error occurred"});
    }
})
router.post(
    "/send",
    uAuth,
    validate(userMail),
    async (req: Request, res: Response): Promise<any> => {
      if(!req.userId){
        return res.status(401).json({msg:"Unauthorized"});
      }
      const body = req.body;
      let parentEmail;
      try {
        parentEmail = await prisma.user.update({
          where: {
            id: req.userId,
          },
          data: {
            parentAuthToken: crypto.randomBytes(32).toString("hex"),
            parentAuthExpireAt: addHours(new Date(), 3),
            parentAuth: false,
            adminAuth: false,
          },
          select: {
            parentAuthToken: true,
            parentEmail: true,
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
          return res.status(404).json({
            msg: "Student account not found. Please sign in as a student before submitting leave.",
          });
        }

        return res.status(500).json({ msg: "Could not create leave request" });
      }
      const link = `${FRONTEND_URL}/auth?token=${parentEmail.parentAuthToken}`;
      try {
        if(!MAIL_HOST || !MAIL_USER || !MAIL_PASS || !EMAIL_FROM){
          return res.status(500).json({ message: "Email service is not configured" });
        }

        await transporter.sendMail({
          from: EMAIL_FROM,
          to: parentEmail.parentEmail,
          subject: "Authentication Request",
          html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #333;">Leave Authentication Request</h2>
          <p style="font-size: 16px; color: #555;">Your ward has requested leave authentication. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>From Date:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${body.from}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>To Date:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${body.to}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Place to Go:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${body.place}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Reason:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${body.reason}</td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${link}" style="background-color: #007bff; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-size: 16px;">
              Authenticate Now
            </a>
          </div>
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
        });

        return res.json({ message: "Mail sent" });
      } catch (e: any) {
        console.error("Mail not sent:", {
          code: e?.code,
          command: e?.command,
          response: e?.response,
          responseCode: e?.responseCode,
        });
        return res.status(400).json({ message: "Mail not sent. Please check Brevo SMTP configuration." });
      }
    }
  );

router.put("/auth",validate(tokenQueryVal, "query"),async(req:Request,res:Response):Promise<any>=>{
    const token : string = (req.query as { token: string }).token;
    try{
    const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findFirst({
            where:{
                parentAuthToken:token
            }
        })

        if(!user || !user.parentAuthExpireAt || user.parentAuthExpireAt < new Date()){
            throw new Error("Invalid token");
        }

        const updateResult = await tx.user.updateMany({
            where:{
                id:user.id,
                parentAuthToken:token
            },
            data:{
                parentAuthToken:null,
                parentAuthExpireAt:null,
                parentAuth:true
            }
        })

        if(updateResult.count !== 1){
            throw new Error("Token already used");
        }

        return tx.user.findUnique({
            where:{ id:user.id },
            select:{ id:true, pushSubscription:true },
        });
    });

    if(updatedUser?.pushSubscription){
        const result = await sendPushNotification(updatedUser.pushSubscription as unknown as PushSubscription, {
            title: "Parent Verification Done",
            body: "Your parent has verified your leave request. Awaiting admin approval.",
        });
        if(result?.expired){
            await prisma.user.update({
                where:{ id: updatedUser.id },
                data:{ pushSubscription: Prisma.DbNull },
            });
        }
    }

    return res.status(200).json({msg:"Successfull"});
    }
    catch(e){
        return res.status(400).json({msg:"Invalid or expired token"})
    }
})

router.post("/push/subscribe",uAuth,validate(pushSubscriptionVal),async(req:Request,res:Response):Promise<any>=>{
    if(!req.userId){
        return res.status(401).json({msg:"Unauthorized"});
    }

    await prisma.user.update({
        where:{ id:req.userId },
        data:{ pushSubscription:req.body.subscription as Prisma.InputJsonValue },
    });

    return res.status(200).json({success:true});
})

export default router;

