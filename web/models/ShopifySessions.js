import mongoose from "mongoose";

const session_details = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id: String,
    shop: String,
    state: String,
    isOnline: Boolean,
    scope: String,
    accessToken: String
});

const ShopifySessions = mongoose.model("shopify_sessions", session_details);

export default ShopifySessions;