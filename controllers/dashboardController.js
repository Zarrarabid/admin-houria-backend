// controllers/dashboardController.js
const User = require('../models/User');
const Item = require('../models/Item');
const Employee = require('../models/employee.modal');

// @desc    Get dashboard analytics data
// @route   GET /api/dashboard/data
// @access  Private/Admin, Manager
exports.getDashboardData = async (req, res) => {
    console.log("adasdasd")
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const deactivatedUsers = totalUsers - activeUsers;

        const now = new Date();
        const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const ordersStats = await Employee.aggregate([
            {
                $match: {
                    uploading_date: {
                        $gte: firstDayLastMonth,
                        $lte: lastDayLastMonth
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: "$online_orders" },
                    avgOrders: { $avg: "$online_orders" },
                                        maxOrders: { $max: "$online_orders" }
                }
            }
        ]);

        const totalOrdersLastMonth = ordersStats[0]?.totalOrders || 0;
        const averageOrdersLastMonth = ordersStats[0]?.avgOrders || 0;
        const maxOrdersLastMonth = ordersStats[0]?.maxOrders || 0;


        const totalItems = await Item.countDocuments();
        const totalStock = (await Item.aggregate([{ $group: { _id: null, total: { $sum: '$stock' } } }]))[0]?.total || 0;
        const outOfStockItems = await Item.countDocuments({ stock: 0 });

        // You can add more complex aggregations here for sales data,
        // inventory value, popular categories, etc., if you have order/sales models.

        console.log("total", totalUsers)

        res.status(200).json({
            users: {
                total: totalUsers,
                active: activeUsers,
                deactivated: deactivatedUsers,
            },
            items: {
                total: totalItems,
                totalStockQuantity: totalStock,
                outOfStock: outOfStockItems,
            },
            orders: {
                totalLastMonth: totalOrdersLastMonth,
                averageLastMonth: averageOrdersLastMonth,
                maxOrders: maxOrdersLastMonth
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};