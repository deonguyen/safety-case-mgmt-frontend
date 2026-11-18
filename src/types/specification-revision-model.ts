export interface SpecificationRevisionModel {
  id: number;
  change_date: Date;
  change_summary: string;
  version: string;
  previous_version: string;
  specification_id: number;
  updated_by: number;
  local_file_path: string;
  local_file_fullpath: string;
}
