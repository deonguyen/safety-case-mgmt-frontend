export interface CodeImplementationTraceLogModel {
  id: number;
  code_implementation_trace_id: number;
  project_id: number;
  specification_name: string;
  trace_type: string;
  // specification_id:number;
  // specification_revision_id:number;
  // project_specification_id:number;
  // project_milestone_id:number;
  // project_milestone_name:string;
  // project_name:string;
  // user_id:number;
  pull_request_comments: string;
  pull_request_title: string;
  pull_request_link: string;
  pull_request_sha: string;
  name: string;
  path: string;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
}
