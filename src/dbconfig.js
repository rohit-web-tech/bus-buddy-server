import mongoose from "mongoose" ;

const connectDb = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DB_URI}/BusBooking`) ;
        console.log(`DB connected successfully to the host : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log(`DB connection failed due to \n ${error}`)
        process.exit(1);
    }
}

export default connectDb ;