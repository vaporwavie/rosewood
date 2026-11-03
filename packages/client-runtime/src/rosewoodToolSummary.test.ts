import { describe, expect, it } from "vite-plus/test";

import { summarizeRosewoodToolCalls, type RosewoodToolSummaryCall } from "./rosewoodToolSummary.ts";

function completed(input: unknown, output?: unknown): RosewoodToolSummaryCall {
  return { input, output, outcome: "completed" };
}

describe("summarizeRosewoodToolCalls", () => {
  it("reads provider result envelopes without treating JSON in the message as result data", () => {
    const result = { messageId: "message-1", threadId: "actual-thread" };
    const json = JSON.stringify(result);
    const outputs = [
      result,
      { structuredContent: result },
      [{ type: "text", text: json }],
      { content: [{ text: { text: json } }], isError: false },
      json,
    ];
    const calls = outputs.map((output) =>
      completed(
        {
          toolName: "rw_thread_send",
          args: { threadId: "input-thread", message: '{"threadId":"fake"}' },
        },
        output,
      ),
    );
    expect(summarizeRosewoodToolCalls("thread-send", calls).label).toBe(
      "Sent 1 message to 1 thread",
    );
    expect(
      summarizeRosewoodToolCalls("thread-send", [
        completed({ toolName: "rw_thread_send", args: { threadId: "input-thread" } }),
        completed({ threadId: "input-thread" }),
      ]).label,
    ).toBe("Sent 2 messages to 1 thread");
  });

  it("counts the pull requests batch link and unlink calls changed", () => {
    const urls = ["https://github.com/o/r/pull/1", "https://github.com/o/r/pull/1", "not-a-pr"];
    const links = completed({ urls }, { linkedCount: 1 });
    expect(summarizeRosewoodToolCalls("link-pr", [links, completed({ number: 3 })]).label).toBe(
      "Linked 2 pull requests",
    );
    expect(summarizeRosewoodToolCalls("link-pr", [completed({ urls }, {})]).label).toBe(
      "Linked pull requests",
    );
    const batch = completed({ states: ["merged"] }, { unlinkedCount: 2 });
    expect(summarizeRosewoodToolCalls("unlink-pr", [batch, completed({ number: 3 })]).label).toBe(
      "Unlinked 3 pull requests",
    );
    const uncounted = completed({ states: ["merged"] }, { isError: false });
    expect(summarizeRosewoodToolCalls("unlink-pr", [uncounted]).label).toBe(
      "Unlinked pull requests",
    );
  });

  it("excludes failed and unfinished sends even if the provider reports completed", () => {
    const calls: RosewoodToolSummaryCall[] = [
      completed({ threadId: "success" }, { messageId: "ok", threadId: "success" }),
      completed(
        { threadId: "failed" },
        { isError: true, structuredContent: { threadId: "failed" } },
      ),
      completed({ threadId: "failed" }, [
        { type: "text", text: JSON.stringify({ _tag: "OrchestratorMcpFailure" }) },
      ]),
      { input: { threadId: "cancelled" }, output: undefined, outcome: "unfinished" },
    ];
    expect(summarizeRosewoodToolCalls("thread-send", calls)).toEqual({
      label: "Sent 1 message to 1 thread",
      failedCount: 2,
    });
    expect(summarizeRosewoodToolCalls("thread-send", [calls[1]!])).toEqual({
      label: "Tried to send 1 message to 1 thread",
      failedCount: 1,
    });
  });

  it("does not confuse a child's failure or wait timeout with failure of the orchestration call", () => {
    const failedChild = { taskId: "task-1", status: "failed", summary: "command not found" };
    expect(
      summarizeRosewoodToolCalls("delegate", [
        completed({}, failedChild),
        completed({}, failedChild),
      ]),
    ).toEqual({
      label: "Delegated 1 task",
      failedCount: 0,
    });
    expect(
      summarizeRosewoodToolCalls(
        "task-status",
        Array.from({ length: 4 }, () => completed({ taskId: "task-1" }, failedChild)),
      ).label,
    ).toBe("Checked task status 4 times");
    expect(
      summarizeRosewoodToolCalls("thread-wait", [
        completed({ threadId: "thread-1" }, { threadId: "thread-1", timedOut: true }),
      ]),
    ).toEqual({
      label: "Waited on 1 thread",
      failedCount: 0,
    });
  });
});
