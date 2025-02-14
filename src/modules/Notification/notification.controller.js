//& ========================= ADD NOTIFICATION =========================
export const addNotification = async (req, res, next) => {
    const { message, body, type, receiverId } = req.body;
    const { _id: addedBy } = req.authUser;

    const newNotification = await Notification.create({
        title,
        body,
        type,
        receiverId,
        addedBy,
    });
    if (!newNotification) return next({ message: "Notification is not created", cause: 500 });

    res.status(201).json({ success: true, message: "Notification added successfully", notification: newNotification });
};

export const getNotificationsForRestaurant = async (req, res, next) => {
    const { restaurantId } = req.params;
    const notifications = await Notification.find({ receiverId: restaurantId });
    res.status(200).json({
        message: "Notifications fetched successfully",
        notifications,
    });
};