import mongoose from "mongoose";

const customer_details = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    email: String,
    created_at: String,
    updated_at: String
});

const CustomerData = mongoose.model("Customers", customer_details);

export default CustomerData;