import * as AzureDevOpsDriver from "@rosewood/source-control-azure-devops/server/driver";
import * as BitbucketDriver from "@rosewood/source-control-bitbucket/server/driver";
import { builtInSourceControlDefinitions } from "@rosewood/source-control-definitions/registry";
import * as ForgejoDriver from "@rosewood/source-control-forgejo/server/driver";
import * as GitCafeDriver from "@rosewood/source-control-gitcafe/server/driver";
import * as GitHubDriver from "@rosewood/source-control-github/server/driver";
import * as GitLabDriver from "@rosewood/source-control-gitlab/server/driver";

/** In the shared registry's order, which is the order hosts are listed and probed in. */
export const BUILT_IN_SOURCE_CONTROL_DRIVER_LIST = [
  GitHubDriver.driver,
  GitLabDriver.driver,
  GitCafeDriver.driver,
  ForgejoDriver.driver,
  BitbucketDriver.driver,
  AzureDevOpsDriver.driver,
] as const;

export const sourceControlDefinitions = builtInSourceControlDefinitions;
