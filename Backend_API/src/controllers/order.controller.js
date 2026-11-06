const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Delivery = require('../models/Delivery');
const User = require('../models/User');

const details = 'items.product_id customer_id';

const restoreStock = async (items) => {
    await Promise.all(items.map(item => Product.updateOne(
        { _id: item.product_id },
        { $inc: { stock: item.quantity } }
    )));
    await Inventory.bulkWrite(items.map(item => ({
        updateOne: { filter: { product_id: item.product_id }, update: { $inc: { quantity: item.quantity } } }
    })));
};

const findOrder = async (id) => {
    const order = await Order.findById(id);
    if (order) return order;
    const error = new Error('Order not found');
    error.status = 404;
    throw error;
};

exports.list = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        const filter = req.query.customer_id ? { customer_id: req.query.customer_id } : {};
        const [data, total] = await Promise.all([
            Order.find(filter).populate(details).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            Order.countDocuments(filter)
        ]);
        res.json({ data, page, limit, total });
    } catch (error) { next(error); }
};

exports.get = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate(details);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
    try {
        const { customer_id, customer, delivery, items } = req.body;
        let customerId = customer_id;

        // Storefront checkout may supply guest details. Reuse the account for a
        // returning email address so Admin can show one customer history.
        if (!customerId && customer?.name?.trim() && customer?.email?.trim()) {
            const email = customer.email.toLowerCase().trim();
            let guest = await User.findOne({ userEmail: email });
            if (!guest) {
                guest = await User.create({
                    userID: `guest-${require('crypto').randomUUID()}`,
                    userName: customer.name.trim(),
                    userEmail: email
                });
            }
            customerId = guest._id;
        }
        if (!customerId || !Array.isArray(items) || !items.length) {
            return res.status(400).json({ message: 'customer_id (or customer name and email) and at least one item are required' });
        }
        if (delivery && (!delivery.destination?.trim() || !delivery.carrier?.trim() || !delivery.est_delivery)) {
            return res.status(400).json({ message: 'Delivery destination, carrier, and estimated delivery date are required' });
        }
        const quantities = new Map();
        for (const item of items) {
            if (!item.product_id || !Number.isInteger(item.quantity) || item.quantity < 1) {
                return res.status(400).json({ message: 'Each item needs a product_id and a positive integer quantity' });
            }
            quantities.set(String(item.product_id), (quantities.get(String(item.product_id)) || 0) + item.quantity);
        }
        const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
        if (products.length !== quantities.size) return res.status(400).json({ message: 'One or more products do not exist' });
        const byId = new Map(products.map(product => [String(product._id), product]));
        for (const [id, quantity] of quantities) {
            if (byId.get(id).stock < quantity) return res.status(409).json({ message: `Insufficient stock for ${byId.get(id).name}` });
        }
        const orderItems = items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: byId.get(String(item.product_id)).price
        }));
        const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await Promise.all([...quantities].map(([id, quantity]) => Product.updateOne({ _id: id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } })));
        await Inventory.bulkWrite([...quantities].map(([id, quantity]) => ({ updateOne: { filter: { product_id: id }, update: { $inc: { quantity: -quantity } } } })));
        const order = await Order.create({ customer_id: customerId, items: orderItems, total });
        let savedDelivery = null;
        if (delivery) {
            savedDelivery = await Delivery.create({
                order_id: order._id,
                customer_id: customerId,
                carrier: delivery.carrier.trim(),
                destination: delivery.destination.trim(),
                est_delivery: delivery.est_delivery
            });
        }
        const populatedOrder = await order.populate(details);
        res.status(201).json({ ...populatedOrder.toObject(), delivery: savedDelivery });
    } catch (error) { next(error); }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid order status' });
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (req.body.status === 'cancelled' && order.status !== 'cancelled') {
            await restoreStock(order.items);
        }
        order.status = req.body.status;
        await order.save();
        res.json(await order.populate(details));
    } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
    try {
        const order = await findOrder(req.params.id);
        if (order.status !== 'cancelled') await restoreStock(order.items);
        await order.deleteOne();
        res.status(204).send();
    } catch (error) { next(error); }
};

exports.listItems = async (req, res, next) => {
    try {
        const order = await findOrder(req.params.orderId);
        await order.populate('items.product_id');
        res.json(order.items);
    } catch (error) { next(error); }
};

exports.getItem = async (req, res, next) => {
    try {
        const order = await findOrder(req.params.orderId);
        await order.populate('items.product_id');
        const item = order.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Order item not found' });
        res.json(item);
    } catch (error) { next(error); }
};

exports.addItem = async (req, res, next) => {
    try {
        const { product_id, quantity } = req.body;
        if (!product_id || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: 'product_id and a positive integer quantity are required' });
        }
        const order = await findOrder(req.params.orderId);
        if (order.status === 'cancelled') return res.status(409).json({ message: 'Cannot modify a cancelled order' });
        const product = await Product.findOneAndUpdate(
            { _id: product_id, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        );
        if (!product) return res.status(409).json({ message: 'Product does not exist or has insufficient stock' });
        await Inventory.updateOne({ product_id }, { $inc: { quantity: -quantity } });
        order.items.push({ product_id, quantity, price: product.price });
        order.total += product.price * quantity;
        await order.save();
        res.status(201).json(order.items[order.items.length - 1]);
    } catch (error) { next(error); }
};

exports.updateItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;
        if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: 'quantity must be a positive integer' });
        const order = await findOrder(req.params.orderId);
        if (order.status === 'cancelled') return res.status(409).json({ message: 'Cannot modify a cancelled order' });
        const item = order.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Order item not found' });
        const difference = quantity - item.quantity;
        if (difference > 0) {
            const product = await Product.findOneAndUpdate(
                { _id: item.product_id, stock: { $gte: difference } },
                { $inc: { stock: -difference } },
                { new: true }
            );
            if (!product) return res.status(409).json({ message: 'Insufficient stock' });
            await Inventory.updateOne({ product_id: item.product_id }, { $inc: { quantity: -difference } });
        } else if (difference < 0) {
            await restoreStock([{ product_id: item.product_id, quantity: -difference }]);
        }
        item.quantity = quantity;
        order.total += item.price * difference;
        await order.save();
        res.json(item);
    } catch (error) { next(error); }
};

exports.removeItem = async (req, res, next) => {
    try {
        const order = await findOrder(req.params.orderId);
        if (order.status === 'cancelled') return res.status(409).json({ message: 'Cannot modify a cancelled order' });
        const item = order.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Order item not found' });
        if (order.items.length === 1) return res.status(400).json({ message: 'An order must contain at least one item' });
        await restoreStock([item]);
        order.total -= item.price * item.quantity;
        item.deleteOne();
        await order.save();
        res.status(204).send();
    } catch (error) { next(error); }
};
