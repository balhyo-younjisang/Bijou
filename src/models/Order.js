import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    date: { type: String },
    buyer_name: { type: String },
    buyer_email: { type: String },
    title: { type: String },
    price: { type: Number },
    merchant_uid: { type: String }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;