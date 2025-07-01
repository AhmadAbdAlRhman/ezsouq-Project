const Governorates = require('../../models/Governorates');
module.exports.addGovernorates = async (req, res) => {
    console.log(req.body);
    const name = req.body.name;
    const cities = req.body.cities;
    if (!name)
        return res.status(404).json({
            message: "الرجاء إدخال اسم المحافظة"
        });
    await Governorates.findOne({
        name
    }).then(async (gov) => {
        if (gov)
            return res.status(409).json({
                message: "..توجد هذه المحافظة"
            })
        else {
            const governorate = new Governorates({
                name,
                cities
            });
            await governorate.save();
            res.status(201).json({
                message: 'تمت إضافة المحافظة بنجاح.',
                governorate
            });
        }
    }).catch((err) => {
        res.status(500).json({
            message: 'حدث خطأ أثناء الإضافة.',
            error: err.message
        });
    })

}