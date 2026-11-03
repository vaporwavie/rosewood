import {
  ROSEWOOD_PROJECT_FILE_NAME,
  type EnvironmentId,
  type RosewoodProjectFile,
} from "@rosewood/contracts";
import { parseRosewoodProjectFile } from "@rosewood/shared/rosewoodProjectFile";
import { executeAtomQuery } from "@rosewood/client-runtime/state/runtime";

import {
  getProjectFileQueryAtom,
  resolveProjectFileQueryData,
} from "~/components/files/projectFilesQueryState";
import { appAtomRegistry } from "~/rpc/atomRegistry";

export async function readRosewoodProjectFile(
  environmentId: EnvironmentId,
  workspaceRoot: string,
): Promise<RosewoodProjectFile | null> {
  const result = await executeAtomQuery(
    appAtomRegistry,
    getProjectFileQueryAtom(environmentId, workspaceRoot, ROSEWOOD_PROJECT_FILE_NAME),
    { reportDefect: false, reportFailure: false },
  );
  const data = resolveProjectFileQueryData(
    environmentId,
    workspaceRoot,
    ROSEWOOD_PROJECT_FILE_NAME,
    result._tag === "Success" ? result.value : null,
  );
  if (data === null || data.exists === false || data.truncated) return null;
  return parseRosewoodProjectFile(data.contents);
}
