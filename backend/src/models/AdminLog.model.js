import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  action: String,
  targetId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

export default mongoose.model("AdminLog", adminLogSchema);
