import * as Exit from "effect/Exit";
import * as Schema from "effect/Schema";

import { RosewoodProjectFile, ROSEWOOD_PROJECT_FILE_SCHEMA_URL } from "@rosewood/contracts";

import { fromLenientJson } from "./schemaJson.ts";

export const RosewoodProjectFileFromJson = fromLenientJson(RosewoodProjectFile);

const decodeRosewoodProjectFile = Schema.decodeExit(RosewoodProjectFileFromJson);

export function parseRosewoodProjectFile(contents: string): RosewoodProjectFile | null {
  const decoded = decodeRosewoodProjectFile(contents);
  return Exit.isSuccess(decoded) ? decoded.value : null;
}

export function buildRosewoodProjectFileJsonSchema(): Record<string, unknown> {
  const document = Schema.toJsonSchemaDocument(RosewoodProjectFile, { onExcessProperty: "error" });
  const jsonSchema: Record<string, unknown> = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: ROSEWOOD_PROJECT_FILE_SCHEMA_URL,
    ...document.schema,
  };
  if (document.definitions && Object.keys(document.definitions).length > 0) {
    jsonSchema.$defs = document.definitions;
  }
  return jsonSchema;
}
