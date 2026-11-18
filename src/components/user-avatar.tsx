"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { UserModel } from "@/src/types/user-model";
import { User } from "lucide-react";

interface UserAvatarProps {
  user: UserModel | null;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  };

  return (
    <Avatar className={className}>
      {/* <AvatarImage src={user?.avatar} alt={user?.username} /> */}
      <AvatarFallback>
        {user ? getInitials(user.first_name, user.last_name) : <User />}
      </AvatarFallback>
    </Avatar>
  );
}