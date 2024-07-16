import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";
import { v4 as uuidv4 } from 'uuid';
import { sendProfileVerificationEmail, sendForgetPasswordEmail} from "../utils/EmailSender.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const signUpUserController = asyncHandler(async (req, res) => {
    const { fullName, password, email , contactNumber} = req.body;

    if ( !fullName || !password || !email || !contactNumber) {
        throw new ApiError(400, "All feilds are required!!");
    }
    
    const emailCheck = await User.findOne({
        email,
        $or: [{ isVerified: true }, { emailTokenExpiry: { $gt: Date.now() } }]
    })

    if (emailCheck) {
        throw new ApiError(400, "User already exist with same email id!!")
    }

    const newUser = await User.create({
        email,
        password,
        fullName ,
        contactNumber
    })

    const verificationToken = await uuidv4();

    await sendProfileVerificationEmail(email, fullName, verificationToken)
    newUser.emailVerificationToken = verificationToken;
    newUser.emailTokenExpiry = Date.now() + 7200000;
    await newUser.save();
    res
        .status(201)
        .json(
            new ApiResponse(201, {}, "Verification email sent successfully!!")
        )
})

const verifyEmailController = asyncHandler(async (req, res) => {
    const { verificationToken } = req.body;

    const user = await User.findOne({
        emailVerificationToken: verificationToken,
        emailTokenExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(401, "Token is either invalid or expired")
    }

    if (user.isVerified) {
        throw new ApiError(400, "Already verified!!")
    }

    user.isVerified = true;
    user.emailTokenExpiry = Date.now();

    await user.save();

    res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Verification successful!!")
        )
})

const loginUserController = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required!!");
    }

    const user = await User.findOne({
        $and: [
            {
                email : email
            },
            {
                $or: [{ isVerified: true }, { emailTokenExpiry: { $gt: Date.now() } }]
            }
        ]
    }).select("-emailTokenExpiry -emailVerificationToken -forgotPasswordToken -forgotPasswordTokenExpiry -refreshToken")

    if (!user) {
        throw new ApiError(400, "User doesn't exist!!")
    }
    
    if (!(user.isVerified)) {
        throw new ApiError(400, "Please verify your account first!!")
    }

    const isCorrect = await user.IsPasswordCorrect(password);

    if (!isCorrect) {
        throw new ApiError(401, "Please login with right credential!!")
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    const options = {
        httpOnly: true,
        secure: true,
    }

    user.refreshToken = refreshToken;

    await user.save();

    res
        .status(200)
        .cookie("AccessToken", accessToken, options)
        .cookie("RefreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user:{
                    ...user._doc,
                    password : ""
                },
                accessToken,
                refreshToken
            }, "User logged in successfully!!")
        )

})

const logoutUserController = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        {
            _id: req?.user?._id
        },
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res
        .status(200)
        .clearCookie("AccessToken", "", options)
        .clearCookie("RefreshToken", "", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully!!")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies.RefreshToken || req.body?.refreshToken;

    if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required!!")
    }

    const decodedInfo = await jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedInfo?._id);

    if (!user) {
        throw new ApiError(401, "Unauthentic")
    }

    if (refreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Token is expired or used !!")
    }

    const newRefreshToken = await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();

    user.refreshToken = newRefreshToken;

    await user.save();

    const options = {
        httpOnly: true,
        secure: true
    }

    res
        .status(200)
        .cookie("AccessToken", accessToken, options)
        .cookie("RefreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, {
                accessToken,
                refreshToken: newRefreshToken
            }, "Access Token Refreshed successfully!!")
        )

})

const changePasswordController = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "All feilds are required!!")
    }

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.IsPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Wrong password!!")
    }

    user.password = newPassword;

    await user.save();

    res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully")
        )
})

const forgotPasswordController = asyncHandler(async (req, res) => {

    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({email})

    if (!user) {
        throw new ApiError(401, "No user found with such credentials !!")
    }

    const verificationToken = await uuidv4();

    await sendForgetPasswordEmail(user?.email, user?.fullName, verificationToken);

    user.forgotPasswordToken = verificationToken;
    user.forgotPasswordTokenExpiry = Date.now() + 7200000;

    await user.save();

    res
        .status(201)
        .json(
            new ApiResponse(201, {}, `Reset password mail sent successfully to your email id : ${user?.email}`)
        )
})

const updatePasswordController = asyncHandler(async (req, res) => {

    const { verificationToken, password } = req.body;

    if (!verificationToken) {
        throw new ApiError(401, "Verification token is required!!")
    }

    if (!password) {
        throw new ApiError(400, "Password is required!!")
    }

    const user = await User.findOne({
        forgotPasswordToken: verificationToken,
        forgotPasswordTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(401, "Token is either expired or invalid")
    }

    user.password = password;
    user.forgotPasswordTokenExpiry = Date.now();

    await user.save();

    res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully!!")
        )
})

const getCurrentUserController = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: req.user?._id
            }
        },
        {
            $lookup: {
                from: "bookings",
                localField: "_id",
                foreignField: "bookerId",
                as: "booking"
            }
        },
        {
            $addFields: {
                bookingsCount: {
                    $size: "$booking"
                }
            }
        },
        {
            $project: {
                email: 1,
                fullName: 1,
                contactNumber : 1 ,
                role : 1 ,
                bookingsCount : 1
            }
        }
    ])

    res
        .status(200)
        .json(
            new ApiResponse(200, user[0], "User fetched successfully!!")
        )
})

const updateProfileController = asyncHandler(async(req,res)=>{
    const { fullName , contactNumber} = req.body;

    if ( !fullName || !contactNumber) {
        throw new ApiError(400, "All feilds are required!!");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName , 
                contactNumber
            }
        },
        {
            new : true 
        }
    ).select("fullName contactNumber")

    res
        .status(201)
        .json(
            new ApiResponse(201, user , "Verification email sent successfully!!")
        )
})

export {
    signUpUserController,
    verifyEmailController,
    loginUserController,
    logoutUserController,
    refreshAccessToken,
    changePasswordController,
    forgotPasswordController,
    updatePasswordController,
    getCurrentUserController,
    updateProfileController
}