import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.ObjectId,
        ref: "Station",
        required: true
    },
    to: {
        type: mongoose.Schema.ObjectId,
        ref: "Station",
        required: true
    },
    segments: [{
        type : mongoose.Schema.ObjectId,
        ref : "Segment"
    }],
    totalDistance: {
        type: Number,
        required: true
    },
    totalFare : {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

const BusRoute = mongoose.model("Route",routeSchema); 

export default BusRoute ;