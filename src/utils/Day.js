const dayArray = ["Sunday" ,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

const getDay = (dayNumber) => {
    if(dayNumber < 0 || dayNumber > 6) {
        return null ;
    }
    return dayArray[dayNumber]
}

export default getDay ;