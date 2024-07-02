import mongoose from "mongoose";

const busSchema = new mongoose.Schema({
    busNumber: {
        type: String,
        required: [true, "Bus number is required"]
    },
    busName: {
        type: String,
        required: [true, "Bus name is required!!"]
    },
    busImage : {
        type : String ,
        required : true
    },
    totalSeats: {
        type: Number,
        required: [true, "Total seats are required"]
    },
    busLayOut: {
        type: String,
        enum : ["2 X 2","2 X 3","3 X 3"]
    },
    busType : {
        type : String, 
        enum : ["AC","ORDINARY","DELUX","SEMI DELUX"],
        required : true 
    },
    routes:[
        {
            type : mongoose.Schema.ObjectId,
            ref : "Route" 
        }
    ],
    runningDays: {
        type : Array ,
        require : true ,
        default : ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    },
    isActive : {
        type : Boolean ,
        required : true ,
        default : false
    }
}, {
    timestamps: true
})

const Bus = mongoose.model("Bus", busSchema);

export default Bus; 