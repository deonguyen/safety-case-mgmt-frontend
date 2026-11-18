"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import { getProjects } from "@/src/services/project-service";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { UserModel } from "@/src/types/user-model";
import { getUserProfile } from "@/src/services/user-service";
import { UserAvatar } from "@/src/components/user-avatar";
import { ProjectModel } from "@/src/types/project-model";

export default function UserSettingsClientPage() {
  const { userSetting } = useUserSettingContext();
  const { setTheme: setNextTheme } = useTheme();

  const [theme, setTheme] = useState<string>("system");
  const [pageSize, setPageSize] = useState<number>(25);
  const [defaultProject, setDefaultProject] = useState<string | undefined>(
    undefined,
  );
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [userProfile, setUserProfile] = useState<UserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        const projectResponse = await getProjects();
        if (projectResponse.projects) setProjects(projectResponse.projects);

        const userProfileResponse = await getUserProfile();
        if (userProfileResponse.user)
          setUserProfile(userProfileResponse.user);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        toast.error(
          "Failed to load initial page data. Please refresh the page.",
        );
      }
      setIsLoading(false);
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (userSetting) {
      setTheme(userSetting.theme);
      setPageSize(userSetting.page_size || 25);
      setDefaultProject(userSetting.project_id?.toString());
    }
  }, [userSetting]);

  const handleSave = async () => {
    const newSettings = {
      theme,
      pageSize,
      project_id: defaultProject ? Number(defaultProject) : undefined,
    };

    // Optimistic UI update for theme
    setNextTheme(theme);

    // try {
    //   await setUserSetting(newSettings);
    //   toast.success("Settings saved successfully!");
    // } catch (error) {
    //   console.error("Failed to save settings", error);
    //   toast.error("Failed to save settings. Please try again.");
    //   // Rollback theme if saving fails
    //   if (userSetting) {
    //     setNextTheme(userSetting.theme);
    //   }
    // }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This is your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            <UserAvatar user={userProfile} className="h-24 w-24 text-3xl" />
            <div className="grid gap-y-3 text-sm flex-1">
              <div className="grid grid-cols-3 items-center">
                <span className="font-semibold text-muted-foreground">Name</span>
                <span className="col-span-2">{userProfile?.first_name} {userProfile?.last_name}</span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="font-semibold text-muted-foreground">Email</span>
                <span className="col-span-2">{userProfile?.email}</span>
              </div>
              {/* <div className="grid grid-cols-3 items-center">
                <span className="font-semibold text-muted-foreground">Gender</span>
                <span className="col-span-2">{userProfile?.gender ?? "Not specified"}</span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="font-semibold text-muted-foreground">Date of Birth</span>
                <span className="col-span-2">{userProfile?.date_of_birth ?? "Not specified"}</span>
              </div> */}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full sm:w-[200px]" id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <Label htmlFor="page-size">Page Size</Label>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => setPageSize(Number(v))}
            >
              <SelectTrigger className="w-full sm:w-[200px]" id="page-size">
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 items per page</SelectItem>
                <SelectItem value="25">25 items per page</SelectItem>
                <SelectItem value="50">50 items per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <Label htmlFor="default-project">Default Project</Label>
            <Select
              value={defaultProject}
              onValueChange={setDefaultProject}
              disabled={isLoading || projects.length === 0}
            >
              <SelectTrigger className="w-full sm:w-[200px]" id="default-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}