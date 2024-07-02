import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// created user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    contactNumber : {
        type : Number ,
        required : true 
    },
    isVerified : { 
        default : false ,
        type : Boolean 
    },
    refreshToken: {
        type: String,
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordTokenExpiry: {
        type: Date
    },
    emailVerificationToken: {
        type: String,
    },
    emailTokenExpiry: {
        type: Date
    },
    role : {
        type : String ,
        required : true ,
        enum : ["Passanger","Admin"],
        default : "Passanger"
    }
}, {
    timestamps: true
});

//middlewares : 

//hashing the password before saving it
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next();
})

// comparing the hashed password with incoming password
userSchema.methods.IsPasswordCorrect = async function (newPassword) {
    return await bcrypt.compare(newPassword, this.password);
}

// creating access token 
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// creating refresh token 
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


// created an user model using mongoose schema
const user = mongoose.model("User", userSchema);

export default user;