"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRight } from "lucide-react";

export const NotificationPermissionGuard = () => {
    const [open, setOpen] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");

    useEffect(() => {
        // Check if browser supports notification
        if (!("Notification" in window)) return;

        const checkPermission = () => {
            const status = Notification.permission;
            setPermissionStatus(status);
            if (status === 'granted') {
                setOpen(false);
            } else {
                setOpen(true);
            }
        };

        checkPermission();

        // 1. Listen via Permissions API
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'notifications' }).then((permissionStatus) => {
                permissionStatus.onchange = () => {
                    checkPermission();
                };
            });
        }

        // 2. Listen for window focus
        const handleFocus = () => {
            checkPermission();
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    const handleRequestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermissionStatus(result);

        if (result === "granted") {
            setOpen(false);
            new Notification("Notifications Enabled", {
                body: "You will now receive timer updates.",
                requireInteraction: false
            });
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (Notification.permission === 'granted') {
                setOpen(val);
            }
        }}>
            <DialogContent
                className="sm:max-w-[420px] w-[95%] rounded-3xl p-8 [&>button]:hidden flex flex-col items-center justify-center text-center gap-6 border-none shadow-2xl focus:outline-none focus:ring-0"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >

                <div className="flex flex-col items-center gap-4">
                    {/* Icon - Always Blue */}
                    <div className="p-5 rounded-full bg-sky-50 shadow-inner">
                        <Bell className="w-10 h-10 text-sky-500 fill-sky-500" />
                    </div>

                    <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                        Enable Notifications
                    </DialogTitle>

                    {/* Concise Description */}
                    <div className="space-y-3">
                        <p className="text-gray-500 font-medium">
                            {permissionStatus === 'denied'
                                ? "Studify requires notifications to function correctly."
                                : "We need this permission to alert you when your timer ends, so you never miss a break."}
                        </p>
                    </div>
                </div>

                <div className="w-full pt-2">
                    {permissionStatus === 'denied' ? (
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="w-full h-11 rounded-xl text-sky-600 border-sky-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 transition-all font-semibold cursor-pointer focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                        >
                            I&apos;ve enabled them, Refresh Page
                        </Button>
                    ) : (
                        <Button
                            onClick={handleRequestPermission}
                            className="w-full h-11 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-200 hover:shadow-sky-300 transition-all font-bold text-base cursor-pointer flex items-center justify-center gap-2 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                        >
                            Allow Notifications <ArrowRight className="w-5 h-5" />
                        </Button>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
};
