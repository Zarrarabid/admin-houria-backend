const Merchendise = require('../models/merchendise');



exports.createMerchendise = async (req, res) => {
    const { 
        falcon_id,
  name,
  tshirt,
  trouser,
  jacket,
  delivery_bag,
  chest_guard,
  helmet,
  gloves,
  safety_gears,
  Box,
  summer_coat
     } = req.body;

    try {
        const dataExists = await Merchendise.findOne({ falcon_id });
        if (dataExists) {
            return res.status(400).json({ message: 'Data with this Id already exists' });
        }

        const data = new Merchendise({
            falcon_id,
  name,
  tshirt : tshirt || 0,
  trouser : trouser || 0 ,
  jacket : jacket || 0,
  delivery_bag : delivery_bag || 0,
  chest_guard : chest_guard || 0,
  helmet : helmet || 0,
  gloves : gloves || 0,
  safety_gears : safety_gears || 0,
  Box : Box || 0,
  summer_coat : summer_coat || 0
        });

        await data.save();
        res.status(201).json({ message: 'Data created successfully', data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateMerchandise = async (req, res) => {
    const { 
        falcon_id,
  name,
  tshirt,
  trouser,
  jacket,
  delivery_bag,
  chest_guard,
  helmet,
  gloves,
  safety_gears,
  Box,
  summer_coat
    } = req.body;


    try {
        const item = await Merchendise.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Merchandise not found' });
        }

        if (falcon_id && falcon_id !== item.falcon_id) {
            const nameExists = await Merchendise.findOne({ falcon_id });
            if (nameExists) {
                return res.status(400).json({ message: 'Merchandise with this ID already exists' });
            }
        }

        // ✅ Proper updates
        if (falcon_id !== undefined) item.falcon_id = falcon_id;
if (name !== undefined) item.name = name;
if (tshirt !== undefined) item.tshirt = tshirt || 0;
if (trouser !== undefined) item.trouser = trouser || 0;
if (jacket !== undefined) item.jacket = jacket || 0;
if (delivery_bag !== undefined) item.delivery_bag = delivery_bag || 0;
if (chest_guard !== undefined) item.chest_guard = chest_guard || 0;
if (helmet !== undefined) item.helmet = helmet || 0;
if (gloves !== undefined) item.gloves = gloves || 0;
if (safety_gears !== undefined) item.safety_gears = safety_gears || 0;
if (Box !== undefined) item.Box = Box || 0;
if (summer_coat !== undefined) item.summer_coat = summer_coat || 0;

        item.updatedAt = Date.now();

        await item.save();

        res.status(200).json({ message: 'Merchandise updated successfully', item });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getAllMerchandise = async (req, res) => {
    const { page = 1, limit = 10, search = '',date } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    try {
        let query = {};

        if (search) {
            query = {
                $or: [
                    { falcon_id: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } },
                ]
            };
        }

        const totalEmployeeCount = await Merchendise.countDocuments(query)
        const employees = await Merchendise.find(query).limit(parseInt(limit))
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
