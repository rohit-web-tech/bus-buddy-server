import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    segmentTimings: [{
        segment : {
            type : mongoose.Schema.ObjectId,
            ref : "Segment"
        },
        startStationArrivalTime: {
            type: String,
            required: true
        },
        startStationDepartTime: {
            type: String,
            required: true
        },
        endStationArrivalTime: {
            type: String,
            required: true
        },
        endStationDepartTime: {
            type: String,
            required: true
        },
        fare : {
            type : Number ,
            required : true 
        }
    }],
    bus: {
        type: mongoose.Schema.ObjectId,
        ref: "Bus" ,
        required : true
    },
    route: {
        type: mongoose.Schema.ObjectId,
        ref: "Route",
        required : true
    }
}, {
    timestamps: true
})

const Schedule = mongoose.model("Schedule",scheduleSchema);

export default Schedule ;