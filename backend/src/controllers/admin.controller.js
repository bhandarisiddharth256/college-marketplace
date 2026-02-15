import User from "../models/User.model.js";
import Listing from "../models/Listing.model.js";
import Message from "../models/Message.model.js";
import AdminLog from "../models/AdminLog.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/* Dashboard Stats */
export const getAdminStats = asyncHandler(async(req,res)=>{
  const users = await User.countDocuments();
  const listings = await Listing.countDocuments({ isDeleted:false });
  const reportedMessages = await Message.countDocuments({ reported:true });

  return res.json(new ApiResponse(200,{
    users,
    listings,
    reportedMessages
  }));
});

/* Users with pagination */
export const getUsersAdmin = asyncHandler(async(req,res)=>{
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page-1)*limit;

  const users = await User.find()
    .select("-password")
    .skip(skip)
    .limit(limit);

  res.json(new ApiResponse(200, users));
});

/* Listings */
export const getListingsAdmin = asyncHandler(async(req,res)=>{
  const listings = await Listing.find({ isDeleted:false })
    .populate("owner","name email");

  res.json(new ApiResponse(200,listings));
});

/* Soft delete listing */
export const deleteListingAdmin = asyncHandler(async(req,res)=>{
  const listing = await Listing.findById(req.params.id);

  listing.isDeleted = true;
  await listing.save();

  await AdminLog.create({
    admin:req.user._id,
    action:"Deleted listing",
    targetId:listing._id
  });

  res.json(new ApiResponse(200,null,"Listing removed"));
});

/* Reported Messages */
export const getReportedMessages = asyncHandler(async(req,res)=>{
  const messages = await Message.find({ reported:true })
    .populate("sender","name email");

  res.json(new ApiResponse(200,messages));
});

/* Delete abusive message */
export const deleteReportedMessage = asyncHandler(async(req,res)=>{
  const message = await Message.findById(req.params.id);

  message.text="[Removed by admin]";
  message.isDeleted=true;
  await message.save();

  await AdminLog.create({
    admin:req.user._id,
    action:"Deleted message",
    targetId:message._id
  });

  res.json(new ApiResponse(200,null));
});
