import {
  ROSEWOOD_PROJECT_FILE_NAME,
  type EnvironmentId,
  type RosewoodProjectFile,
  type RosewoodProjectFileScript,
} from "@rosewood/contracts";
import { parseRosewoodProjectFile } from "@rosewood/shared/rosewoodProjectFile";

import { useProjectFileQuery } from "~/components/files/projectFilesQueryState";

const NO_SCRIPTS: ReadonlyArray<RosewoodProjectFileScript> = [];

export interface RosewoodProjectFileState {
  status: "loading" | "missing" | "invalid" | "valid";
  file: RosewoodProjectFile | null;
  scripts: ReadonlyArray<RosewoodProjectFileScript>;
}

export function useRosewoodProjectFileState(
  environmentId: EnvironmentId,
  cwd: string | null,
): RosewoodProjectFileState {
  const query = useProjectFileQuery(
    environmentId,
    cwd ?? "",
    ROSEWOOD_PROJECT_FILE_NAME,
    cwd !== null,
  );
  const contents = query.data && !query.data.truncated ? query.data.contents : null;
  const isPending = query.isPending;
  if (contents === null) {
    return {
      status: isPending ? "loading" : "missing",
      file: null,
      scripts: NO_SCRIPTS,
    } as const;
  }
  const file = parseRosewoodProjectFile(contents);
  if (file === null) {
    return { status: "invalid", file: null, scripts: NO_SCRIPTS } as const;
  }
  return { status: "valid", file, scripts: file.scripts ?? NO_SCRIPTS } as const;
}

export function useRosewoodProjectFileScripts(
  environmentId: EnvironmentId,
  cwd: string | null,
): ReadonlyArray<RosewoodProjectFileScript> {
  return useRosewoodProjectFileState(environmentId, cwd).scripts;
}
