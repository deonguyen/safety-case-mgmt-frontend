"use client";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useEffect, useState } from "react";
import {
  googleDriveImportProjectSpecifications,
  githubImportProjectSpecifications,
  jamaImportProjectSpecifications,
  localFileImportProjectSpecifications,
} from "@/src/services/project-specification-service";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import { Loader2 } from "lucide-react";
import { getProjectSettings } from "@/src/services/project-settings-service";
import { ProjectSettingsModel } from "@/src/types/project-settings-model";
import { GithubReleaseModel } from "@/src/types/github-release-model";
import { ServiceProxy } from "@/src/services/service-proxy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface SpecificationSetupImportProjectSpecificationProps {
  onSuccess?: () => void;
  onHide?: () => void;
}

export default function SpecificationSetupImportProjectSpecification({
  onSuccess,
  onHide,
}: SpecificationSetupImportProjectSpecificationProps) {
  const { userSetting } = useUserSettingContext();
  const projectId = userSetting?.project_id ?? 0;
  const [projectSettings, setProjectSettings] =
    useState<ProjectSettingsModel | null>(null);
  const [folderLocation, setFolderLocation] = useState("");
  const [version, setVersion] = useState("");
  const [source, setSource] = useState<
    "local" | "google-drive" | "github" | "jama"
  >("local");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [githubReleases, setGithubReleases] = useState<GithubReleaseModel[]>(
    [],
  );
  const [selectedReleaseTag, setSelectedReleaseTag] = useState<string>("");
  const [jamaProjectId, setJamaPojectId] = useState<number>();

  useEffect(() => {
    if (projectId) {
      getProjectSettings(projectId).then((response) => {
        if (response.projectSettings) {
          setProjectSettings(response.projectSettings);
          setJamaPojectId(response.projectSettings.jama_project_id);
        }
      });
    }
  }, [projectId]);

  useEffect(() => {
    if (source === "github") {
      ServiceProxy.getGithubReleases().then((response) => {
        if (response.releases) {
          setGithubReleases(response.releases);
        }
      });
    } else if (source === "jama") {
      setFolderLocation(projectSettings?.jama_url || "");
    } else {
      setFolderLocation("");
      setSelectedFile(null);
    }
  }, [source, projectSettings]);

  const handleReleaseTagChange = (value: string) => {
    setSelectedReleaseTag(value);
  };

  const handleImport = async () => {
    console.log(`Importing from ${source}:`, { folderLocation, version });
    setIsImporting(true);

    try {
      let importPromise;
      switch (source) {
        case "local":
          if (selectedFile) {
            importPromise = localFileImportProjectSpecifications(
              selectedFile,
              version,
              projectId,
            );
          } else {
            // Assuming local folder import is different and might not be a file upload.
            // If it is also a file/folder selection, it needs similar treatment.
            // For now, we assume it's a path string for a server process.
            alert("Please select a file to import.");
            setIsImporting(false);
            return;
          }
          break;
        case "google-drive":
          importPromise = googleDriveImportProjectSpecifications(
            folderLocation,
            version,
            projectId,
          );
          break;
        case "github":
          importPromise = githubImportProjectSpecifications(selectedReleaseTag, projectId)
          break;
        case "jama":
          importPromise = jamaImportProjectSpecifications(
            projectSettings?.jama_url || "",
            jamaProjectId?.toString() || "",
            version,
            projectId,
          );
          break;
      }

      const result = await importPromise;

      if (result?.error) {
        console.error("Import error:", result.error);
        alert(`Import error: ${result.error}`);
      } else {
        alert(
          "The import process has been queued in the background. You will receive a notification when it is successful.",
        );
        onSuccess?.();
      }
    } catch (error) {
      console.error("Failed to execute import:", error);
      alert("Failed to queue the import process. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="flex items-center justify-between px-4 border-b bg-muted/40 h-[44px] shrink-0">
        <div>
          <h3 className="font-semibold text-base">
            Import Project Specification
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {onHide && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Hide panel to right"
              onClick={onHide}
            >
              <FontAwesomeIcon
                icon={faChevronRight}
                className="h-3.5 w-3.5 text-muted-foreground"
              />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
    <Card className="w-full border-0 shadow-none ring-0 rounded-none bg-transparent">
      <CardContent className="space-y-6 px-0">
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Select
            value={source}
            onValueChange={(
              val: "local" | "google-drive" | "github" | "jama",
            ) => setSource(val)}
          >
            <SelectTrigger id="source">
              <SelectValue placeholder="Select a source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="google-drive">Google Drive</SelectItem>
              <SelectItem value="github">GitHub</SelectItem>
              <SelectItem value="jama">Jama</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {source === "local" ? (
          <div className="space-y-2">
            <Label htmlFor="file-upload">File</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={(e) =>
                setSelectedFile(e.target.files ? e.target.files[0] : null)
              }
            />
          </div>
        ) : source === "jama" ? (
          <div className="space-y-2">
            <Label htmlFor="folder_location">URL</Label>
            <Input
              id="folder_location"
              placeholder="Enter folder location or URL"
              value={folderLocation}
              disabled
              onChange={(e) => setFolderLocation(e.target.value)}
            />
          </div>
        ) : source === "google-drive" ? (
          <div className="space-y-2">
            <Label htmlFor="google_drive_url">URL</Label>
            <Input
              id="google_drive_url_input"
              placeholder="Enter Google Drive location or URL"
              value={folderLocation}
              onChange={(e) => setFolderLocation(e.target.value)}
            />
          </div>
        ) : (
          <></>
        )}

        {source === "jama" && projectSettings?.jama_project_id && (
          <div className="space-y-2">
            <Label htmlFor="jama_project_id">Jama Project ID</Label>
            <Input
              id="jama_project_id"
              value={jamaProjectId}
              onChange={(e) => setJamaPojectId(Number(e.target.value))}
            />
          </div>
        )}

        {source === "github" && (
          <div className="space-y-2">
            <Label htmlFor="source">Release tag</Label>
            <Select
              value={selectedReleaseTag}
              onValueChange={handleReleaseTagChange}
            >
              <SelectTrigger id="release_tag">
                <SelectValue placeholder="Select a release tag" />
              </SelectTrigger>
              <SelectContent>
                {githubReleases.map((release) => (
                  <SelectItem
                    key={release.release_tag}
                    value={release.release_tag}
                  >
                    {release.release_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {source === "local" ||
        source === "jama" ||
        source === "google-drive" ? (
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              placeholder="e.g., 1.0.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </div>
        ) : (
          <></>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-4 px-0 pb-0 rounded-none bg-transparent border-t">
        <Button
          type="button"
          onClick={handleImport}
          id="import-button"
          disabled={isImporting}
          className="bg-[#3f51b5] hover:bg-[#3f51b5]/90 text-white"
        >
          {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Import
        </Button>
      </CardFooter>
    </Card>
      </div>
    </div>
  );
}
