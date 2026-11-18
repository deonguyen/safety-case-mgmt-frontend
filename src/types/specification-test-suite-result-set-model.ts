export interface SpecificationTestSuiteResultSetModel {
  project_specification_id: number;
  project_id: number;
  project_name: string;
  specification_name: string;
  category1: string;
  category2: string;
  test_suite_id: number;
  test_suite_name: string;
  test_suite_code: string;
  test_suite_status: string;
  test_case_id: number;
  test_case_name: string;
  test_case_code: string;
  test_case_status: string;
  test_case_description: string;
  test_case_steps: string;
  expected_result: string;
  actual_result: string;
}
