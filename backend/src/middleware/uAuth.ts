import express,{Response,Request,NextFunction} from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
interface PayLoad{
    id : string
}
declare module "express-serve-static-core" {
    interface Request {
      userId?: string;
    }
  }

function uAuth(req:Request,res:Response,next:NextFunction){
    try{
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    if(!token){
        res.status(401).json({e:"Missing token"});
        return;
    }
    
    const decoded = jwt.verify(token,JWT_SECRET) as PayLoad;
    if(!decoded){
        res.status(403).json({e:"eror"});
        return;
    }
    req.userId = decoded.id;
    next();
    }catch(e){
        res.status(403).json({e:e});
        return;
    }
    
}
export default uAuth;
