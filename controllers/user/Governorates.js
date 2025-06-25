const Governorates = require('../../models/Governorates');

module.exports.getAllgovernorates = async (req, res) => {
    await Governorates.find().then((governorates) => {
        if (!governorates)
            return res.status(404).json({
                message: "لا يوجد أي محافظة بالداتا"
            });
        res.status(200).json(governorates);
    }).catch((err) => {
        res.status(500).json({
            message: err.message
        });
    });
}

module.exports.getAllCities = async (req, res) => {
    const name = req.body.name;
    await Governorates.findOne({
        name
    }).then((gov) => {
        if (!gov)
            return res.status(404).json({
                message: "لا توجد مثل هذه المحافظة"
            });
        return res.status(200).json(gov.cities);
    }).catch((err) => {
        res.status(500).json({
            message: err.message
        });
    })
}