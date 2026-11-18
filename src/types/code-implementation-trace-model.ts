export interface CodeImplementationTraceModel {
  id: number;
  code_implementation_status: string;
  milestone_id: number | null;
  project_id: number;
  project_specification_id: number;
  specification_id: number;
  specification_name: string;
  specification_revision_id: number;
  latest_version: string;
  type: string;
}
