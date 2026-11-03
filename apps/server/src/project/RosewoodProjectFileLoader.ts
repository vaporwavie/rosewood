import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Path from "effect/Path";
import * as Schema from "effect/Schema";

import { ROSEWOOD_PROJECT_FILE_NAME, type RosewoodProjectFile } from "@rosewood/contracts";
import { RosewoodProjectFileFromJson } from "@rosewood/shared/rosewoodProjectFile";

const decodeRosewoodProjectFileJson = Schema.decodeEffect(RosewoodProjectFileFromJson);

export class RosewoodProjectFileLoadError extends Schema.TaggedError<RosewoodProjectFileLoadError>()(
  "RosewoodProjectFileLoadError",
  {
    operation: Schema.Literals(["read", "decode"]),
    workspaceRoot: Schema.String,
    filePath: Schema.String,
    cause: Schema.Defect(),
  },
) {
  override get message(): string {
    return `Failed to ${this.operation} ${ROSEWOOD_PROJECT_FILE_NAME} at ${this.filePath}.`;
  }
}

export class RosewoodProjectFileLoader extends Context.Service<
  RosewoodProjectFileLoader,
  {
    /** Never fails; missing/unreadable/invalid files return none, with warnings for invalid files. */
    readonly load: (workspaceRoot: string) => Effect.Effect<Option.Option<RosewoodProjectFile>>;
  }
>()("rosewood/project/RosewoodProjectFileLoader") {}

const logRosewoodProjectFileLoadError = (error: RosewoodProjectFileLoadError) =>
  Effect.logWarning(error).pipe(
    Effect.annotateLogs({
      operation: error.operation,
      workspaceRoot: error.workspaceRoot,
      filePath: error.filePath,
      errorTag: error._tag,
    }),
  );

/** @public */
export const make = Effect.gen(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const load: RosewoodProjectFileLoader["Service"]["load"] = Effect.fn(
    "RosewoodProjectFileLoader.load",
  )(function* (workspaceRoot) {
    const filePath = path.join(workspaceRoot, ROSEWOOD_PROJECT_FILE_NAME);
    const raw = yield* fileSystem.readFileString(filePath).pipe(
      Effect.asSome,
      Effect.catchTags({
        PlatformError: (error) =>
          error.reason._tag === "NotFound"
            ? Effect.succeed(Option.none<string>())
            : logRosewoodProjectFileLoadError(
                new RosewoodProjectFileLoadError({
                  operation: "read",
                  workspaceRoot,
                  filePath,
                  cause: error,
                }),
              ).pipe(Effect.as(Option.none<string>())),
      }),
    );
    if (Option.isNone(raw)) {
      return Option.none<RosewoodProjectFile>();
    }
    return yield* decodeRosewoodProjectFileJson(raw.value).pipe(
      Effect.asSome,
      Effect.catchTags({
        SchemaError: (error) =>
          logRosewoodProjectFileLoadError(
            new RosewoodProjectFileLoadError({
              operation: "decode",
              workspaceRoot,
              filePath,
              cause: error,
            }),
          ).pipe(Effect.as(Option.none<RosewoodProjectFile>())),
      }),
    );
  });

  return RosewoodProjectFileLoader.of({ load });
});

export const layer = Layer.effect(RosewoodProjectFileLoader, make);
