import { resolveFilesystemReadAccess } from "@rosewood/client-runtime/state/filesystem";
import { isScratchProject } from "@rosewood/client-runtime/state/projects";
import type { EnvironmentProject } from "@rosewood/client-runtime/state/shell";
import type { ProjectReadFileResult } from "@rosewood/contracts";
import { DEFAULT_SERVER_SETTINGS, ROSEWOOD_PROJECT_FILE_NAME } from "@rosewood/contracts";
import { resolveNewThreadEnvMode, resolveProjectSettings } from "@rosewood/shared/projectSettings";
import { parseRosewoodProjectFile } from "@rosewood/shared/rosewoodProjectFile";

import { useEnvironmentServerConfig } from "../../state/entities";
import { useEnvironmentPresentation } from "../../state/presentation";
import { useProjectHasThreads } from "../../state/project-has-threads";
import { projectEnvironment } from "../../state/projects";
import { useEnvironmentQuery } from "../../state/query";
import { environmentSession } from "../../state/session";

/**
 * A project's new-task defaults: server settings merged with its rosewood.json. The
 * new-task flow and the home pending-drafts list both read the default
 * workspace mode here, so a draft that never picked one shows what it sends.
 * Every read is a shared per-environment or per-project atom.
 */
export function useNewTaskProjectDefaults(project: EnvironmentProject | null) {
  const serverConfig = useEnvironmentServerConfig(project?.environmentId ?? null);
  const isScratch =
    project !== null && isScratchProject(project, serverConfig?.scratchWorkspaceRoot);
  const hasWorkspace = project !== null && project.workspaceRoot !== "";
  const fileAccessSession = useEnvironmentQuery(
    hasWorkspace ? environmentSession.sessionStateAtom(project.environmentId) : null,
  );
  const fileEnvironment = useEnvironmentPresentation(project?.environmentId ?? null);
  const fileAccess = resolveFilesystemReadAccess({
    isCatalogReady: fileEnvironment.isReady,
    connection: fileEnvironment.presentation?.connection ?? null,
    session: fileAccessSession.data,
    sessionError: fileAccessSession.error,
  });
  const fileAccessPending = hasWorkspace && fileAccess.isPending;
  const rosewoodProjectFileQuery = useEnvironmentQuery(
    fileAccess.canReadFiles && hasWorkspace
      ? projectEnvironment.readFile({
          environmentId: project.environmentId,
          input: {
            cwd: project.workspaceRoot,
            relativePath: ROSEWOOD_PROJECT_FILE_NAME,
            allowMissing: true,
          },
        })
      : null,
  );
  const rosewoodProjectFileData = rosewoodProjectFileQuery.data as ProjectReadFileResult | null;
  const rosewoodProjectFile =
    rosewoodProjectFileData === null ||
    rosewoodProjectFileData.exists === false ||
    rosewoodProjectFileData.truncated
      ? null
      : parseRosewoodProjectFile(rosewoodProjectFileData.contents);
  const projectSettings = resolveProjectSettings(
    serverConfig?.settings ?? DEFAULT_SERVER_SETTINGS,
    project?.id ?? null,
    project,
    rosewoodProjectFile,
  );
  const projectHasThreads = useProjectHasThreads(project);
  const defaultWorkspaceMode = isScratch
    ? "local"
    : resolveNewThreadEnvMode({
        projectSettings,
        workspaceRoot: project?.workspaceRoot ?? null,
        newProjectsRoot: serverConfig?.newProjectsRoot,
        projectHasThreads,
      });
  // While rosewood.json loads, the environment default is provisional; rosewood.json may replace it.
  const defaultWorkspaceModeSettled =
    projectSettings.sources.defaultThreadEnvMode !== "environment" ||
    (!rosewoodProjectFileQuery.isPending && !fileAccessPending);
  return {
    serverConfig,
    isScratch,
    projectSettings,
    defaultWorkspaceMode,
    defaultWorkspaceModeSettled,
  };
}
