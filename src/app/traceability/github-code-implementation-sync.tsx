"use client";

import { useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import {
  importCodeTraceabilityFromGithubPullrequests,
  importCodeTraceabilityFromGithubRepository,
} from "@/src/services/traceability-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

interface GitHubCodeImplementationSyncProps {
  onSuccess?: () => void;
}

export default function GitHubCodeImplementationSync({
  onSuccess,
}: GitHubCodeImplementationSyncProps) {
  const { projectId } = useUserSettingContext();

  const [githubUrl, setGithubUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [syncType, setSyncType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    if (projectId === undefined) {
      alert("Project ID is not available.");
      return;
    }

    setIsLoading(true);
    try {
      if (syncType === "repository") {
        const result = await importCodeTraceabilityFromGithubRepository(
          projectId,
          githubUrl
        );
        if (result.error) {
          alert(result.error);
        } else {
          alert("Project specifications imported successfully!");
          onSuccess?.();
        }
        return;
      } else {
        const result = await importCodeTraceabilityFromGithubPullrequests(
          projectId,
          githubUrl,
        );
        if (result.error) {
          alert(result.error);
        } else {
          alert("Project specifications imported successfully!");
          onSuccess?.();
        }
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="sync_type">Type</Label>
        <Select value={syncType} onValueChange={setSyncType}>
          <SelectTrigger id="sync_type">
            <SelectValue placeholder="Select sync type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="repository">Repository</SelectItem>
            <SelectItem value="pull_request">Pull Request</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="github_url">GitHub URL</Label>
        <Input
          id="github_url"
          placeholder="https://github.com/owner/repo"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="branch">Branch</Label>
        <Input
          id="branch"
          placeholder="e.g. main"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSync}
          disabled={isLoading || !githubUrl || !branch || !syncType}
        >
          {isLoading ? "Syncing..." : "Sync Pull Request"}
        </Button>
      </div>
    </div>
  );
}
