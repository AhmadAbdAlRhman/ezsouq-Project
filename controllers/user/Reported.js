const Report = require('../../models/Report');

module.exports.report = async (req, res) => {
    try {
        const reporter = req.user.id;
        const reportedUser = req.body.reported_user;
        const reason = req.body.reason;
        const details = req.body.details;
        if (reportedUser === reporter.toString()) {
            return res.status(400).json({
                message: "لا يمكنك الإبلاغ عن نفسك"
            });
        }
        const newReport = new Report({
            reporter,
            reported: reportedUser,
            reason,
            details
        });
        await newReport.save();
        res.status(201).json({
            message: "تم إرسال البلاغ",
            report: newReport
        });
    } catch (err) {
        res.status(500).json({
            message: 'حدث خطأ أثناء الإبلاغ',
            error: err.message
        })
    }
}

module.exports.get_all_reported = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;
        const total = await Report.countDocuments();
        const reports = await Report.find()
            .populate('reporter', 'id name avatar email')
            .populate('reported', 'id name avatar email')
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
            .populate('reporter', 'id name avatar email')
            .populate('reported', 'id name avatar email')
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
            .populate('reporter', 'id name avatar email')
            .populate('reported', 'id name avatar email')
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
        const details = req.body.message;
        const report = await Report.findById(reportedId);
        if (!report)
            return res.status(404).json({
                message: "الإبلاغ غير موجود"
            })
        const updatedreport = await Report.findByIdAndUpdate(reportedId, {
            reason,
            details
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

module.exports.search_about_Report = async (req, res) => {
    try{
        const status  = req.query.status;
        const search  = req.query.search;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        let query = {};
        if (status) {
            query.status = status;
        }
        if(search){
            query.$or = [
                { "reporter.name": { $regex: search, $options: "i" } },
                { "reported.name": { $regex: search, $options: "i" } },
                { reason: { $regex: search, $options: "i" } },
                { details: { $regex: search, $options: "i" } }
            ];
        }
        let reportsQuery = Report.find(query)
            .populate("reporter", "_id name email avatar")
            .populate("reported", "_id name email avatar")
            .sort({ createdAt: -1 });
        let totalReports = await Report.countDocuments(query);
        reportsQuery = reportsQuery
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
        const reports = await reportsQuery;
        res.json({
            total: totalReports ,
            page: parseInt(page),
            limit: parseInt(limit),
            data: reports
        });
    }catch(err){
        return res.status(500).json({
            message:"حدث خطأ أثناء البحث",
            Error: err.message
        })
    }
}

module.exports.changeStatus = async (req, res) => {
    try{
        const reportId = req.params.id;
        const newStatus = req.body.status;
        if (!['معلق', 'تمت المراجعة'].includes(newStatus)) {
            return res.status(400).json({
                message: 'الحالة الجديدة غير صالحة'
            });
        }
        const updatedReport = await Report.findByIdAndUpdate(
            reportId,
            { status: newStatus },  // تحديث الحالة
            { new: true }  // إرجاع البلاغ المحدث
        );
        if (!updatedReport) {
            return res.status(404).json({
                message: 'البلاغ غير موجود'
            });
        }
        return res.status(200).json({
            message: 'تم تحديث حالة البلاغ بنجاح',
            data: updatedReport
        });
    }catch(err){
        return res.status(500).json({
            message:"حدث خطأ أثناء تغير حالة الإبلاغ",
            Error: err.message
        })
    }
}