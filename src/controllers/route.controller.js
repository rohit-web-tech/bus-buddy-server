import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import BusRoute from "../models/route.model.js";
import Segment from "../models/segment.model.js";
import mongoose from "mongoose";

const addRouteController = asyncHandler(async (req, res) => {
    const { from, to, segmentsArray, totalFare } = req.body;
    let totalDistance = 0;

    if (!from || !to || !segmentsArray || !totalFare) {
        throw new ApiError(400, "All feilds are required!!");
    }

    if (!Array.isArray(segmentsArray) || !segmentsArray.length) {
        throw new ApiError(400, "Route details are incomplete!!");
    }

    if (segmentsArray[0]?.startStation !== from || segmentsArray[segmentsArray.length - 1]?.endStation !== to) {
        throw new ApiError(400, "Route details are incomplete!!")
    }
    
    const routeSegemntsArray = segmentsArray.map(async (segment) => {
        if (!segment || !segment.startStation || !segment.endStation || !segment.distance) {
            throw new ApiError(400, "Route details are incomplete!!")
        }

        totalDistance += segment.distance;

        const newSegment = await Segment.create({
            startStation: segment.startStation,
            endStation: segment.endStation,
            distance: segment.distance
        })

        return newSegment.save();
    })

    Promise.all(routeSegemntsArray).then(async (response) => {
        try {
            const segments = response.map(seperateSegmemnt => seperateSegmemnt?._id)

            const newRoute = await BusRoute.create({
                from,
                to,
                segments,
                totalDistance,
                totalFare
            })

            await newRoute.save();
            if (!res.headersSent) {
                res.status(200).json(
                    new ApiResponse(200, newRoute, "All Set !!")
                )
            }
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json(
                    new ApiError(500, error._message || "Something went wrong")
                )
            }
        }

    }).catch(error => {
        if (!res.headersSent) {
            res.status(500).json(
                new ApiError(500, error._message || "Something went wrong")
            )
        }
    })

})

const editRouteController = asyncHandler(async (req, res) => {
    const { from, to, segmentsArray, totalFare, routeId } = req.body;
    let totalDistance = 0;

    if (!from || !to || !segmentsArray || !totalFare) {
        throw new ApiError(400, "All feilds are required!!");
    }

    if (!Array.isArray(segmentsArray) || !segmentsArray.length) {
        throw new ApiError(400, "Route details are incomplete!!");
    }

    if (segmentsArray[0]?.startStation !== from || segmentsArray[segmentsArray.length - 1]?.endStation !== to) {
        throw new ApiError(400, "Route details are incomplete!!")
    }

    const existingRoute = await BusRoute.findById(routeId);

    if (!existingRoute) {
        throw new ApiError(400, "No such route found!!");
    }

    const deleteSegmentsArray = existingRoute.segments.map(async (segment) => {
        return Segment.findByIdAndDelete(
            segment
        );
    })

    const routeSegemntsArray = segmentsArray.map(async (segment) => {
        if (!segment || !segment.startStation || !segment.endStation || !segment.distance) {
            throw new ApiError(400, "Route details are incomplete!!")
        }

        totalDistance += segment.distance;

        const newSegment = await Segment.create({
            startStation: segment.startStation,
            endStation: segment.endStation,
            distance: segment.distance
        })

        return newSegment.save();
    })

    Promise.all([...routeSegemntsArray, ...deleteSegmentsArray]).then(async (response) => {
        try {
            let segments = response.map(seperateSegmemnt => seperateSegmemnt?._id)

            segments = segments.filter(segment => !!segment)

            const newRoute = await BusRoute.findByIdAndUpdate(
                routeId,
                {
                    $set: {
                        from,
                        to,
                        segments,
                        totalDistance,
                        totalFare
                    }
                },
                {
                    new: true
                }
            )

            await newRoute.save();
            if (!res.headersSent) {
                res.status(200).json(
                    new ApiResponse(200, newRoute, "Route updated successfully !!")
                )
            }
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json(
                    new ApiError(500, error._message || "Something went wrong")
                )
            }
        }
    }).catch(error => {
        if (!res.headersSent) {
            res.status(500).json(
                new ApiError(error.statusCode || 500, error._message || error.message || "Something went wrong")
            )
        }
    })

})

const deleteRouteController = asyncHandler(async (req, res) => {
    const { routeId } = req.body;

    const existingRoute = await BusRoute.findById(routeId);

    if (!existingRoute) {
        throw new ApiError(400, "No such route found!!");
    }

    const deleteSegmentsArray = existingRoute.segments.map(async (segment) => {
        return Segment.findByIdAndDelete(
            segment
        );
    })

    Promise.all(deleteSegmentsArray).then(async () => {
        try {
            await BusRoute.findByIdAndDelete(routeId);
            if (!res.headersSent) {
                res.status(200).json(
                    new ApiResponse(200, {}, "Route deleted successfully!!")
                )
            }
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json(
                    new ApiError(500, error._message || "Something went wrong")
                )
            }
        }
    }).catch(error => {
        if (!res.headersSent) {
            res.status(500).json(
                new ApiError(error.statusCode || 500, error._message || error.message || "Something went wrong")
            )
        }
    })
})

const getAllRoutesController = asyncHandler(async (_, res) => {
    let allRoutesData = await BusRoute.aggregate([
        {
            $lookup: {
                from: "stations",
                localField: "from",
                foreignField: "_id",
                as: "from"
            }
        },
        {
            $lookup: {
                from: "stations",
                localField: "to",
                foreignField: "_id",
                as: "to"
            }
        },
        {
            $lookup: {
                from: "segments",
                localField: "segments",
                foreignField: "_id",
                as: "route",
                pipeline: [
                    {
                        $lookup: {
                            from: "stations",
                            localField: "startStation",
                            foreignField: "_id",
                            as: "startStation",
                            pipeline: [
                                {
                                    $project: {
                                        stationName: 1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $lookup: {
                            from: "stations",
                            localField: "endStation",
                            foreignField: "_id",
                            as: "endStation",
                            pipeline: [
                                {
                                    $project: {
                                        stationName: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            "startStation": {
                                $arrayElemAt: ["$startStation", 0]
                            },
                            "startStation": {
                                $arrayElemAt: ["$startStation.stationName", 0]
                            },
                            "endStation": {
                                $arrayElemAt: ["$endStation", 0]
                            },
                            "endStation": {
                                $arrayElemAt: ["$endStation.stationName", 0]
                            }
                        }
                    },
                    {
                        $project: {
                            startStation: 1,
                            endStation: 1,
                            distance: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                "from": {
                    $arrayElemAt: ["$from", 0]
                },
                "from": {
                    $arrayElemAt: ["$from.stationName", 0]
                },
                "to": {
                    $arrayElemAt: ["$to", 0]
                },
                "to": {
                    $arrayElemAt: ["$to.stationName", 0]
                }
            }
        },
        {
            $project: {
                from: 1,
                to: 1,
                totalDistance: 1,
                totalFare: 1,
                route: 1
            }
        }
    ])

    allRoutesData = allRoutesData.filter(obj => obj?.from && obj?.to && obj?.route?.length > 0);

    res
        .status(200)
        .json(
            new ApiResponse(200, allRoutesData, "Routes data fetched successfully!!")
        )
})

const getRouteDetailsController = asyncHandler(async (req, res) => {
    const { routeId } = req.body;

    if (!routeId) {
        throw new ApiError(400, "Route id is required!!");
    }

    const routeDetails = await BusRoute.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(routeId)
            }
        },
        {
            $lookup: {
                from: "stations",
                localField: "from",
                foreignField: "_id",
                as: "from"
            }
        },
        {
            $lookup: {
                from: "stations",
                localField: "to",
                foreignField: "_id",
                as: "to"
            }
        },
        {
            $lookup: {
                from: "segments",
                localField: "segments",
                foreignField: "_id",
                as: "route",
                pipeline: [
                    {
                        $lookup: {
                            from: "stations",
                            localField: "startStation",
                            foreignField: "_id",
                            as: "startStation",
                            pipeline: [
                                {
                                    $project: {
                                        stationName: 1
                                    }
                                }
                            ]
                        },
                    },
                    {
                        $lookup: {
                            from: "stations",
                            localField: "endStation",
                            foreignField: "_id",
                            as: "endStation",
                            pipeline: [
                                {
                                    $project: {
                                        stationName: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            "startStation": {
                                $arrayElemAt: ["$startStation", 0]
                            },
                            "startStation": {
                                $arrayElemAt: ["$startStation.stationName", 0]
                            },
                            "endStation": {
                                $arrayElemAt: ["$endStation", 0]
                            },
                            "endStation": {
                                $arrayElemAt: ["$endStation.stationName", 0]
                            }
                        }
                    },
                    {
                        $project: {
                            startStation: 1,
                            endStation: 1,
                            distance: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                "from": {
                    $arrayElemAt: ["$from", 0]
                },
                "from": {
                    $arrayElemAt: ["$from.stationName", 0]
                },
                "to": {
                    $arrayElemAt: ["$to", 0]
                },
                "to": {
                    $arrayElemAt: ["$to.stationName", 0]
                }
            }
        },
        {
            $project: {
                from: 1,
                to: 1,
                totalDistance: 1,
                totalFare: 1,
                route: 1
            }
        }
    ])

    if(routeDetails.length<=0){
        throw new ApiError(400,"No such route is found!!");
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,routeDetails[0],"Route details fetched successfully!!")
    )

})

export {
    addRouteController,
    editRouteController,
    deleteRouteController,
    getAllRoutesController,
    getRouteDetailsController
};