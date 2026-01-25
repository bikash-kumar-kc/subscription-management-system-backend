import express from "express";

const UserRoutes = express.Router();


UserRoutes.get("/",async(res)=>res.send({message:"Get all users"}));
UserRoutes.get("/:id",async(res)=>res.send({message:"Get a user"}));
UserRoutes.post("/",async(res)=>res.send({message:"To create a new user"}));
UserRoutes.put("/:id",async(res)=>res.send({message:"Update a user"}));
UserRoutes.delete("/:id",async(res)=>res.send({message:"Delete a user"}));

export default UserRoutes;
