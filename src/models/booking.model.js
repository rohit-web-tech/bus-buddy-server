import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    schedule: {
        type: mongoose.Schema.ObjectId,
        ref: 'Schedule', 
        required: true
    },
    from : {
        type: mongoose.Schema.ObjectId,
        ref: "Station",
        required: true
    },
    to : {
        type: mongoose.Schema.ObjectId,
        ref: "Station",
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    passangerName: {
        type: String,
        required: true
    },
    passangerAge: {
        type: Number,
        required: true
    },
    bookerId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    seatNumber: {
        type: Number,
        required: true
    }
}, {
    timeStamps: true
})

bookingSchema.index({ schedule: 1, seatNumber: 1, bookingDate: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;