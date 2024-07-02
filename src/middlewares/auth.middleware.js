import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";

const auth = async (req, res, next) => {

    try {
        // step 1 : getting access token from either cookies or req.header
        const accessToken = req?.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "") ;

        // step 2 : checking that is there any accesstoken or not
        if (!accessToken) {
            throw new ApiError(401, "Unauthentic")
        }
    
        // step 3 : decoding accesstoiken to get user's mongodb id
        const userId = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    
        // step 4 : checking whether there is any user in mongodb with the above id or not
        const user = await User.findOne({
            _id: userId
        }).select("-password -emailVerificationToken -emailTokenExpiry")
    
        if (!user) {
            throw new ApiError(401, "Unauthentic")
        }
    
        // step 5 : if we got an user with that id it means user is authetic so setting a key user in req and passing user data to it
        req.user = user;
    
        // step 6 : calling next to passing control to next controller or middleware
        next();
    } catch (error) {
        res.status(error.statusCode || 500) 
        .json (
            new ApiError(error.statusCode || 500 , error.message || "Internal server error!!")
        )
    }
}

export default auth;