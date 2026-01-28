import { Client as WorkflowClient } from "@upstash/workflow";
import { config } from "../config/config.js";


export const workflowClient = new WorkflowClient({
    baseUrl:config.QSTASH_URL,
    token:config.QSTASH_TOKEN,
});