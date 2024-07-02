import Schedule from "../models/sechdule.model.js";

const scheduleAggregation = async () => {
    let allSchedules = await Schedule.aggregate([
        {
            $lookup: {
                from: "segments",
                localField: "segmentTimings.segment",
                foreignField: "_id",
                as: "segment",
                pipeline: [
                    {
                        $lookup: {
                            from: "stations",
                            localField: "startStation",
                            foreignField: "_id",
                            as: "startStation",
                        }
                    },
                    {
                        $lookup: {
                            from: "stations",
                            localField: "endStation",
                            foreignField: "_id",
                            as: "endStation",
                        }
                    },
                    {
                        $addFields: {
                            startStation: {
                                $arrayElemAt: ["$startStation", 0]
                            },
                            endStation: {
                                $arrayElemAt: ["$endStation", 0]
                            }
                        }
                    }
                ],
            },
        },
        {
            $lookup: {
                from: "buses",
                localField: "bus",
                foreignField: "_id",
                as: "busDetails",
                pipeline: [
                    {
                        $project: {
                            _id:1,
                            busNumber:1,
                            busName : 1,
                            busImage: 1,
                            totalSeats: 1,
                            busLayOut : 1,
                            busType: 1,
                            runningDays: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                busDetails: {
                    $arrayElemAt: ["$busDetails", 0]
                },
                schedule: {
                    $map: {
                        input: "$segmentTimings",
                        as: "timing",
                        in: {
                            startStationArrivalTime: "$$timing.startStationArrivalTime",
                            startStationDepartTime: "$$timing.startStationDepartTime",
                            endStationArrivalTime: "$$timing.endStationArrivalTime",
                            endStationDepartTime: "$$timing.endStationDepartTime",
                            fare: "$$timing.fare"
                        }
                    },
                },
                route: {
                    $map: {
                        input: "$segment",
                        as: "segment",
                        in: {
                            startStation: "$$segment.startStation",
                            endStation: "$$segment.endStation",
                            distance: "$$segment.distance"
                        }
                    },
                }
            }
        }
    ]);

    allSchedules = await allSchedules.map(async (schedule) => {
        try {

            let totalFare = 0, routeVia = [], totalDistance = 0, route = [];

            if (!schedule || schedule?.route.length < 1) {
                return false;
            }

            const routeLenght = schedule.route.length;

            for (let j = 0; j < routeLenght; j++) {

                totalFare += schedule?.schedule[j]?.fare;

                totalDistance += schedule?.route[j]?.distance;

                let routeObj = {
                    startStation: schedule?.route[j]?.startStation,
                    endStation: schedule?.route[j]?.endStation,
                    startStationArrivalTime: schedule?.schedule[j]?.startStationArrivalTime,
                    startStationDepartTime: schedule?.schedule[j]?.startStationDepartTime,
                    endStationArrivalTime: schedule?.schedule[j]?.endStationArrivalTime,
                    endStationDepartTime: schedule?.schedule[j]?.endStationDepartTime,
                    fare: schedule?.schedule[j]?.fare,
                    distance: schedule?.route[j]?.distance
                }

                route.push(routeObj)

                routeVia.push(routeObj.endStation.stationName)

                if (j == routeLenght - 1) {

                    routeVia.pop()

                    return {
                        _id: schedule._id,
                        from: {
                            station: schedule?.route[0]?.startStation,
                            arrivalTime: schedule?.schedule[0]?.startStationArrivalTime,
                            departTime: schedule?.schedule[0]?.startStationDepartTime,
                        },
                        to: {
                            station: schedule?.route[routeLenght - 1]?.endStation,
                            arrivalTime: schedule?.schedule[routeLenght - 1]?.endStationArrivalTime,
                            departTime: schedule?.schedule[routeLenght - 1]?.endStationDepartTime,
                        },
                        route,
                        totalDistance,
                        totalFare,
                        via: routeVia,
                        busDetails: schedule.busDetails,
                    };

                }

            }

            return false;

        } catch (error) {

            console.log(error)

        }
    })

    return Promise.all(allSchedules).then((sechdules) => {

        sechdules = sechdules.filter(schedule => schedule)

        return sechdules;

    })
}

const getScheduleForARoute = async (start, destination, date) => {
    let allSchedules = await scheduleAggregation();

    allSchedules = await allSchedules.map(async (schedule) => {

        try {

            let totalFare = 0, routeVia = [], totalDistance = 0;

            if (!schedule || schedule?.route.length < 1) {
                return false;
            }

            for (let i = 0; i < schedule.route.length; i++) {

                const startStation = (schedule?.route[i]?.startStation?.stationName).trim().toLowerCase();

                console.log(startStation)

                if (startStation != start.toLowerCase().trim()) {
                    continue;
                }

                for (let j = i; j < schedule.route.length; j++) {

                    totalFare += schedule?.route[j]?.fare;

                    totalDistance += schedule?.route[j]?.distance;

                    const endStation = (schedule?.route[j]?.endStation?.stationName).trim().toLowerCase()

                    routeVia.push(endStation)

                    if (endStation == destination.trim().toLowerCase()) {

                        routeVia.pop()

                        return {
                            _id: schedule._id,
                            startStation: {
                                stationName: startStation,
                                departTime: schedule?.route[j]?.startStationDepartTime
                            },
                            endStation: {
                                stationName: endStation,
                                arrivalTime: schedule?.route[j]?.endStationArrivalTime
                            },
                            totalDistance,
                            totalFare,
                            via: routeVia,
                            busDetails: schedule.busDetails
                        };

                    }
                }

                return false;

            }

            return false;

        } catch (error) {

            // console.log(error)

        }

    })

    return Promise.all(allSchedules).then((sechdules) => {

        sechdules = sechdules.filter(schedule => schedule)

        return sechdules;

    })

}

export {
    scheduleAggregation,
    getScheduleForARoute
}