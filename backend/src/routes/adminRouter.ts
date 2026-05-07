import express, {Request, Response} from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { signupVal } from "../lib/validators/adminValidator";
import { signinVal } from "../lib/validators/adminValidator";
import { idQueryVal, paginationQueryVal } from "../lib/validators/adminValidator";
import aAuth from "../middleware/aAuth";
import { prisma } from "../db";
import { validate } from "../middleware/validate";
import { PushSubscription, sendPushNotification } from "../utils/webPush";

router.post("/signup",validate(signupVal),async(req:Request,res:Response):Promise<any>=>{
    const adminBody = req.body;
    try{
        const admin  = await prisma.admin.create({
            data:adminBody}
        );
        const token = jwt.sign({id:admin.id},process.env.JWT_SECRET as string );
        res.status(200).json({token:token});
    
    }catch(e){
        return res.status(403).json({msg:"admin already exist"});
    }
    
})
router.post("/signin",validate(signinVal),async(req:Request,res:Response):Promise<any>=>{
    const signinBody = req.body;
    try{
        const admin = await prisma.admin.findFirst({
            where:{
                email:signinBody.email,
                password:signinBody.password
            }
        })
        if(!admin){
            return res.status(401).json({msg:"admin does not exist"});
        }
        const token = jwt.sign({id:admin.id},process.env.JWT_SECRET as string);
        res.status(200).json({msg:"Signin Success",token:token});
    }catch(e){
        return res.status(500).json({msg:"An error occurred"});
    }
})

router.get("/getAll",aAuth,validate(paginationQueryVal, "query"),async(req:Request,res:Response):Promise<any>=>{
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const skip = (page - 1) * limit;
    const where = {
        parentAuth:true,
        adminAuth:false
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where:{
            parentAuth:true,
            adminAuth:false
        },
        select:{
            id:true,
            name:true,
            email:true
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
    }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
        users:users,
        pagination:{
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        }
    });
})

router.put("/allow",aAuth,validate(idQueryVal, "query"),async(req:Request,res:Response):Promise<any>=>{
    const userId = req.query.id;
    try{
    const allowedusers = await prisma.user.update({
        where:{
            id: String(userId)
        },
        data:{
            adminAuth:true
        },
        select:{
            id:true,
            pushSubscription:true,
        },
    })
    if(allowedusers.pushSubscription){
        const result = await sendPushNotification(allowedusers.pushSubscription as unknown as PushSubscription, {
            title: "Leave Request Approved",
            body: "Your leave request has been approved.",
        });
        if(result?.expired){
            await prisma.user.update({
                where:{ id: allowedusers.id },
                data:{ pushSubscription: Prisma.DbNull },
            });
        }
    }
    return res.status(200).json({msg:"Successfull"});
}catch(e){
    return res.status(400).json({msg:"An error occured"});
}
})

export default router;