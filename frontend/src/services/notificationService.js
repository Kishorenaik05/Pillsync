export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendLocalNotification = (title, options = {}) => {
  if ("Notification" in window && Notification.permission === "granted") {
    const defaultOptions = {
      icon: "/vite.svg", // Default icon
      badge: "/vite.svg",
      requireInteraction: true, // Keep notification visible until user interacts
      ...options,
    };
    return new Notification(title, defaultOptions);
  }
};
