export default class ApiError extends Error{
    constructor(
        statusCode ,
        message = "Something went wrong!!",
        errors = [],
    ){
        super(message);
        this.message = message ;
        this.statusCode = statusCode ;
        this.errors = errors ;
        this.success = false ;
    }

    toJSON(){
        return {
            statusCode : this.statusCode ,
            message : this.message ,
            success : this.success ,
            errors : this.errors ,
        }
    }
}