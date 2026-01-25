import express from "express";

const SubscriptionRoutes = express.Router();


SubscriptionRoutes.get("/",async(res)=>res.send({message:"Get all subscriptions"}));
SubscriptionRoutes.get("/:id",async(res)=>res.send({message:"Get a subscription"}));
SubscriptionRoutes.post("/",async(res)=>res.send({message:"Create a subscription"}));
SubscriptionRoutes.put("/:id",async(res)=>res.send({message:"Update a subscription"}));
SubscriptionRoutes.delete("/:id",async(res)=>res.send({message:"Delete a subscription"}));
SubscriptionRoutes.get("/user/:id",async(res)=>res.send({message:"Get subscription of a user"}));
SubscriptionRoutes.put("/user/cancel",async(res)=>res.send({message:"Cancel a subscription"}));
SubscriptionRoutes.get("/upcomming-renewals",async(res)=>res.send({message:"Get all upcomming renewels"}));


export default SubscriptionRoutes;


