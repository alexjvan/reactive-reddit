export function daysFrom(date) {
    return daysBetween(new Date(date), new Date());
}

function daysBetween(left, right) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    return Math.floor((right - left) / MS_PER_DAY);
}