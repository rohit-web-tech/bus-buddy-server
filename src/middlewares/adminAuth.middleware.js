import ApiError from "../utils/apiError.js"

export default async (req,res,next) => {
    try {
        console.log(req.user?.role)
        if(req.user?.role !== "Admin"){
            throw new ApiError(401,"You are not an admin!!");
        }
        next();
    } catch (error) {
        res
        .status(error.statusCode || 500)
        .json(
            new ApiError(error.statusCode || 500 , error.message || "Internal server error!!")
        )
    }
}