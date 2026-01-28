import express from "express";


const workflowRouter = express.Router();
import {sendReminders} from "../workflow/workflow.controller.js"



workflowRouter.post("/",sendReminders);


export default workflowRouter;