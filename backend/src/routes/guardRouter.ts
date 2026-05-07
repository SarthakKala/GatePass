import express, {Request, Response} from "express";
const router = express.Router();
import { prisma } from "../db";
import { validate } from "../middleware/validate";
import { idQueryVal } from "../lib/validators/guardValidator";

router.get("/scan",validate(idQueryVal, "query"),async(req:Request,res:Response):Promise<any>=>{
    const id = req.query.id;
    try{
        const user = await prisma.user.findUnique({
            where:{
                id:String(id)
            },
            select:{
                name:true,
                rollno:true,
                parentAuth:true,
                adminAuth:true
            }
        })

        if(!user){
            return res.status(404).json({msg:"Student pass not found"});
        }

        if(!user.parentAuth || !user.adminAuth){
            return res.status(403).json({msg:"This gate pass is not active"});
        }

        return res.status(200).json({
            name:user.name,
            rollno:user.rollno
        });
    }catch(e){
        return res.status(500).json({msg:"Could not fetch student details"});
    }
})

router.put("/done",validate(idQueryVal, "query"),async(req:Request,res:Response):Promise<any>=>{
    const id = req.query.id;
    try{
    await prisma.user.update({
        where:{
            id:String(id)
        },
        data:{
            parentAuth:false,
            adminAuth:false
        }
    })
        return res.status(200).json({msg:"Verified"});
    }catch(e){
        return res.status(400).json({msg:"An error occured"});
    }
})

export default router;