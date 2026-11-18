"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserSetting, saveUserSetting } from "@/src/services/user-service";
import { UserSettingModel } from "@/src/types/user-setting-model";

interface UserSettingContextType {
  pageSize: number;
  projectId: number | undefined;
  theme: string;
  userSetting: UserSettingModel | undefined;
  setUserSettingPageSize: (pageSize: number) => void;
  setUserSettingProjectId: (projectId: number) => void;
  setUserSettingTheme: (theme: string) => void;
}

const UserSettingContext = createContext<UserSettingContextType | undefined>(
  undefined,
);

export function UserSettingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userSetting, setUserSetting] = useState<UserSettingModel | undefined>(
    undefined,
  );
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [theme, setTheme] = useState<string>("light");
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    getUserSetting().then((response: { userSettings?: UserSettingModel }) => {
      if (response?.userSettings) {
        setPageSize(response.userSettings.page_size);
        setProjectId(response.userSettings.project_id);
        setTheme(response.userSettings.theme);
        setUserSetting(response.userSettings);
      } else {
        setPageSize(10);
        setProjectId(undefined);
        setTheme("light");
        setUserSetting(undefined);
      }
    });
  }, []);

  const setUserSettingPageSize = (pageSize: number) => {
    setPageSize(pageSize);

    const updatedSetting = {
      ...userSetting,
      page_size: pageSize,
    } as UserSettingModel;

    setUserSetting(updatedSetting);

    saveUserSetting(updatedSetting).catch((error) => {
      console.error("Failed to save user setting:", error);
    });
  };

  const setUserSettingProjectId = (projectId: number) => {
    setProjectId(projectId);

    const updatedSetting = {
      ...userSetting,
      project_id: projectId,
    } as UserSettingModel;

    setUserSetting(updatedSetting);

    saveUserSetting(updatedSetting).catch((error) => {
      console.error("Failed to save user setting:", error);
    });
  };

  const setUserSettingTheme = (theme: string) => {
    setTheme(theme);

    const updatedSetting = {
      ...userSetting,
      theme: theme,
    } as UserSettingModel;

    setUserSetting(updatedSetting);

    saveUserSetting(updatedSetting).catch((error) => {
      console.error("Failed to save user setting:", error);
    });
  };

  return (
    <UserSettingContext.Provider
      value={{
        pageSize,
        projectId,
        theme,
        userSetting,
        setUserSettingPageSize,
        setUserSettingProjectId,
        setUserSettingTheme,
      }}
    >
      {children}
    </UserSettingContext.Provider>
  );
}

export function useUserSettingContext() {
  const context = useContext(UserSettingContext);
  if (context === undefined) {
    throw new Error("useUserSetting must be used within a UserSettingProvider");
  }
  return context;
}
