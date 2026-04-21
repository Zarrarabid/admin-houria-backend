const FalconIDs = require('../models/falconIds.modal');



// @desc    Create a new item
// @route   POST /api/items
// @access  Private/Admin, Manager
exports.createFalconIds = async (req, res) => {
    const { 
        falcon_id_holder,
        name_of_id_holder,
        falcon_id_given_to,
        COD,
        total_orders,
        to_Date,
        from_Date
     } = req.body;
    console.log("reaaaaa", req.file)

    try {
        const dataExists = await FalconIDs.findOne({ falcon_id_holder });
        if (dataExists) {
            return res.status(400).json({ message: 'Data with this Id already exists' });
        }

        const data = new FalconIDs({
            falcon_id_holder,
        name_of_id_holder,
        falcon_id_given_to,
        COD,
        total_orders,
        to_Date,
        from_Date
        });

        await data.save();
        res.status(201).json({ message: 'Data created successfully', data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateFalconIds = async (req, res) => {
    const { 
        falcon_id_holder,
        name_of_id_holder,
        falcon_id_given_to,
        COD,
        total_orders,
        to_Date,
        from_Date
    } = req.body;

    console.log("BODY:", req.body);
console.log("ID:", req.params.id);

    try {
        const item = await FalconIDs.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check duplicate
        if (falcon_id_holder && falcon_id_holder !== item.falcon_id_holder) {
            const nameExists = await FalconIDs.findOne({ falcon_id_holder });
            if (nameExists) {
                return res.status(400).json({ message: 'Data with this ID already exists' });
            }
        }

        // ✅ Proper updates
        if (falcon_id_holder !== undefined) item.falcon_id_holder = falcon_id_holder;
if (name_of_id_holder !== undefined) item.name_of_id_holder = name_of_id_holder;
if (falcon_id_given_to !== undefined) item.falcon_id_given_to = falcon_id_given_to;
if (COD !== undefined) item.COD = COD;
if (total_orders !== undefined) item.total_orders = total_orders;
if (to_Date !== undefined) item.to_Date = to_Date;
if (from_Date !== undefined) item.from_Date = from_Date;

        item.updatedAt = Date.now();

        await item.save();

        res.status(200).json({ message: 'Data updated successfully', item });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// // @desc    Get all employees
// // @route   GET /api/employees
// // @access  Public
exports.getAllFalconIds = async (req, res) => {
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
            query = {
                $or: [
                    { falcon_id_holder: { $regex: search, $options: 'i' } },
                    { name_of_id_holder: { $regex: search, $options: 'i' } },
                    { falcon_id_given_to: { $regex: search, $options: 'i' } },
                ]
            };
        }

        const totalEmployeeCount = await FalconIDs.countDocuments(query)
        const employees = await FalconIDs.find(query).limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });
        res.status(200).json(
            {
                data: employees,
                totalItems: totalEmployeeCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalEmployeeCount / parseInt(limit))
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
