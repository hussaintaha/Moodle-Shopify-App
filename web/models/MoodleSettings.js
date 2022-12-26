import mongoose from "mongoose";

const mdSettings = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    shop: String,
    moodle_url: String,
    moodle_accessToken: String,
    isValid: Boolean,
    created_at: String,
    updated_at: String
});

const MoodleSettings = mongoose.model("Settings", mdSettings); 

export default MoodleSettings;