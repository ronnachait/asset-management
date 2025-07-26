"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { logout } from "@/app/login/actions";
import { Eye, ShieldCheck, UserCog } from "lucide-react";
import { useMemo } from "react";

export function NavUser({
  user,
  level,
}: {
  user: {
    name: string;
    email: string;
  };
  level: number;
}) {
  const { isMobile } = useSidebar();

  const roleDisplay = useMemo(() => {
    if (level >= 99)
      return {
        color: "bg-red-100 text-red-700",
        icon: <ShieldCheck className="w-4 h-4" />,
        label: "Admin",
      };
    if (level >= 70)
      return {
        color: "bg-yellow-100 text-yellow-700",
        icon: <UserCog className="w-4 h-4" />,
        label: "Staff",
      };
    return {
      color: "bg-gray-200 text-gray-700",
      icon: <Eye className="w-4 h-4" />,
      label: "Viewer",
    };
  }, [level]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=open]:bg-gray-200 dark:data-[state=open]:bg-gray-700 transition-all rounded-xl px-2 py-2"
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-9 w-9 rounded-lg shadow-sm grayscale dark:grayscale-0">
                  <AvatarImage
                    src="/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png"
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded-lg bg-muted dark:bg-gray-700 text-muted-foreground dark:text-gray-300">
                    {user.name?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                    {user.email}
                  </div>
                  <div className="text-xs text-muted-foreground dark:text-gray-400 truncate flex items-center gap-2">
                    {user.name}
                    <span
                      className={`text-xs font-semibold rounded-full px-1 py-0.5 flex items-center gap-1 ${roleDisplay.color}`}
                    >
                      {roleDisplay.icon}
                      {roleDisplay.label}
                    </span>
                  </div>
                </div>

                <IconDotsVertical className="w-4 h-4 text-muted-foreground dark:text-gray-400" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-3 py-3">
                <Avatar className="h-9 w-9 rounded-lg shadow">
                  <AvatarImage
                    src="/png-transparent-profile-logo-computer-icons-user-user-blue-heroes-logo-thumbnail.png"
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded-lg bg-muted dark:bg-gray-700 text-muted-foreground dark:text-gray-300">
                    {user.name?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground dark:text-gray-400">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

            <DropdownMenuGroup>
              <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <IconUserCircle className="w-4 h-4 mr-2 text-muted-foreground dark:text-gray-400" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <IconCreditCard className="w-4 h-4 mr-2 text-muted-foreground dark:text-gray-400" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-gray-700">
                <IconNotification className="w-4 h-4 mr-2 text-muted-foreground dark:text-gray-400" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900 font-semibold"
            >
              <IconLogout className="w-4 h-4 mr-2 text-red-600" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
