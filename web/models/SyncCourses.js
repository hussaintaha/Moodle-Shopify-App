import mongoose from "mongoose";

const syncCourses = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    course: Object,
    product: Object,
    created_at: String,
    updated_at: String
});

const SyncCourses = mongoose.model("Courses", syncCourses); 

export default SyncCourses;