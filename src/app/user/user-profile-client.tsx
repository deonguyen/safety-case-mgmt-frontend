"use client";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { logout } from "@/src/services/auth-service";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useLayoutContext } from "@/src/components/context/useLayoutContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ServiceProxy from "@/src/services/service-proxy";
import { UserModel } from "@/src/types/user-model";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import { getNotifications } from "@/src/services/notification-service";
import { UserAvatar } from "@/src/components/user-avatar";

export function UserProfile() {
  const router = useRouter();
  const { updateSettings } = useLayoutContext();
  const [userProfile, setUserProfile] = useState<UserModel | null>(null);
  const { userSetting } = useUserSettingContext();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  const handleChangeTheme = (theme: string) => {
    updateSettings({ theme });
  };

  const handleLogout = async () => {
    const response = await logout();
    if (response) {
      router.push("/login");
    }
  };
  
  useEffect(() => {
    if (userSetting) {
      updateSettings({ theme: userSetting.theme });
    }
  }, [userSetting, updateSettings]);

  useEffect(() => {
    ServiceProxy.getUserProfile().then((res) => {
      setUserProfile(res.user ?? null);
    });

    getNotifications().then((res) => {
      if (res.notifications) {
        const unreadCount = res.notifications.filter((n) => !n.is_read).length;
        setUnreadNotificationsCount(unreadCount);
      }
    });
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <UserAvatar user={userProfile} className="h-8 w-8" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-900 dark:text-slate-100" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile?.first_name + " " + userProfile?.last_name || ""}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="dark:bg-slate-700" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700 data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700">
            <Link href="/user" className="cursor-pointer w-full">
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700 data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700">
            <Link href="/settings" className="cursor-pointer w-full">
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700 data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700">
            <Link href="/notifications" className="cursor-pointer w-full flex justify-between items-center">
              <span>Notifications</span>
              {unreadNotificationsCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] leading-none px-2 py-1 rounded-full font-semibold">
                  {unreadNotificationsCount}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="dark:bg-slate-700" />
        <div className="flex flex-row items-center px-2 py-1.5">
          <span className="text-sm flex-1">Mode:</span>
          <DropdownMenuItem
            onClick={() => handleChangeTheme("light")}
            className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700 data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700"
          >
            <Sun className="h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleChangeTheme("dark")}
            className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700 data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700"
          >
            <Moon className="h-4 w-4" />
          </DropdownMenuItem>
        </div>
        <DropdownMenuSeparator className="dark:bg-slate-700" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-100 dark:hover:bg-red-950/50 focus:bg-red-100 dark:focus:bg-red-950/50 data-[highlighted]:bg-red-100 dark:data-[highlighted]:bg-red-950/50"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
