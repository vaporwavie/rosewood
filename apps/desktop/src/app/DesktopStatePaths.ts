import * as Option from "effect/Option";

export type JoinPath = (first: string, ...segments: string[]) => string;

function normalizeConfiguredBaseDir(rosewoodHome: Option.Option<string>): Option.Option<string> {
  if (Option.isNone(rosewoodHome)) {
    return Option.none();
  }
  const trimmed = rosewoodHome.value.trim();
  return trimmed.length > 0 ? Option.some(trimmed) : Option.none();
}

export function resolveDesktopBaseDir(input: {
  readonly homeDirectory: string;
  readonly joinPath: JoinPath;
  readonly rosewoodHome: Option.Option<string>;
}): string {
  return Option.getOrElse(normalizeConfiguredBaseDir(input.rosewoodHome), () =>
    input.joinPath(input.homeDirectory, ".rosewood"),
  );
}

export function resolveDesktopStateDir(input: {
  readonly baseDir: string;
  readonly isDevelopment: boolean;
  readonly joinPath: JoinPath;
  readonly rosewoodHome: Option.Option<string>;
}): string {
  const useDevSubdir =
    input.isDevelopment && Option.isNone(normalizeConfiguredBaseDir(input.rosewoodHome));
  return input.joinPath(input.baseDir, useDevSubdir ? "dev" : "userdata");
}
