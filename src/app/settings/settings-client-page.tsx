"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import { getProjects } from "@/src/services/project-service";
import { ProjectModel } from "@/src/types/project-model";
import {
  getProjectSettings,
  createOrUpdateProjectSettings,
} from "@/src/services/project-settings-service";
import { ProjectSettingsModel } from "@/src/types/project-settings-model";

export default function ProjectSettingsClientPage() {
  const { projectId, setUserSettingProjectId } = useUserSettingContext();
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projectId?.toString() || "",
  );
  const [projectSettings, setProjectSettings] = useState<ProjectSettingsModel | undefined>();
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [jamaUrl, setJamaUrl] = useState<string>("");
  const [jamaProjectId, setJamaProjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        // Fetch projects only once
        const projectResponse = await getProjects();
        if (projectResponse.projects) {
          setProjects(projectResponse.projects);
        }

        // If a project is selected, fetch its settings
        if (selectedProjectId) {
          const settingsResponse = await getProjectSettings(
            Number(selectedProjectId),
          );
          setProjectSettings(settingsResponse.projectSettings || undefined);
          setGithubUrl(settingsResponse.projectSettings?.github_url || "");
          setJamaUrl(settingsResponse.projectSettings?.jama_url || "");
          setJamaProjectId(
            settingsResponse.projectSettings?.jama_project_id?.toString() || "",
          );
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        toast.error("Failed to load page data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
    // This effect should re-run when the selected project changes.
    // Note: We are fetching projects every time, which is acceptable for a small number of projects.
    // For a large number of projects, consider fetching them once in a separate effect.
  }, [selectedProjectId]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setUserSettingProjectId(Number(projectId));
  };

  const handleSave = async () => {
    if (!selectedProjectId) {
      toast.error("A project must be selected to save settings.");
      return;
    }

    setIsSaving(true);

    const updatedSettings: Partial<ProjectSettingsModel> = {
      id: projectSettings?.id,
      project_id: Number(selectedProjectId),
      github_url: githubUrl,
      jama_url: jamaUrl,
      jama_project_id: jamaProjectId ? Number(jamaProjectId) : undefined,
    };
    try {
      const result = await createOrUpdateProjectSettings(updatedSettings);
      if (result.projectSettings) {
        setProjectSettings(result.projectSettings);
        toast.success("Project settings saved successfully!");
      } else {
        toast.error(result.error || "Failed to save project settings.");
      }
    } catch (error) {
      console.error("Failed to save project settings", error);
      toast.error("Failed to save project settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Project Configuration</CardTitle>
          <CardDescription>
            Select a project and configure its integration settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <Label htmlFor="project-select">Project</Label>
            <Select
              value={selectedProjectId}
              onValueChange={handleProjectChange}
              disabled={true}
            >
              <SelectTrigger
                className="w-full sm:w-[200px]"
                id="project-select"
              >
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
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <Label htmlFor="github-url">GitHub URL</Label>
            <Input
              id="github-url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="col-span-2"
              disabled={isLoading || !selectedProjectId}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <Label htmlFor="jama-url">Jama URL</Label>
            <Input
              id="jama-url"
              value={jamaUrl}
              onChange={(e) => setJamaUrl(e.target.value)}
              className="col-span-2"
              disabled={isLoading || !selectedProjectId}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <Label htmlFor="jama-project-id">Jama Project ID</Label>
            <Input
              id="jama-project-id"
              value={jamaProjectId}
              onChange={(e) => setJamaProjectId(e.target.value)}
              className="col-span-2"
              disabled={isLoading || !selectedProjectId}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button
            onClick={handleSave}
            disabled={isLoading || !selectedProjectId || isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
