import {config as conf} from "dotenv";
conf();


const _config = {
    PORT:process.env.PORT,
    NODE_ENV:process.env.NODE_ENV,
    MONGO_DB:process.env.MONGO_DB,
};

export const config = Object.freeze(_config);
