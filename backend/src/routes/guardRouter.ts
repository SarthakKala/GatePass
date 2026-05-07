import express, {Request, Response} from "express";
const router = express.Router();
import { prisma } from "../db";
import { validate } from "../middleware/validate";
import { idQueryVal } from "../lib/validators/guardValidator";

router.put("/done",validate(idQueryVal, "query"),async(req:Request,res:Response):Promise<any>=>{
    const id = req.query.id;
    try{
    const user = await prisma.user.update({
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