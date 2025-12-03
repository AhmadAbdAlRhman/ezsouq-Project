const cleanPhone = (phone) => {
    let CP = phone ? phone.toString().replace(/[^0-9]/g, '') : null;
    if (CP.startsWith('09')) {
        CP = '963' + CP.slice(1);
    } else if (CP.startsWith('9')) {
        CP = '963' + CP;
    }
    return CP;
}

module.exports = {
    cleanPhone
};