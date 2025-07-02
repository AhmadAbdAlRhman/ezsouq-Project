const Governorates = require('../../models/Governorates');
module.exports.addGovernorates = async (req, res) => {
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

module.exports.updateGovernorate = async (req, res) => {
    const gov_id = req.params.gov_id;
    const name = req.body.name;
    const cities = req.body.cities;
    await Governorates.findByIdAndUpdate({
        _id: gov_id
    }, {
        name,
        cities
    }, {
        new: true,
        runValidators: true
    }).then((update) => {
        if (!update)
            return res.status(404).json({message:"المحافظة غير موجودة"});
        return res.status(200).json({
            message:"تم تحديث البيانات بنجاح",
            governorate: update
        });
    }).catch((err)=>{
        return res.status(500).json({
            message:"حدث خطأ خلال تحديث البيانات لهذه المحافظة",
            error: err.message
        });
    });
}