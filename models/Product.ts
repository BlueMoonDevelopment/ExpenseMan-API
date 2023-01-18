import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    prod_name: String,
    prod_desc: String,
    prod_price: Number,
    updated_at: { type: Date, default: Date.now },
});

export const Product = mongoose.model('Product', ProductSchema);