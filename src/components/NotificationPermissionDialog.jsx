"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { requestNotificationPermission, onForegroundMessage, showNotification } from "@/lib/fcm-client";

const NotificationPermissionDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("default");
  
  // Check permission status
  const checkPermissionStatus = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission;
    }
    return "unsupported";
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Check notification permission status
    const checkPermission = () => {
      const permission = checkPermissionStatus();
      setPermissionStatus(permission);
      console.log("Notification permission status:", permission);
      
      // Check if user previously clicked "Maybe Later" (within last 24 hours)
      const dismissedAt = localStorage.getItem("notificationPermissionDismissed");
      const remindAt = localStorage.getItem("notificationPermissionRemindAt");
      const shouldSkipDismissed = dismissedAt === "true";
      const shouldSkipRemind = remindAt && Date.now() < parseInt(remindAt);
      
      console.log("Should skip dialog (dismissed):", shouldSkipDismissed, "Should skip (remind):", shouldSkipRemind);
      
      // Show dialog if permission is default or denied, and not dismissed
      const shouldShow = (permission === "default" || permission === "denied") && !shouldSkipDismissed && !shouldSkipRemind;
      
      console.log("Should show dialog:", shouldShow);
      
      if (shouldShow) {
        // Wait a bit before showing to avoid disrupting initial page load
        setTimeout(() => {
          console.log("Opening notification permission dialog");
          setIsOpen(true);
          setHasChecked(true);
        }, 2000);
      } else {
        setHasChecked(true);
      }

      // Set up foreground message listener for push notifications
      onForegroundMessage((payload) => {
        console.log("Push notification received in foreground:", payload);
        if (payload.notification) {
          showNotification(payload);
        }
      });
    };

    // Check after a short delay to ensure the page has loaded
    const timer = setTimeout(checkPermission, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      // Request notification permission - this will trigger browser's native prompt
      const token = await requestNotificationPermission();
      
      // Re-check permission status after user responds
      const newPermission = checkPermissionStatus();
      setPermissionStatus(newPermission);
      console.log("Permission status after request:", newPermission);
      
      if (newPermission === "granted" && token) {
        // Permission granted! Update FCM token on server
        try {
          const idToken = typeof document !== 'undefined' ? (document.cookie.split('; ').find(c=>c.startsWith('firebase-token='))?.split('=')[1] || '') : '';
          const resp = await fetch("/api/auth/update-fcm-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(idToken ? { 'x-firebase-token': idToken } : {}),
            },
            body: JSON.stringify({ fcmToken: token }),
          });
          if (!resp.ok) {
            const txt = await resp.text();
            console.error("Failed to update FCM token:", resp.status, txt);
          } else {
            console.log("FCM token updated on server");
          }
        } catch (error) {
          console.error("Error updating FCM token on server:", error);
        }
        
        // Close dialog on success
        localStorage.removeItem("notificationPermissionDismissed");
        localStorage.removeItem("notificationPermissionRemindAt");
        setIsOpen(false);
      } else if (newPermission === "denied") {
        // Permission denied by user - keep dialog open but update status
        setPermissionStatus("denied");
        // Don't close, let them see the instructions
      } else {
        // Still default or some other state
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      // Re-check permission even on error
      const newPermission = checkPermissionStatus();
      setPermissionStatus(newPermission);
      if (newPermission === "denied") {
        // Keep dialog open to show instructions
      } else {
        setIsOpen(false);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleRemindLater = () => {
    // Set a flag with expiry (will show again after 24 hours)
    const remindTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem("notificationPermissionRemindAt", remindTime.toString());
    setIsOpen(false);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    // Store dismissal in localStorage (will show again next session)
    localStorage.setItem("notificationPermissionDismissed", "true");
  };

  // Don't render until we've checked permission
  if (!hasChecked || !isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {permissionStatus === "denied" ? "Notifications Are Blocked" : "Enable Notifications"}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 pt-2">
            {permissionStatus === "denied"
              ? "Notifications are currently blocked for this site. To enable them, follow the steps below."
              : "Stay updated with real-time notifications about property requests, inquiries, and important updates. We'll only send you relevant notifications to help you manage your dashboard effectively."}
          </DialogDescription>
          {permissionStatus === "denied" && (
            <div className="mt-3 text-gray-700">
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click the lock icon in your browser&apos;s address bar</li>
                <li>Find &quot;Notifications&quot; in the site settings</li>
                <li>Change it from &quot;Block&quot; to &quot;Allow&quot;</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          {permissionStatus === "denied" ? (
            <Button
              onClick={handleDismiss}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              Got It
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleRemindLater}
                disabled={isRequesting}
                className="w-full sm:w-auto"
              >
                Remind Me Later
              </Button>
              <Button
                onClick={handleAllow}
                disabled={isRequesting}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                {isRequesting ? "Enabling..." : "Allow Notifications"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPermissionDialog;

