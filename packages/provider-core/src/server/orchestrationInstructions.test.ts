import { assert, describe, it } from "@effect/vitest";

import {
  ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS,
  ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS_WITH_TOOL_SEARCH,
  ROSEWOOD_ORCHESTRATION_INSTRUCTIONS,
  rosewoodAcpPromptWithInstructions,
  rosewoodOrchestrationPrompt,
  rosewoodOrchestrationSystemPrompt,
} from "./orchestrationInstructions.ts";

describe("Rosewood device instructions", () => {
  it("route device work through device_open and give Claude the line that loads the tools", () => {
    for (const intent of ["`device_list`", "`device_open`", "`agent-device`", "ssh", "`hostId`"]) {
      assert.include(ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS, intent);
    }
    assert.notInclude(ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS, "ToolSearch");
    const loadLine =
      " Load them with ToolSearch `select:mcp__rosewood__device_list,mcp__rosewood__device_open,mcp__rosewood__device_screenshot,mcp__rosewood__device_close`.";
    assert.include(ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS_WITH_TOOL_SEARCH, loadLine);
    assert.equal(
      ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS_WITH_TOOL_SEARCH.replace(loadLine, ""),
      ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS,
    );
  });

  it("open the app before the returned command's snapshots, screenshots and input", () => {
    assert.include(
      ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS,
      "its snapshots, screenshots and input need `open <app>` first,",
    );
  });

  it("keep the failure rule from taking over or closing a session another thread holds", () => {
    // agent-device's DEVICE_IN_USE advice is to rerun with the owner's --session or close it first.
    assert.include(
      ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS,
      "follow its advice once, but never reuse or close another session; if it still fails,",
    );
  });

  it("reach OpenCode and Cursor only when the session holds device access", () => {
    assert.include(
      rosewoodOrchestrationSystemPrompt(true, true),
      ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS,
    );
    assert.notInclude(rosewoodOrchestrationSystemPrompt(true, false), "## Rosewood devices");
    assert.isUndefined(rosewoodOrchestrationSystemPrompt(false, true));

    const firstRun = (hasDeviceTools: boolean) =>
      rosewoodOrchestrationPrompt({
        prompt: "Check the login screen.",
        hasRosewoodMcp: true,
        hasDeviceTools,
        orchestrationDelivered: false,
        deviceInstructionsDelivered: false,
      });
    assert.include(firstRun(true), ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS);
    assert.notInclude(firstRun(false), "## Rosewood devices");

    const laterRun = (deviceInstructionsDelivered: boolean) =>
      rosewoodOrchestrationPrompt({
        prompt: "Check the login screen.",
        hasRosewoodMcp: true,
        hasDeviceTools: true,
        orchestrationDelivered: true,
        deviceInstructionsDelivered,
      });
    assert.include(laterRun(false), ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS);
    assert.notInclude(laterRun(false), ROSEWOOD_ORCHESTRATION_INSTRUCTIONS.trim());
    assert.equal(laterRun(true), "Check the login screen.");
  });

  it("reach ACP agents again when device access changes mid-thread", () => {
    const state = {
      interactionMode: "default",
      hasRosewoodMcp: true,
      hasDeviceTools: false,
    } as const;
    const withDevices = rosewoodAcpPromptWithInstructions({
      prompt: "Check the login screen.",
      state: { ...state, hasDeviceTools: true },
      previousState: state,
    });
    assert.include(withDevices, ROSEWOOD_DEVICE_TOOL_INSTRUCTIONS);
    assert.equal(
      rosewoodAcpPromptWithInstructions({ prompt: "Again.", state, previousState: state }),
      "Again.",
    );
    assert.notInclude(
      rosewoodAcpPromptWithInstructions({ prompt: "Hi.", state }),
      "## Rosewood devices",
    );
  });
});
