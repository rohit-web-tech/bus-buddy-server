import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser" ;
import dotenv from "dotenv" ;
dotenv.config({})

const app = express();

app.use(express.json({limit:"16kb"}));
app.use(cors({
    origin : process.env.ORIGIN ,
    credentials : true 
}))
app.use(express.urlencoded({limit:"16kb",extended:true}));
app.use(cookieParser());
app.use(express.static("public"))

export default app ;