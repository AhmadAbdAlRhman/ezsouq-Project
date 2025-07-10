const User = require('../../models/users');
const mongoose = require('mongoose');

module.exports.getOneUser = async (req, res) => {
    const user_id = req.params.user_id;
    if (!mongoose.Types.ObjectId.isValid(user_id))
        return res.status(400).json({
            message: "معرّف غير صالح"
        });
    await User.findById(user_id).select('_id name email Role Location workplace work_type').then((user) => {
        if (!user)
            return res.status(404).json({message:"لا يوجد مثل هذا المستخدم"});
        return res.status(200).json(user);
    }).catch((err) => {
        res.status(500)
            .json({
                message: "Error Server",
                Error: err.details
            });
    });
}

module.exports.updateInformationUser = async (req, res) => {

}

