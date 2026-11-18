export interface ProjectCodeBuildSnapshotModel {
  id: number;
  build_status: string;
  deploy_status: string;
  github_event: number;
  github_sha: string;
  project_id: number;
  workflow_run_id: string;
}
