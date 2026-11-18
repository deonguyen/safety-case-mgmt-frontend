"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ProjectSpecificationModel } from "@/src/types/project-specification-model";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import { CategoryModel } from "@/src/types/category-model";
import { useEffect, useState, useRef, useCallback } from "react";
import { ComponentModel } from "@/src/types/component-model";
import { FunctionModel } from "@/src/types/function-model";
import { ProjectModel } from "@/src/types/project-model";
import ServiceProxy from "@/src/services/service-proxy";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { spec } from "node:test/reporters";
import { SpecificationModel } from "@/src/types/specification-model";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface SpecificationSetupAddProjectSpecificationProps {
  onSuccess?: () => void;
  onHide?: () => void;
}

export default function SpecificationSetupAddProjectSpecification({
  onSuccess,
  onHide,
}: SpecificationSetupAddProjectSpecificationProps) {
  const { userSetting } = useUserSettingContext();
  const pageSize = userSetting?.page_size || 25;
  const selectedProject = userSetting?.project_id ?? 0;
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [components, setComponents] = useState<ComponentModel[]>([]);
  const [functions, setFunctions] = useState<FunctionModel[]>([]);
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [specifications, setSpecifications] = useState<SpecificationModel[]>(
    [],
  );
  const [specificationSearch, setSpecificationSearch] = useState("");
  const [parentSearch, setParentSearch] = useState("");
  const [componentSearch, setComponentSearch] = useState("");
  const [functionSearch, setFunctionSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [parents, setParents] = useState<ProjectSpecificationModel[]>([]); // TODO: Replace any with proper Parent model and fetch logic

  const [componentId, setComponentId] = useState<string>();
  const [functionId, setFunctionId] = useState<string>();
  const [parentId, setParentId] = useState<string>();
  const [projectIdForForm, setProjectIdForForm] = useState<string>(
    selectedProject ? selectedProject.toString() : "",
  );
  const [specificationId, setSpecificationId] = useState<string>();
  const [categoryId, setCategoryId] = useState<string>();
  const [version, setVersion] = useState("");

  const [specificationPage, setSpecificationPage] = useState(1);
  const [parentPage, setParentPage] = useState(1);
  const [componentPage, setComponentPage] = useState(1);
  const [functionPage, setFunctionPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);

  const specObserver = useRef<IntersectionObserver | null>(null);
  const lastSpecRef = useCallback((node: HTMLDivElement | null) => {
    if (specObserver.current) specObserver.current.disconnect();
    specObserver.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setSpecificationPage((prev) => prev + 1);
      }
    });
    if (node) specObserver.current.observe(node);
  }, []);

  const parentObserver = useRef<IntersectionObserver | null>(null);
  const lastParentRef = useCallback((node: HTMLDivElement | null) => {
    if (parentObserver.current) parentObserver.current.disconnect();
    parentObserver.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setParentPage((prev) => prev + 1);
      }
    });
    if (node) parentObserver.current.observe(node);
  }, []);

  const componentObserver = useRef<IntersectionObserver | null>(null);
  const lastComponentRef = useCallback((node: HTMLDivElement | null) => {
    if (componentObserver.current) componentObserver.current.disconnect();
    componentObserver.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setComponentPage((prev) => prev + 1);
      }
    });
    if (node) componentObserver.current.observe(node);
  }, []);

  const functionObserver = useRef<IntersectionObserver | null>(null);
  const lastFunctionRef = useCallback((node: HTMLDivElement | null) => {
    if (functionObserver.current) functionObserver.current.disconnect();
    functionObserver.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setFunctionPage((prev) => prev + 1);
      }
    });
    if (node) functionObserver.current.observe(node);
  }, []);

  const projectObserver = useRef<IntersectionObserver | null>(null);
  const lastProjectRef = useCallback((node: HTMLDivElement | null) => {
    if (projectObserver.current) projectObserver.current.disconnect();
    projectObserver.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setProjectPage((prev) => prev + 1);
      }
    });
    if (node) projectObserver.current.observe(node);
  }, []);

  const categoryObserver = useRef<IntersectionObserver | null>(null);
  const lastCategoryRef = useCallback((node: HTMLDivElement | null) => {
    if (categoryObserver.current) categoryObserver.current.disconnect();
    categoryObserver.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setCategoryPage((prev) => prev + 1);
      }
    });
    if (node) categoryObserver.current.observe(node);
  }, []);

  // useEffect(() => {
  //   const fetchSpecifications = async () => {
  //     if (!selectedProject) return;

  //     try {
  //       const response = await ServiceProxy.getSpecifications(
  //         selectedProject,
  //         specificationPage,
  //         pageSize,
  //         specificationSearch,
  //       );
  //       setSpecifications((prev) => [
  //         ...prev,
  //         ...(response.specifications || []),
  //       ]);
  //     } catch (error) {
  //       console.error("Failed to fetch project specifications:", error);
  //     }
  //   };

  //   fetchSpecifications();
  // }, [pageSize, selectedProject, specificationPage, specificationSearch]);

  useEffect(() => {
    const fetchInitialData = async () => {
      ServiceProxy.getCategories(selectedProject).then((data) => {
        setCategories(data.categories || []);
      });
      ServiceProxy.getComponents(selectedProject).then((data) => {
        setComponents(data.components || []);
      });
      ServiceProxy.getFunctions(selectedProject).then((data) => {
        setFunctions(data.functions || []);
      });
      ServiceProxy.getProjects().then((data) => {
        setProjects(data.projects || []);
      });
      ServiceProxy.getSpecifications(selectedProject).then((data) => {
        setSpecifications(data.specifications || []);
      });
    };
    fetchInitialData();
  }, [pageSize, selectedProject]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();

    if (projectIdForForm) formData.append("project", projectIdForForm);
    if (componentId) formData.append("component", componentId);
    if (functionId) formData.append("function", functionId);
    if (parentId) formData.append("parent", parentId);
    if (specificationId) formData.append("specification", specificationId);
    if (categoryId) formData.append("category1", categoryId);
    if (version) formData.append("version", version);
    formData.append("specification_revision_change_summary", "Manual add");

    try {
      const result =
        await ServiceProxy.createProjectSpecification(formData);
      if (result?.error) {
        alert(result.error);
      } else {
        alert("Project specification saved successfully!");
        onSuccess?.();
      }
    } catch (error) {
      console.error("Failed to save project specification:", error);
      alert("An error occurred while saving.");
    }
  };

  const filteredSpecifications = specifications.filter((spec) =>
    spec.name.toLowerCase().includes(specificationSearch.toLowerCase()),
  );
  const displayedSpecifications = filteredSpecifications.slice(
    0,
    specificationPage * pageSize,
  );

  const filteredParents = parents.filter((parent) =>
    parent.parent_name.toLowerCase().includes(parentSearch.toLowerCase()),
  );
  const displayedParents = filteredParents.slice(0, parentPage * pageSize);

  const filteredComponents = components.filter((c) =>
    c.name.toLowerCase().includes(componentSearch.toLowerCase()),
  );
  const displayedComponents = filteredComponents.slice(
    0,
    componentPage * pageSize,
  );

  const filteredFunctions = functions.filter((f) =>
    f.name.toLowerCase().includes(functionSearch.toLowerCase()),
  );
  const displayedFunctions = filteredFunctions.slice(
    0,
    functionPage * pageSize,
  );

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()),
  );
  const displayedProjects = filteredProjects.slice(0, projectPage * pageSize);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );
  const displayedCategories = filteredCategories.slice(
    0,
    categoryPage * pageSize,
  );

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="flex items-center justify-between px-4 border-b bg-muted/40 h-[44px] shrink-0">
        <div>
          <h3 className="font-semibold text-base">
            Add Project Specification
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
    <Card id="add-project-specification-card" className="w-full border-0 shadow-none ring-0 rounded-none bg-transparent">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <CardContent className="space-y-6 px-0">
          <div className="space-y-2">
            <Label htmlFor="component_name">Component</Label>
            <Select value={componentId} onValueChange={setComponentId}>
              <SelectTrigger id="component_name">
                <SelectValue placeholder="Select component" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 pb-0">
                  <Input
                    id="search-component-input"
                    placeholder="Search component..."
                    value={componentSearch}
                    onChange={(e) => setComponentSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="mb-2"
                  />
                </div>
                {displayedComponents.map((component) => (
                  <SelectItem key={component.id} value={component.id.toString()}>
                    {component.name}
                  </SelectItem>
                ))}
                {componentPage * pageSize < filteredComponents.length && (
                  <div ref={lastComponentRef} className="h-1" />
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="function_name">Function</Label>
            <Select value={functionId} onValueChange={setFunctionId}>
              <SelectTrigger id="function_name">
                <SelectValue placeholder="Select function" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 pb-0">
                  <Input
                    id="search-function-input"
                    placeholder="Search function..."
                    value={functionSearch}
                    onChange={(e) => setFunctionSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="mb-2"
                  />
                </div>
                {displayedFunctions.map((func) => (
                  <SelectItem key={func.id} value={func.id.toString()}>
                    {func.name}
                  </SelectItem>
                ))}
                {functionPage * pageSize < filteredFunctions.length && (
                  <div ref={lastFunctionRef} className="h-1" />
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent_name">Parent</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger id="parent_name">
                <SelectValue placeholder="Select parent" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 pb-0">
                  <Input
                    id="search-parent-input"
                    placeholder="Search parent..."
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="mb-2"
                  />
                </div>
                {displayedParents.map((parent, index) => (
                  <SelectItem key={parent.id} value={parent.id.toString()}>
                    {parent.parent_name}
                  </SelectItem>
                ))}
                {parentPage * pageSize < filteredParents.length && (
                  <div ref={lastParentRef} className="h-1" />
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project_name">Project</Label>
            <Select
              value={projectIdForForm}
              onValueChange={setProjectIdForForm}
            >
              <SelectTrigger id="project_name">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 pb-0">
                  <Input
                    id="search-project-input"
                    placeholder="Search project..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="mb-2"
                  />
                </div>
                {displayedProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
                {projectPage * pageSize < filteredProjects.length && (
                  <div ref={lastProjectRef} className="h-1" />
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specification_name">Specification</Label>
            <Select value={specificationId} onValueChange={setSpecificationId}>
              <SelectTrigger id="specification_name">
                <SelectValue placeholder="Select specification" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 pb-0">
                  <Input
                    id="search-specification-input"
                    placeholder="Search specification..."
                    value={specificationSearch}
                    onChange={(e) => setSpecificationSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="mb-2"
                  />
                </div>
                {displayedSpecifications.map((spec) => (
                  <SelectItem key={spec.id} value={spec.id.toString()}>
                    {spec.name}
                  </SelectItem>
                ))}
                {specificationPage * pageSize <
                  filteredSpecifications.length && (
                  <div ref={lastSpecRef} className="h-1" />
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category1">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2 pb-0">
                  <Input
                    id="search-category-input"
                    placeholder="Search category..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="mb-2"
                  />
                </div>
                {displayedCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
                {categoryPage * pageSize < filteredCategories.length && (
                  <div ref={lastCategoryRef} className="h-1" />
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="specification_version">Specification Version</Label>
            <Input
              id="specification_version"
              placeholder="e.g., 1.0.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specification_revision_change_summary">
              Change Summary
            </Label>
            <Input
              id="specification_revision_change_summary"
              placeholder="Manual add"
              value="Manual add"
              disabled
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 px-0 pb-0 rounded-none bg-transparent border-t">
          <Button
            id="reset-spec-btn"
            type="button"
            className="w-16 bg-[#3f51b5] hover:bg-[#3f51b5]/90 text-white"
            onClick={() => {}}
          >
            Reset
          </Button>
          <Button
            id="save-spec-btn"
            type="submit"
            className="w-32 bg-[#3f51b5] hover:bg-[#3f51b5]/90 text-white"
          >
            Save Specification
          </Button>
        </CardFooter>
      </form>
    </Card>
      </div>
    </div>
  );
}
