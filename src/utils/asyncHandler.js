import ApiError from "./apiError.js";

const asyncHandler = (asyncFunction) => async (req,res,next) =>{
    try {
        await asyncFunction(req,res);
    } catch (error) {
        if(!res.headersSent){
            res.status(error.statusCode || 500) 
            .json (
                new ApiError(error.statusCode || 500 , error.message || "Internal server error!!")
            )
        }
    }
}

export default asyncHandler ;