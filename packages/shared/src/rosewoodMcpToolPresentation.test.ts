import { describe, expect, it } from "vite-plus/test";

import {
  ROSEWOOD_MCP_TOOL_NAMES,
  resolveRosewoodMcpSummaryAction,
  resolveRosewoodMcpToolDefinition,
  resolveRosewoodMcpToolPresentation,
} from "./rosewoodMcpToolPresentation.ts";

describe("resolveRosewoodMcpToolPresentation", () => {
  it("recognizes every Rosewood tool across provider prefixes and completion suffixes", () => {
    for (const tool of ROSEWOOD_MCP_TOOL_NAMES) {
      const presentation = resolveRosewoodMcpToolPresentation(tool);
      for (const prefix of [
        "mcp__rosewood__",
        "mcp__rosewood__",
        "mcp__rosewood__",
        "Rosewood.",
        "rosewood.",
        "rosewood-direct.",
        "mcp__rosewood_direct__",
        "rosewood/",
        "rosewood:",
        "mcp_rosewood_",
        "Rosewood ",
        "rosewood · ",
      ]) {
        expect(resolveRosewoodMcpToolPresentation(`${prefix}${tool} completed`), tool).toEqual(
          presentation,
        );
      }
      expect(resolveRosewoodMcpToolPresentation(`mcp__another-server__${tool}`), tool).toBeNull();
    }
  });

  it("matches OpenCode 2's per-thread server names, whose thread ids hold underscores", () => {
    expect(
      resolveRosewoodMcpToolPresentation("rosewood-thread_opencode2-adapter_delegate_task")
        ?.displayName,
    ).toBe("Delegate a child task");
    expect(
      resolveRosewoodMcpToolPresentation("rosewood-thread_opencode2-adapter_not_a_tool"),
    ).toBeNull();
  });
});

describe("resolveRosewoodMcpToolDefinition", () => {
  it("labels an action tool call as the action it ran", () => {
    expect(
      resolveRosewoodMcpToolDefinition("mcp__rosewood__preview_act", { action: "type" })?.labels,
    ).toEqual(resolveRosewoodMcpToolDefinition("preview_type")?.labels);
    expect(
      resolveRosewoodMcpToolDefinition("rw_thread_transfer", { action: "fork" })?.displayName,
    ).toBe(resolveRosewoodMcpToolDefinition("rw_thread_fork")?.displayName);
    expect(resolveRosewoodMcpToolDefinition("preview_act", { action: "unknown" })?.labels[2]).toBe(
      "Used",
    );
  });
});

describe("resolveRosewoodMcpSummaryAction", () => {
  it("summarizes an action tool by the action each call ran", () => {
    expect(resolveRosewoodMcpSummaryAction("mcp__rosewood__rw_queue", { action: "list" })).toBe(
      "queue-list",
    );
    expect(resolveRosewoodMcpSummaryAction("rw_queue", { action: "edit" })).toBe("queue-edit");
    expect(resolveRosewoodMcpSummaryAction("rw_thread_transfer", { action: "status" })).toBe(
      "thread-transfers",
    );
    expect(resolveRosewoodMcpSummaryAction("rw_thread_configure", {})).toBe("thread-configuration");
    expect(resolveRosewoodMcpSummaryAction("schedule_task", { scheduledTaskId: "task-1" })).toBe(
      "schedule-update",
    );
    expect(resolveRosewoodMcpSummaryAction("delegate_task", { task: "x" })).toBe("delegate");
  });
});
