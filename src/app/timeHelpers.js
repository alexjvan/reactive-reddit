export function daysFrom(date) {
    return daysBetween(new Date(date), new Date());
}

function daysBetween(left, right) {
    return right.getDate() - left.getDate();
}