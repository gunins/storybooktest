const hour = 60 * 60 * 1000;
const fullDay = hour * 24;

const {isInteger} = Number;

const getHours = (range = 2) => {
    const interval = hour * range;
    return (day, hour) => {
        if (!isInteger(day) || !isInteger(hour)) {
            throw new TypeError('Argument has to be a number');
        }
        if (hour < day || hour - day > fullDay) {
            throw new TypeError('Time should be in same day!');
        }
        if (hour <= 0) {
            throw new TypeError('Hour should be larger than 0');
        }
        return Math.round((day > 0 ? hour - day : hour) / interval) * interval;
    }
};

export {getHours};