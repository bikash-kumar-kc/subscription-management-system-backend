import express from "express";


const AuthRoutes = express.Router();


AuthRoutes.post("/signup",async(res)=>res.send({message:"create account"}));
AuthRoutes.post("/signin",async(res)=>res.send({message:"welcome again"}));
AuthRoutes.post("/signout",async(res)=>res.send({message:"do visit again"}));


export default AuthRoutes;