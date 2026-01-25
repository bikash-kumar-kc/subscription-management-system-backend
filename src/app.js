import express from "express";

const app = express();


app.get("/",(res)=>{
   return res.send("Welcome to subscription management system !!");
});


export default app;


