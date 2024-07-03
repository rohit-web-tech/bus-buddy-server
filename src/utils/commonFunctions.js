import Booking from "../models/booking.model.js";
import Schedule from "../models/sechdule.model.js";
import getDay from "./Day.js";

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
                            _id: 1,
                            busNumber: 1,
                            busName: 1,
                            busImage: 1,
                            totalSeats: 1,
                            busLayOut: 1,
                            busType: 1,
                            runningDays: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "routes",
                localField: "route",
                foreignField: "_id",
                as: "routeId",
                pipeline: [
                    {
                        $project: {
                            _id: 1
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
                routeId: {
                    $arrayElemAt: ["$routeId", 0]
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

    console.log(allSchedules)

    allSchedules = allSchedules.map(async (schedule) => {
        try {

            let totalFare = 0, routeVia = [], totalDistance = 0, route = [];

            if (!schedule || schedule?.route.length < 1) {
                return false;
            }

            const bookings = await Booking.find({ schedule: schedule._id, status: "BOOKED" });

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
                        routeId: schedule?.routeId,
                        totalDistance,
                        totalFare,
                        via: routeVia,
                        busDetails: schedule?.busDetails,
                        bookings
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

    console.log(allSchedules)

    allSchedules = await allSchedules.map(async (schedule) => {

        try {

            let totalFare = 0, routeVia = [], totalDistance = 0, bookedSeats = [];

            if (!schedule || schedule?.route.length < 1) {
                return false;
            }

            let today = (new Date(Date.now())).getDay();

            today = getDay(today);

            if (!schedule?.busDetails?.runningDays?.includes(today)) {
                console.log(schedule?.busDetails?.runningDays?.includes(today))
                return false;
            }

            let bookings = schedule?.bookings?.filter(booking => booking?.bookingDate?.toLocaleDateString() == (new Date(date)).toLocaleDateString());

            bookedSeats = bookings?.map(booking => booking?.seatNumber)

            const booking = {
                totalBookedSeats: bookings?.length,
                remainingSeats: schedule?.busDetails?.totalSeats - bookings?.length,
                bookedSeats
            }

            for (let i = 0; i < schedule.route.length; i++) {

                const startStation = (schedule?.route[i]?.startStation?.stationName).trim().toLowerCase();

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
                                departTime: schedule?.route[j]?.startStationDepartTime,
                                _id: schedule?.route[j]?.startStation?._id
                            },
                            endStation: {
                                stationName: endStation,
                                arrivalTime: schedule?.route[j]?.endStationArrivalTime,
                                _id: schedule?.route[j]?.endStation?._id
                            },
                            totalDistance,
                            totalFare,
                            via: routeVia,
                            busDetails: schedule.busDetails,
                            booking
                        };

                    }
                }

                return false;

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

const getBookingsAggregation = async () => {
    const bookings = await Booking.aggregate([
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
                from: "users",
                localField: "bookerId",
                foreignField: "_id",
                as: "booker",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullName: 1,
                            email: 1,
                            contactNumber: 1  
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                from: {
                    $arrayElemAt: ["$from", 0]
                },
                to: {
                    $arrayElemAt: ["$to", 0]
                },
                booker: {
                    $arrayElemAt: ["$booker", 0]
                }
            }
        },
        {
            $project: {
                _id: 1,
                schedule: 1,
                bookingDate: 1,
                passangerName: 1,
                passangerAge: 1,
                seatNumber: 1,
                status: 1,
                from: 1,
                to: 1,
                booker: 1
            }
        }
    ])

    return bookings ;
}

export {
    scheduleAggregation,
    getScheduleForARoute,
    getBookingsAggregation
}