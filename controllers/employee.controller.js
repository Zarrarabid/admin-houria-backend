const Employee = require('../models/employee.modal.js');


exports.addBulkEmployee = async (req, res) => {
    try {
        const { data, uploading_date } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for bulk upload."
            });
        }

        if (!uploading_date) {
            return res.status(400).json({
                success: false,
                message: "Uploading date is required."
            });
        }

        const uploadDate = new Date(uploading_date);
        const startOfMonth = new Date(uploadDate.getFullYear(), uploadDate.getMonth(), 1);
        const endOfMonth = new Date(uploadDate.getFullYear(), uploadDate.getMonth() + 1, 1);

        const operations = data.map((row, index) => {
            const falcon_id = String(row["Falcon ID"] || "").trim();
            const name = String(row["Name"] || "").trim();
            const category = String(row["Type"] || "").trim();

            if (!falcon_id || !name || !category) {
                throw new Error(`Row ${index + 2}: Falcon ID, Name, and Type are required.`);
            }

            const updateData = {
                falcon_id,
                name,
                category,
                online_orders: Number(row["Online orders"]) || 0,
                rate: Number(row["Rate"]) || 0,
                petrol: Number(row["Petrol"]) || 0,
                bonus_amount: Number(row["Bonus AMT"]) || 0,
                extra_kms_amount: Number(row["Extra KMS Amount"]) || 0,
                violation: Number(row["Quality Vaiolations"]) || 0,
                keeta: Number(row["Keeta"]) || 0,
                total_deduction: Number(row["Total Deductions"]) || 0,
                bike: Number(row["Bike"]) || 0,
                office: Number(row["Office"]) || 0,
                sim: Number(row["Sim"]) || 0,
                total: Number(row["Total"]).toFixed(2) || 0,
                uploading_date: uploadDate,
            };

            return {
                updateOne: {
                    filter: {
                        falcon_id,
                        uploading_date: { $gte: startOfMonth, $lt: endOfMonth }
                    },
                    update: { $set: updateData },
                    upsert: true
                }
            };
        });

        const result = await Employee.bulkWrite(operations);

        return res.status(200).json({
            success: true,
            message: "Bulk upload completed with upsert logic.",
            matched: result.matchedCount,
            modified: result.modifiedCount,
            upserted: result.upsertedCount
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Bulk upload failed."
        });
    }
};

exports.getAllEmployee = async (req, res) => {
    const { page = 1, limit = 10, search = '',date } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    try {
        let query = {};

        if (date) {
            const parsedDate   = new Date(date);
            const startOfMonth = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
            const endOfMonth   = new Date(parsedDate.getFullYear(), parsedDate.getMonth() + 1, 1);
            query.uploading_date = { $gte: startOfMonth, $lt: endOfMonth };
        }


        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { falcon_id: { $regex: search, $options: 'i' } }
            ];
        }

        const totalEmployeeCount = await Employee.countDocuments(query)
        const employees =
        limit == "All" ?
        await Employee.find(query) :
        await Employee.find(query).limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: 1 });
        res.status(200).json(
            {
                data: employees,
                totalItems: totalEmployeeCount,
                currentPage: limit == "All" ? 0 : parseInt(page),
                totalPages: limit == "All" ? 0 : Math.ceil(totalEmployeeCount / parseInt(limit))
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.updateEmployeeRecord = async (req, res) => {
    const { 
        falcon_id,
        name,
        uploading_date,
        category,
        online_orders,
        rate,
        petrol,
        bonus_amount,
        extra_kms_amount,
        violation,
        total_deduction,
        bike,
        office,
        sim,
        total } = req.body;

    console.log("req", req.body)

    try {
        const item = await Employee.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check for duplicate name if name is being changed
        // if (name && name !== item.name) {
        //     const nameExists = await Item.findOne({ name });
        //     if (nameExists) {
        //         return res.status(400).json({ message: 'Another item with this name already exists' });
        //     }
        // }

        item.falcon_id = falcon_id || item.falcon_id;
        item.name = name || item.name;
        item.uploading_date = uploading_date || item.uploading_date;
        item.category = category || item.category;
        item.online_orders = online_orders !== undefined ? online_orders : item.online_orders;
        item.rate = rate !== undefined ? rate : item.rate;
        item.petrol = petrol !== undefined ? petrol : item.petrol;
        item.bonus_amount = bonus_amount !== undefined ? bonus_amount : item.bonus_amount;
        item.extra_kms_amount = extra_kms_amount !== undefined ? extra_kms_amount : item.extra_kms_amount;
        item.violation = violation !== undefined ? violation : item.violation;
        item.total_deduction = total_deduction !== undefined ? total_deduction : item.total_deduction;
        item.bike = bike !== undefined ? bike : item.bike;
        item.office = office !== undefined ? office : item.office;
        item.sim = sim !== undefined ? sim : item.sim;
        item.total = total !== undefined ? total : item.total;
        item.updatedAt = Date.now(); // Manually update if schema pre-save hook isn't used for all updates

        await item.save();
        res.status(200).json({ message: 'Employee Record updated successfully', item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};