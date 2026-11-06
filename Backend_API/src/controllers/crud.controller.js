const Category = require('../models/Category');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Delivery = require('../models/Delivery');

const models = { Category, Product, Inventory, Delivery };
const population = {
    Category: '',
    Product: 'category_id',
    Inventory: 'product_id category_id',
    Delivery: 'order_id customer_id'
};

const list = (name) => async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        const filter = req.query.search ? { name: { $regex: req.query.search, $options: 'i' } } : {};
        const [data, total] = await Promise.all([
            models[name].find(filter).populate(population[name]).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
            models[name].countDocuments(filter)
        ]);
        res.json({ data, page, limit, total });
    } catch (error) { next(error); }
};
const get = (name) => async (req, res, next) => {
    try {
        const item = await models[name].findById(req.params.id).populate(population[name]);
        if (!item) return res.status(404).json({ message: `${name} not found` });
        res.json(item);
    } catch (error) { next(error); }
};
const create = (name) => async (req, res, next) => {
    try { res.status(201).json(await models[name].create(req.body)); 
        
    } catch (error) { next(error); }
};
const update = (name) => async (req, res, next) => {
    try {
        const item = await models[name].findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ message: `${name} not found` });
        res.json(item);
    } catch (error) { next(error); }
};
const remove = (name) => async (req, res, next) => {
    try {
        const item = await models[name].findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: `${name} not found` });
        res.status(204).send();
    } catch (error) { next(error); }
};
module.exports = { list, get, create, update, remove };
