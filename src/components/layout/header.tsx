"use client";

import { UserProfile } from "@/src/app/user/user-profile-client";
import { ProjectModel } from "@/src/types/project-model";
import { useEffect, useState } from "react";
import Image from "next/image";
import wovenLogo from "@/src/assets/images/svg/logo_woven_by_toyota.svg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { getProjects } from "@/src/services/project-service";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import { Button } from "@/src/components/ui/button";
import {
  ChevronDown,
  ClipboardList,
  Code,
  FileUp,
  FileText,
  Boxes,
  Home,
  Languages,
  Library,
  Milestone,
  Network,
  Plus,
  Route,
  TestTube,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

export default function Header() {
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const { projectId, setUserSettingProjectId } = useUserSettingContext();
  const [selectedProject, setSelectedProject] = useState<string>(
    projectId?.toString() ?? "",
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  useEffect(() => {
    getProjects().then((res) => {
      setProjects(res.projects ?? []);
      setSelectedProject(projectId?.toString() ?? "");
    });
  }, [projectId]);

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    setUserSettingProjectId(Number(value));
  };

  return (
    <div className="flex flex-row flex-1 items-center justify-between w-full bg-background shadow px-1 p-2">
      <div className="flex items-center pl-4 gap-3">
        <Image
          src={wovenLogo}
          alt="Woven by Toyota Logo"
          className="h-6 w-auto"
          priority></Image>
        <h1 className="font-bold text-lg text-muted-foreground uppercase">
          Safety Case Management Tool
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {/* <nav className="flex flex-row gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" >
                Home
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
              <DropdownMenuItem asChild>
                <Link
                  href="/"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Home className="size-4" /> Home
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                Specification <ChevronDown className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <ClipboardList className="size-4" /> Specification Setup
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="min-w-[200px]">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/specification-setup"
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <ClipboardList className="size-4" />
                      Specification Setup
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/specification-setup?action=import"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("spec-action", {
                            detail: "import",
                          }),
                        )
                      }
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <FileUp className="size-4" /> Import Specification
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/specification-setup?action=add"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("spec-action", { detail: "add" }),
                        )
                      }
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="size-4" /> Add Specification
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/specification-setup?action=milestone-baseline"
                      onClick={() =>
                        window.dispatchEvent(
                          new CustomEvent("spec-action", {
                            detail: "milestone-baseline",
                          }),
                        )
                      }
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Milestone className="size-4" /> Milestone Baseline
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem asChild>
                <Link
                  href="/specification-milestones"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Milestone className="size-4" /> Specification Milestones
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                Traceability <ChevronDown className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
              <DropdownMenuItem asChild>
                <Link
                  href="/traceability"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Route className="size-4" /> Traceability Matrix
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/traceability/code-implementation"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Code className="size-4" /> Code Implementation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/traceability/code-dependency"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Network className="size-4" /> Code Dependency
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/traceability/test-execution"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <TestTube className="size-4" /> Test Execution
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/reports"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <FileText className="size-4" /> Reports
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                Build Snapshot <ChevronDown className="ml-1 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px]">
              <DropdownMenuItem asChild>
                <Link
                  href="/build-snapshot"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Boxes className="size-4" /> Build
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav> */}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 pr-4">
          <span>Project</span>
          <Select value={selectedProject} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Project" />
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

        <div className="flex items-center">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              {/* <Languages className="mr-1.5 size-4 text-muted-foreground" /> */}
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <UserProfile />
      </div>
    </div>
  );
}
