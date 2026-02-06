import Notification from "../models/Notification.model.js";

/**
 * GET /api/notifications
 * Fetch latest 5 notifications
 */
export const getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("listing", "title");

  res.status(200).json({
    success: true,
    data: notifications,
  });
};

/**
 * DELETE /api/notifications/:id
 * Delete notification after read
 */
export const deleteNotification = async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: "Notification removed",
  });
};
