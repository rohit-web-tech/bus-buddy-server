import app from "./app.js";
import dotenv from "dotenv";
import connectDb from "./dbconfig.js";

dotenv.config("../.env");

app.get("/",(req,res)=>{
    res.send("<h1>Hello from BusBuddy server</h1>")
})

connectDb().then(()=>{
    app.listen(process.env.PORT || 8080 , ()=>{
        console.log(`Server is listening on port : ${process.env.PORT || 8080}`)
    })
})

// routes 
import userRouter from "./routes/user.route.js";
import busRouter from "./routes/bus.route.js";
import BusRouteRouter from "./routes/busRoute.route.js";
import stationRouter from "./routes/station.route.js";
import scheduleRouter from "./routes/schedule.route.js";

app.use("/api/user",userRouter);
app.use("/api/bus",busRouter);
app.use("/api/route",BusRouteRouter);
app.use("/api/station",stationRouter);
app.use("/api/schedule",scheduleRouter);