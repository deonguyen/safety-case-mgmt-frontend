"use client";

import { useEffect, useState } from "react";
import {
  AppNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/src/services/notification-service";
import { Button } from "@/src/components/ui/button";
import { Check, CheckCircle2, Bell } from "lucide-react";

export default function NotificationsClientPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      const res = await getNotifications();
      if (res.notifications) {
        setNotifications(res.notifications);
      }
      setIsLoading(false);
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    // Save previous state for rollback
    const previousNotifications = [...notifications];

    // Optimistic UI update for snappy feedback
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    
    const response = await markNotificationAsRead(id);
    
    // Rollback if the backend update fails
    if (response.error) {
      console.error("Failed to mark notification as read:", response.error);
      setNotifications(previousNotifications);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // Save previous state for rollback
    const previousNotifications = [...notifications];

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    const response = await markAllNotificationsAsRead(unreadIds);
    
    // Rollback if the backend update fails
    if (response.error) {
      console.error("Failed to mark all notifications as read:", response.error);
      setNotifications(previousNotifications);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            You have {unreadCount} unread message{unreadCount !== 1 && "s"}.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="shrink-0"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            You don't have any notifications yet.
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-colors ${
                  notification.is_read ? "bg-background" : "bg-muted/30"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <p
                    className={`text-sm ${
                      notification.is_read
                        ? "text-muted-foreground"
                        : "font-semibold text-foreground"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="shrink-0 text-xs h-8"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Mark Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
