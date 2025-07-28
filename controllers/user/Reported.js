const Report = require('../../models/Report');
module.exports.reportProducts = async (req, res) => {
    try {
        const {
            productId,
            reason,
            message
        } = req.body;
        const userId = req.user.id;
        const newReport = new Report({
            product: productId,
            reported_By: userId,
            reason,
            message
        });
        await newReport.save();
        res.status(201).json({
            message: 'تم اإبلاغ عن المنتج بنجاح'
        });
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ أثناء الإبلاغ",
            error: err.message
        });
    }
}

module.exports.get_all_reportedProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;
        const total = await Report.countDocuments();
        const reports = await Report.find()
            .populate('product', 'id name')
            .populate('reported_By', 'id name')
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit);
        return res.status(200).json({
            total,
            page,
            pages: Math.ceil(total / limit),
            count: reports.length,
            reports
        });
    } catch (err) {
        return res.status(500).json({
            message: "حدث خطأ أثناء جلب الإبلاغات",
            Error: err.message
        });
    }
}

module.exports.get_one_reporte = async (req, res) => {
    try {
        const reportId = req.params.reporteId;
        const report = await Report.findById(reportId)
            .populate('product', 'id name')
            .populate('reported_By', 'id name')
        return res.status(200).json({
            report
        });
    } catch (err) {
        return res.status(500).json({
            message: "حدث خطأ أثناء جلب الإبلاغ",
            Error: err.message
        });
    }
}

module.exports.delete_reporte = async (req, res) => {
    try {
        const reportId = req.params.reporteId;
        const deleted = await Report.findByIdAndDelete(reportId)
            .populate('product', 'id name')
            .populate('reported_By', 'id name')
        if (!deleted)
            return res.status(404).json({
                message: 'لم يتم العثور على التعليق'
            });
        return res.status(200).json({
            message: 'تم حذف الإبلاغ بنجاح'
        });
    } catch (err) {
        return res.status(500).json({
            message: "حدث خطأ أثناء حذف الإبلاغ",
            Error: err.message
        });
    }
}

module.exports.update_reporte = async (req, res) => {
    try {
        const reportedId = req.params.reporteId;
        const reason = req.body.reason;
        const message = req.body.message;
        const report = await Report.findById(reportedId);
        if (!report)
            return res.status(404).json({
                message: "الإبلاغ غير موجود"
            })
        const updatedreport = await Report.findByIdAndUpdate(reportedId, {
            reason,
            message
        }, {
            new: true,
            runValidators: true
        })
        return res.status(200).json({
            message: "تم تعديل الإبلاغ بنجاح",
            data: updatedreport
        })
    } catch (err) {
        return res.status(500).json({
            message: "حدث خطأ أثناء تعديل الإبلاغ",
            Error: err.message
        })
    }
}