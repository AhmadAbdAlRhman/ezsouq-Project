const expireTime = Date.now() + 1000 * 60 * 10;

const formatted = new Date(expireTime).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
});

console.log("ينتهي في:", formatted);