const buildDateFilter = (range, from ,to) => {
    if (range === 'today'){
        const start = new Date(); start.setHours(0,0,0,0);
        const end = new Date(); end.setHours(23,59,59,999);
        return {createdAt: {$gte: start, $lte: end}};
    }
    if (range === 'month'){
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0,0,0,0);
        const end = new Date(now.getFullYear(), now.getMonth(), 1, 0,23,59,59,999);
        return {createdAt: {$gte: start, $lte: end}};
    }
    if(from || to){
        const first = from ? new Date(from) : new Date('2025-01-01');
        const last = to ? new Date(to) : new Date();
        return {createdAt: {$gte: first, $lte: last}};
    }
    return {};
}

module.exports = buildDateFilter;