export interface MilestoneData {
  version: string;
  project_milestone_id: number;
  project_specification_id: number;
  specification_revision_id: number;
  specification_revision_content: string;
  specification_revision_raw_content: string;
  specification_revision_interface: string;
}

export interface ProjectSpecificationMilestoneBaselineQueryModel {
  category1: string;
  category2: string;
  component_id: number;
  component_name: string;
  function_id: number;
  function_name: string;
  latest_specification_revision_content: string;
  latest_specification_revision_id: number;
  latest_specification_revision_raw_content: string;
  latest_specification_revision_version: string;
  milestones: string | Record<string, MilestoneData> | null;
  parent_id: number;
  parent_name: string;
  project_id: number;
  project_name: string;
  project_specification_id: number;
  specification_content: string;
  specification_id: number;
  specification_interface: string;
  specification_name: string;
  specification_raw_content: string;
  specification_source: string;
  specification_type: string;
  specification_version: string;
}

export interface ProjectSpecificationMilestoneBaselinePaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProjectSpecificationMilestoneBaselineQueryModel[];
}
