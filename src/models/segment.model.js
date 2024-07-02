import mongoose from "mongoose" ;

const segmentSchema = new mongoose.Schema({
    startStation: {
        type: mongoose.Schema.ObjectId,
        ref: 'Station',
        required: true
    },
    endStation: {
        type: mongoose.Schema.ObjectId,
        ref: 'Station',
        required: true
    },
    distance: {
        type: Number,
        required: true
    }
},{
    timestamps : true 
})

const Segment = mongoose.model("Segment",segmentSchema);

export default Segment ;