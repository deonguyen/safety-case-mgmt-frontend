export interface SpecificationTestCaseModel {
  id: number;
  actual_result: string;
  code: string;
  description: string;
  expected_result: string;
  name: string;
  project_id: number;
  specification_id: number;
  specification_revision_id: number;
  specification_test_suite_id: number;
  status: string;
  steps: string;
}