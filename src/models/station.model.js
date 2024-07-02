import mongoose from "mongoose";

const stationSchema = new mongoose.Schema({
    stationName : {
        type : String ,
        required : true 
    },
    stationNumber : {
        type : Number ,
        required : true 
    }
},{
    timeStamps : true 
})

const Station = mongoose.model("Station",stationSchema);

export default Station ;