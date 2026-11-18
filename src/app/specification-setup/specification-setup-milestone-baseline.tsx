"use client";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";
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
import { ProjectModel } from "@/src/types/project-model";
import { ProjectMilestoneModel } from "@/src/types/project-milestone-model";
import ServiceProxy from "@/src/services/service-proxy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface SpecificationSetupMilestoneBaselineProps {
  onClose?: () => void;
  onHide?: () => void;
}

export default function SpecificationSetupMilestoneBaseline({
  onClose,
  onHide,
}: SpecificationSetupMilestoneBaselineProps) {
  const [projectId, setProjectId] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [version, setVersion] = useState("");
  const [userId, setUserId] = useState(0);
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<ProjectMilestoneModel[]>([]);
  const [versions, setVersions] = useState<string[]>([]);

  useEffect(() => {
    ServiceProxy.getUserSetting().then((response) => {
      if (response?.userSettings) {
        setUserId(response.userSettings.user_id);
      }
    });

    ServiceProxy.getProjects().then((response) => {
      setProjects(response.projects || []);
    });

    ServiceProxy.getDistinctVersion().then((response) => {
      setVersions(response.versions || []);
    });
  }, []);

  useEffect(() => {
    ServiceProxy.getProjectMilestones(Number(projectId)).then((response) => {
      setProjectMilestones(response.projectMilestones || []);
    });
  }, [projectId]);

  const handleSave = () => {
    ServiceProxy.saveProjectSpecificationMilestoneBaseline(
      Number(milestoneId),
      Number(projectId),
      userId,
      version,
    )
      .then((result) => {
        if (result?.error) {
          alert(result.error);
        } else {
          alert("Milestone baseline saved successfully!");
          onClose?.();
        }
      })
      .catch((error) => {
        console.error("Failed to save milestone baseline:", error);
        alert("An error occurred while saving.");
      });
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="flex items-center justify-between px-4 border-b bg-muted/40 h-[44px] shrink-0">
        <div>
          <h3 className="font-semibold text-base">Milestone Baseline</h3>
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
          <Label htmlFor="project">Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger id="project">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="milestone">Milestone</Label>
          <Select value={milestoneId} onValueChange={setMilestoneId}>
            <SelectTrigger id="milestone">
              <SelectValue placeholder="Select a milestone" />
            </SelectTrigger>
            <SelectContent>
              {projectMilestones.map((milestone) => (
                <SelectItem key={milestone.id} value={milestone.id.toString()}>
                  {milestone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Select value={version} onValueChange={setVersion}>
            <SelectTrigger id="version">
              <SelectValue placeholder="Select a version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4 px-0 pb-0 rounded-none bg-transparent border-t">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="bg-[#3f51b5] hover:bg-[#3f51b5]/90 text-white"
        >
          Save
        </Button>
      </CardFooter>
    </Card>
      </div>
    </div>
  );
}
