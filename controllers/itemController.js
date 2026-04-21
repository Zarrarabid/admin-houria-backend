// controllers/itemController.js
const Item = require('../models/Item');

// @desc    Create a new item
// @route   POST /api/items
// @access  Private/Admin, Manager
exports.createItem = async (req, res) => {
    const { name, description, price, category, stock } = req.body;
    console.log("reaaaaa", req.file.filename)

    try {
        const itemExists = await Item.findOne({ name });
        if (itemExists) {
            return res.status(400).json({ message: 'Item with this name already exists' });
        }

        const item = new Item({
            name,
            description,
            price,
            category,
            stock,
            imageUrl: req.file?.filename || ""
        });

        await item.save();
        res.status(201).json({ message: 'Item created successfully', item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Assuming you have your Item model defined like this (or similar):
// const mongoose = require('mongoose');
// const itemSchema = new mongoose.Schema({
//     name: { type: String, required: true, unique: true },
//     description: { type: String },
//     price: { type: Number, required: true },
//     category: { type: String, required: true },
//     stock: { type: Number, required: true, default: 0 },
//     imageUrl: { type: String, default: "" },
//     isActive: { type: Boolean, default: true } // Assuming this might be on your model
// });
// const Item = mongoose.model('Item', itemSchema);

// If you're importing Item from somewhere else:
// const Item = require('../models/Item'); // Adjust path as necessary

exports.createManyItems = async (req, res) => {

    const itemsToInsert = req.body;

    if (!Array.isArray(itemsToInsert) || itemsToInsert.length === 0) {
        return res.status(400).json({ message: 'Request body must be a non-empty array of items' });
    }

    try {
        const namesToInsert = itemsToInsert.map(item => item.name);
        const existingItems = await Item.find({ name: { $in: namesToInsert } });
        const existingNames = new Set(existingItems.map(item => item.name));

        const newItems = itemsToInsert.filter(item => !existingNames.has(item.name));
        const duplicateNames = itemsToInsert.filter(item => existingNames.has(item.name)).map(item => item.name);

        if (newItems.length === 0) {
            return res.status(400).json({ message: 'All provided items already exist.', duplicates: duplicateNames });
        }

        // Mongoose insertMany
        // `ordered: false` allows other documents to be inserted even if one fails
        const insertedItems = await Item.insertMany(newItems, { ordered: false });

        let responseMessage = 'Items created successfully.';
        if (duplicateNames.length > 0) {
            responseMessage += ` Some items were skipped due to existing names: ${duplicateNames.join(', ')}.`;
        }

        res.status(201).json({
            message: responseMessage,
            createdItemsCount: insertedItems.length,
            createdItems: insertedItems,
            skippedDuplicates: duplicateNames
        });

    } catch (error) {
        // This catch block will specifically handle errors from insertMany,
        // such as validation errors or unique index violations for other fields
        // if `ordered: true` (default) was used. With `ordered: false`, errors
        // are often aggregated.
        console.error("Error inserting many items:", error);

        // If using `ordered: false`, errors might be in `error.writeErrors`
        if (error.writeErrors && error.writeErrors.length > 0) {
            const failedInserts = error.writeErrors.map(err => ({
                index: err.index,
                message: err.errmsg || err.err.message
            }));
            return res.status(400).json({
                message: 'Some items failed to insert due to validation or other errors.',
                errors: failedInserts,
                successfullyInserted: error.insertedDocs
            });
        }

        res.status(500).json({ message: 'Server error during bulk item creation.' });
    }
};

// @desc    Get all items
// @route   GET /api/items
// @access  Public
exports.getAllItems = async (req, res) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    try {
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const totalitemsCount = await Item.countDocuments(query)
        const items = await Item.find(query).limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });
        const baseUrl = `${process.env.backendURL}public/item_images/`;
        const itemWithImages = items?.map(ele => ({
            ...ele.toObject(),
            imageUrl: ele.imageUrl ? `${baseUrl}${ele.imageUrl}` : ''
        }));
        res.status(200).json(
            {
                data: itemWithImages,
                totalItems: totalitemsCount,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalitemsCount / parseInt(limit))
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Public
exports.getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        // const baseUrl = `${req.protocol}://${req.get('host')}/public/images/`;
        // const docsWithImageUrls = allDocs.map(doc => ({
        //     ...doc.toObject(),
        //     photoUrl: doc.photoUrl ? `${baseUrl}${doc.photoUrl}` : ''
        // }));

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private/Admin, Manager
exports.updateItem = async (req, res) => {
    const { name, description, price, category, stock, imageUrl } = req.body;

    console.log("req", req.body)

    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check for duplicate name if name is being changed
        if (name && name !== item.name) {
            const nameExists = await Item.findOne({ name });
            if (nameExists) {
                return res.status(400).json({ message: 'Another item with this name already exists' });
            }
        }

        item.name = name || item.name;
        item.description = description || item.description;
        item.price = price !== undefined ? price : item.price;
        item.category = category || item.category;
        item.stock = stock !== undefined ? stock : item.stock;
        item.imageUrl = imageUrl || item.imageUrl;
        item.updatedAt = Date.now(); // Manually update if schema pre-save hook isn't used for all updates

        await item.save();
        res.status(200).json({ message: 'Item updated successfully', item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private/Admin
exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await Item.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Item removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.toggleItemStatus = async (req, res) => {
    const { isActive } = req.body;
    const { id } = req.params;

    // Validate isActive is explicitly a boolean
    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be a boolean value (true/false)' });
    }

    try {
        const items = await Item.findById(id);
        if (!items) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Prevent deactivating critical roles if needed (e.g., the 'admin' role itself)
        // if (role.name === 'admin' && isActive === false) {
        //     return res.status(403).json({ message: 'Cannot deactivate the primary "admin" role.' });
        // }

        items.isActive = isActive; // Update the status
        await items.save(); // Save the changes

        res.status(200).json({
            message: `Item ${isActive ? 'activated' : 'deactivated'} successfully`,
            items: items // Send back the updated role
        });

    } catch (error) {
        console.error("Error in toggleRoleStatus:", error);
        res.status(500).json({ message: 'Server error' });
    }
};