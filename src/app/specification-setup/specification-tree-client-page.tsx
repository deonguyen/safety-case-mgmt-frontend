"use client";

import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import ServiceProxy from "@/src/services/service-proxy";
import {
  faChevronDown,
  faChevronRight,
  faFolder,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

// Define the shape of a node in our hierarchy
interface JamaNode {
  id: number;
  name: string;
  children?: JamaNode[];
  type: "item" | "folder"; // Assuming the API provides a type
}

/**
 * A recursive component to render a single node in the tree.
 * It can be expanded or collapsed and renders its children.
 */
const TreeNode = ({ node }: { node: JamaNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <li className="ml-4">
      <div
        className="flex items-center cursor-pointer hover:bg-muted p-1 rounded"
        onClick={handleToggle}
      >
        {hasChildren ? (
          <FontAwesomeIcon
            icon={isOpen ? faChevronDown : faChevronRight}
            className="w-4 h-4 mr-2 text-gray-500"
          />
        ) : (
          <span className="w-4 h-4 mr-2" /> // Placeholder for alignment
        )}
        <FontAwesomeIcon
          icon={node.type === "folder" ? faFolder : faFile}
          className={`w-4 h-4 mr-2 ${node.type === "folder" ? "text-yellow-500" : "text-gray-400"}`}
        />
        <span>{node.name}</span>
      </div>
      {isOpen && hasChildren && (
        <ul className="pl-4 border-l border-gray-200">
          {node.children?.map((childNode) => (
            <TreeNode key={childNode.id} node={childNode} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function SpecificationTreeClientPage() {
  const { projectId } = useUserSettingContext();
  const [hierarchy, setHierarchy] = useState<JamaNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHierarchy = async () => {
      if (!projectId) return;

      setIsLoading(true);
      setError(null);
      try {
        const response =
          await ServiceProxy.getJamaSpecificationHierarchy(projectId);
        if (response.error) {
          setError(response.error);
        } else {
          setHierarchy(response.hierarchy || []);
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHierarchy();
  }, [projectId]);

  if (isLoading) return <div className="p-4">Loading tree...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!hierarchy.length) return <div className="p-4">No hierarchy data found for this project.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Jama Specification Hierarchy</h1>
      <ul className="space-y-1">
        {hierarchy.map((rootNode) => (
          <TreeNode key={rootNode.id} node={rootNode} />
        ))}
      </ul>
    </div>
  );
}