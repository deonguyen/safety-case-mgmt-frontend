import * as authService from "./auth-service";
import * as categoryService from "./category-service";
import * as componentService from "./component-service";
import * as functionService from "./function-service";
import * as googleVertexAiService from "./generative-ai-service";
import * as projectMilestoneService from "./project-milestone-service";
import * as projectService from "./project-service";
import * as projectSpecificationMilestoneBaselineService from "./project-specification-milestone-baseline-service";
import * as projectSpecificationService from "./project-specification-service";
import * as specificationCentralizeService from "./specification-centralize-service";
import * as specificationRevisionService from "./specification-revision-service";
import * as specificationService from "./specification-service";
import * as specificationTestCaseService from "./specification-test-case-service";
import * as specificationTestSuiteService from "./specification-test-suite-service";
import * as userService from "./user-service";
import * as buildSnapshotService from "./build-snapshot-service";
import * as githubService from "./github-service";

// Combine all known service modules into a single object
const allServices = {
  ...authService,
  ...categoryService,
  ...componentService,
  ...functionService,
  ...googleVertexAiService,
  ...projectMilestoneService,
  ...projectService,
  ...projectSpecificationMilestoneBaselineService,
  ...projectSpecificationService,
  ...specificationCentralizeService,
  ...specificationRevisionService,
  ...specificationService,
  ...specificationTestCaseService,
  ...specificationTestSuiteService,
  ...userService,
  ...buildSnapshotService,
  ...githubService
};

/**
 * ServiceProxy acts as a centralized facade/proxy to call any method from the services folder.
 * Using a Javascript Proxy allows us to intercept and potentially log or handle errors for all service calls globally.
 */
export const ServiceProxy = new Proxy(allServices, {
  get(target, prop: keyof typeof allServices) {
    if (prop in target) {
      const targetProperty = target[prop];

      // Intercept function calls (e.g., API requests)
      if (typeof targetProperty === "function") {
        return async (...args: any[]) => {
          // You can add global logging, error handling, or metrics here
          // console.log(`[ServiceProxy] Calling ${String(prop)}`);
          const result = await (targetProperty as Function)(...args);

          if (
            prop !== "login" &&
            result &&
            typeof result === "object" &&
            result.status === 401
          ) {
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }

          return result;
        };
      }

      return targetProperty;
    }
    throw new Error(
      `[ServiceProxy] Service method or property "${String(prop)}" does not exist.`,
    );
  },
}) as typeof allServices;

export default ServiceProxy;
