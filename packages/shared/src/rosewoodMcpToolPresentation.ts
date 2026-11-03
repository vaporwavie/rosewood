export type RosewoodMcpToolLogo = "rosewood";

export interface RosewoodMcpToolPresentation {
  readonly displayName: string;
  readonly logo: RosewoodMcpToolLogo;
}

export type RosewoodMcpToolSummaryAction =
  | "capabilities"
  | "delegate"
  | "task-status"
  | "task-cancel"
  | "schedule-run"
  | "schedule-create"
  | "schedule-list"
  | "schedule-update"
  | "schedule-delete"
  | "thread-create"
  | "thread-list"
  | "thread-read"
  | "thread-send"
  | "thread-wait"
  | "thread-interrupt"
  | "workflow-stop"
  | "background-wait"
  | "thread-configuration"
  | "thread-configure"
  | "thread-fork"
  | "thread-merge"
  | "thread-search"
  | "thread-transfers"
  | "thread-organize"
  | "thread-update"
  | "queue-list"
  | "queue-read"
  | "queue-edit"
  | "queue-cancel"
  | "queue-reorder"
  | "queue-steer"
  | "question-list"
  | "question-read"
  | "question-respond"
  | "secret-request"
  | "worktree-handoff"
  | "worktree-list"
  | "worktree-status"
  | "project-list"
  | "project-read"
  | "project-create"
  | "project-update"
  | "project-delete"
  | "project-clone"
  | "environment-read"
  | "environment-links"
  | "environment-link"
  | "environment-unlink"
  | "environment-update"
  | "attachment-prepare"
  | "attachment-discard"
  | "attachment-send"
  | "link-pr"
  | "unlink-pr"
  | "list-prs"
  | "watch-pr"
  | "unwatch-pr"
  | "write-pr-guides"
  | "read-pr-guide"
  | "browser"
  | "device"
  | "html-preview"
  | "html-render";

export interface RosewoodMcpToolDefinition {
  readonly displayName: string;
  readonly labels: readonly [action: string, running: string, completed: string, detail: string];
  readonly icon: "rosewood" | "browser" | "device" | "pull-request";
  readonly summaryAction: RosewoodMcpToolSummaryAction;
}

function tool(
  labels: RosewoodMcpToolDefinition["labels"],
  summaryAction: RosewoodMcpToolSummaryAction,
  icon: RosewoodMcpToolDefinition["icon"] = "rosewood",
  displayName = `${labels[0]} ${labels[3]}`,
): RosewoodMcpToolDefinition {
  return { displayName, labels, icon, summaryAction };
}

// Codex registers "rosewood-direct" for Rosewood tools kept out of Code Mode.
const ROSEWOOD_MCP_SERVER_ALIASES = new Set([
  "rosewood",
  "rosewood",
  "rosewood",
  "rosewood-direct",
  "rosewood_direct",
]);

const ROSEWOOD_MCP_TOOLS: Readonly<Record<string, RosewoodMcpToolDefinition>> = {
  link_pull_request: tool(
    ["Link", "Linking", "Linked", "a pull request"],
    "link-pr",
    "pull-request",
  ),
  link_pull_requests: tool(
    ["Link", "Linking", "Linked", "pull requests"],
    "link-pr",
    "pull-request",
  ),
  unlink_pull_request: tool(
    ["Unlink", "Unlinking", "Unlinked", "a pull request"],
    "unlink-pr",
    "pull-request",
  ),
  unlink_pull_requests: tool(
    ["Unlink", "Unlinking", "Unlinked", "pull requests by state"],
    "unlink-pr",
    "pull-request",
  ),
  list_thread_pull_requests: tool(
    ["Check", "Checking", "Checked", "linked pull requests"],
    "list-prs",
    "pull-request",
  ),
  watch_pull_request: tool(
    ["Watch", "Watching", "Watching", "a pull request"],
    "watch-pr",
    "pull-request",
  ),
  unwatch_pull_request: tool(
    ["Stop watching", "Unwatching", "Stopped watching", "a pull request"],
    "unwatch-pr",
    "pull-request",
  ),
  write_pull_request_guides: tool(
    ["Write", "Writing", "Started writing", "review guides"],
    "write-pr-guides",
    "pull-request",
  ),
  read_pull_request_guide: tool(
    ["Read", "Reading", "Read", "a review guide"],
    "read-pr-guide",
    "pull-request",
  ),
  orchestrator_capabilities: tool(
    ["Get", "Getting", "Got", "orchestration capabilities"],
    "capabilities",
  ),
  delegate_task: tool(["Delegate", "Delegating", "Delegated", "a child task"], "delegate"),
  task_status: tool(["Get", "Getting", "Got", "delegated task status"], "task-status"),
  task_cancel: tool(
    ["Cancel", "Canceling", "Requested cancellation of", "a delegated task"],
    "task-cancel",
  ),
  schedule_task: tool(["Schedule", "Scheduling", "Scheduled", "a task"], "schedule-create"),
  list_scheduled_tasks: tool(["List", "Listing", "Listed", "scheduled tasks"], "schedule-list"),
  update_scheduled_task: tool(
    ["Update", "Updating", "Updated", "a scheduled task"],
    "schedule-update",
  ),
  delete_scheduled_task: tool(
    ["Delete", "Deleting", "Requested deletion of", "a scheduled task"],
    "schedule-delete",
  ),
  request_secret: tool(["Ask for", "Asking for", "Asked for", "a secret"], "secret-request"),
  create_threads: tool(["Create", "Creating", "Created", "Rosewood threads"], "thread-create"),
  rw_thread_start: tool(["Start", "Starting", "Started", "a Rosewood thread"], "thread-create"),
  rw_thread_list: tool(["List", "Listing", "Listed", "Rosewood threads"], "thread-list"),
  rw_thread_read: tool(["Read", "Reading", "Read", "a Rosewood thread"], "thread-read"),
  rw_thread_send: tool(["Send", "Sending", "Sent", "to a Rosewood thread"], "thread-send"),
  rw_thread_wait: tool(["Wait", "Waiting", "Waited", "for a Rosewood thread"], "thread-wait"),
  rw_workflow_stop: tool(
    ["Stop", "Stopping", "Requested a stop for", "a workflow"],
    "workflow-stop",
  ),
  rw_background_wait: tool(
    ["Update", "Updating", "Updated", "background waits"],
    "background-wait",
  ),
  rw_thread_interrupt: tool(
    ["Interrupt", "Interrupting", "Requested an interrupt of", "a Rosewood thread"],
    "thread-interrupt",
  ),
  rw_worktree_handoff: tool(
    ["Hand off", "Handing off", "Handed off", "thread to a git worktree"],
    "worktree-handoff",
  ),
  rw_worktree_status: tool(["Get", "Getting", "Got", "thread worktree status"], "worktree-status"),
  preview_status: tool(["Get", "Getting", "Got", "preview browser status"], "browser", "browser"),
  preview_open: tool(
    ["Open", "Opening", "Opened", "a page in the preview browser"],
    "browser",
    "browser",
  ),
  preview_navigate: tool(
    ["Navigate", "Navigating", "Navigated", "the preview browser"],
    "browser",
    "browser",
  ),
  preview_dialog: tool(
    ["Respond", "Responding", "Responded", "to a preview browser dialog"],
    "browser",
    "browser",
  ),
  preview_snapshot: tool(
    ["Take a snapshot of", "Taking a snapshot of", "Took a snapshot of", "the preview page"],
    "browser",
    "browser",
    "Snapshot the preview page",
  ),
  preview_act: tool(["Use", "Using", "Used", "the preview browser"], "browser", "browser"),
  preview_click: tool(
    ["Click", "Clicking", "Clicked", "in the preview browser"],
    "browser",
    "browser",
  ),
  preview_press: tool(
    ["Press", "Pressing", "Pressed", "a key in the preview browser"],
    "browser",
    "browser",
  ),
  preview_type: tool(["Type", "Typing", "Typed", "in the preview browser"], "browser", "browser"),
  preview_hover: tool(
    ["Hover", "Hovering", "Hovered", "in the preview browser"],
    "browser",
    "browser",
  ),
  preview_select: tool(
    ["Choose", "Choosing", "Chose", "an option in the preview browser"],
    "browser",
    "browser",
  ),
  preview_drag: tool(
    ["Drag", "Dragging", "Dragged", "in the preview browser"],
    "browser",
    "browser",
  ),
  preview_upload: tool(
    ["Upload", "Uploading", "Uploaded", "files to the preview browser"],
    "browser",
    "browser",
  ),
  preview_scroll: tool(
    ["Scroll", "Scrolling", "Scrolled", "the preview browser"],
    "browser",
    "browser",
  ),
  preview_resize: tool(
    ["Resize", "Resizing", "Resized", "the preview browser"],
    "browser",
    "browser",
  ),
  preview_evaluate: tool(
    ["Evaluate", "Evaluating", "Evaluated", "script in the preview browser"],
    "browser",
    "browser",
  ),
  preview_wait_for: tool(
    ["Wait", "Waiting", "Waited", "for the preview page"],
    "browser",
    "browser",
  ),
  preview_set_appearance: tool(
    ["Set", "Setting", "Set", "preview browser appearance"],
    "browser",
    "browser",
  ),
  preview_recording_start: tool(
    ["Start", "Starting", "Started", "recording the preview browser"],
    "browser",
    "browser",
  ),
  preview_recording_stop: tool(
    ["Stop", "Stopping", "Stopped", "recording the preview browser"],
    "browser",
    "browser",
  ),
  device_list: tool(["List", "Listing", "Listed", "simulators and emulators"], "device", "device"),
  device_open: tool(
    ["Open", "Opening", "Opened", "a device in the Device panel"],
    "device",
    "device",
  ),
  device_screenshot: tool(
    ["Take a screenshot of", "Taking a screenshot of", "Took a screenshot of", "the device"],
    "device",
    "device",
  ),
  device_close: tool(["Close", "Closing", "Closed", "a device"], "device", "device"),
  run_scheduled_task_now: tool(
    ["Run", "Running", "Requested a run of", "a scheduled task"],
    "schedule-run",
  ),
  rw_queue: tool(["Manage", "Managing", "Managed", "queued messages"], "queue-edit"),
  rw_pending_request: tool(
    ["Handle", "Handling", "Handled", "pending questions"],
    "question-respond",
  ),
  rw_queue_list: tool(["List", "Listing", "Listed", "queued messages"], "queue-list"),
  rw_queue_read: tool(["Read", "Reading", "Read", "a queued message"], "queue-read"),
  rw_queue_edit: tool(["Edit", "Editing", "Edited", "a queued message"], "queue-edit"),
  rw_queue_cancel: tool(
    ["Cancel", "Canceling", "Requested cancellation of", "a queued run"],
    "queue-cancel",
  ),
  rw_queue_reorder: tool(["Reorder", "Reordering", "Reordered", "a queued run"], "queue-reorder"),
  rw_queue_promote_to_steer: tool(
    ["Steer with", "Steering with", "Requested steering with", "a queued message"],
    "queue-steer",
  ),
  rw_pending_request_list: tool(
    ["List", "Listing", "Listed", "pending questions"],
    "question-list",
  ),
  rw_pending_request_read: tool(["Read", "Reading", "Read", "pending questions"], "question-read"),
  rw_pending_request_respond: tool(
    ["Answer", "Answering", "Answered", "pending questions"],
    "question-respond",
  ),
  rw_thread_configuration: tool(
    ["Read", "Reading", "Read", "thread configuration"],
    "thread-configuration",
  ),
  rw_thread_configure: tool(["Use", "Using", "Used", "thread model settings"], "thread-configure"),
  rw_thread_transfer: tool(["Use", "Using", "Used", "thread transfers"], "thread-fork"),
  rw_thread_fork: tool(["Fork", "Forking", "Requested a fork of", "this thread"], "thread-fork"),
  rw_thread_merge_back: tool(
    ["Merge", "Merging", "Requested a merge of", "thread context"],
    "thread-merge",
  ),
  rw_thread_search: tool(["Search", "Searching", "Searched", "thread content"], "thread-search"),
  rw_thread_transfers: tool(["Read", "Reading", "Read", "thread transfers"], "thread-transfers"),
  rw_thread_organize: tool(["Organize", "Organizing", "Organized", "a thread"], "thread-organize"),
  rw_thread_update: tool(
    ["Update", "Updating", "Updated", "Rosewood thread metadata"],
    "thread-update",
  ),
  rw_worktree_list: tool(["List", "Listing", "Listed", "workspace branches"], "worktree-list"),
  rw_preview_list: tool(["List", "Listing", "Listed", "preview tabs"], "browser", "browser"),
  rw_preview_close: tool(["Close", "Closing", "Closed", "a preview tab"], "browser", "browser"),
  rw_environment_read: tool(
    ["Read", "Reading", "Read", "environment preferences"],
    "environment-read",
  ),
  rw_environment_links: tool(
    ["List", "Listing", "Listed", "linked environments"],
    "environment-links",
  ),
  rw_environment_link: tool(
    ["Ask to link", "Asking to link", "Asked to link", "an environment"],
    "environment-link",
  ),
  rw_environment_unlink: tool(
    ["Forget", "Forgetting", "Forgot", "a linked environment"],
    "environment-unlink",
  ),
  rw_environment_preferences_update: tool(
    ["Update", "Updating", "Updated", "environment preferences"],
    "environment-update",
  ),
  rw_thread_launch: tool(["Launch", "Launching", "Launched", "a project thread"], "thread-create"),
  rw_project_list: tool(["List", "Listing", "Listed", "projects"], "project-list"),
  rw_project_read: tool(["Read", "Reading", "Read", "a project"], "project-read"),
  rw_project_create: tool(["Register", "Registering", "Registered", "a project"], "project-create"),
  rw_project_update: tool(["Update", "Updating", "Updated", "a project"], "project-update"),
  rw_project_delete: tool(["Delete", "Deleting", "Deleted", "a project"], "project-delete"),
  rw_project_clone: tool(["Clone", "Cloning", "Cloned", "a repository"], "project-clone"),
  rw_attachment_prepare_upload: tool(
    ["Prepare", "Preparing", "Prepared", "an attachment upload"],
    "attachment-prepare",
  ),
  rw_attachment_discard: tool(
    ["Discard", "Discarding", "Discarded", "a pending attachment"],
    "attachment-discard",
  ),
  rw_thread_send_attachments: tool(["Send", "Sending", "Sent", "attachments"], "attachment-send"),
  html_preview: tool(["Preview", "Previewing", "Previewed", "an HTML page"], "html-preview"),
  html_render: tool(["Render", "Rendering", "Rendered", "an HTML page"], "html-render"),
};

export const ROSEWOOD_MCP_TOOL_NAMES: ReadonlySet<string> = new Set(
  Object.keys(ROSEWOOD_MCP_TOOLS),
);

function normalizeRosewoodMcpToolLabel(value: string): string {
  return value.replace(/\s+(?:complete|completed)\s*$/i, "").trim();
}

// ACP tool prefixes vary; match loosely but require a known display-name entry.
function resolveRosewoodMcpToolName(value: string): string | null {
  const label = normalizeRosewoodMcpToolLabel(value);
  const mcpMatch = /^mcp__(?<server>.+?)__(?<tool>.+)$/i.exec(label);
  if (mcpMatch?.groups) {
    const { server, tool } = mcpMatch.groups;
    return server !== undefined &&
      tool !== undefined &&
      ROSEWOOD_MCP_SERVER_ALIASES.has(server.toLowerCase())
      ? tool
      : null;
  }

  const namespaceMatch =
    /^(?<server>rosewood[-_]direct|rosewood|rosewood|rosewood)(?:[.:/]|\s*·\s*)(?<tool>.+)$/i.exec(
      label,
    );
  if (namespaceMatch?.groups) {
    return namespaceMatch.groups.tool ?? null;
  }

  const prefixed = /^(?:mcp[-_]{1,2})?rosewood(?:__|[-_.:/ ])(?<tool>.+)$/i.exec(label);
  const candidate = prefixed?.groups?.tool ?? label;
  if (Object.hasOwn(ROSEWOOD_MCP_TOOLS, candidate)) return candidate;
  // OpenCode 2 thread prefixes can contain underscores; choose the longest known tool-name suffix.
  if (!/^rosewood-/i.test(label)) return null;
  let longest: string | null = null;
  for (const tool of Object.keys(ROSEWOOD_MCP_TOOLS)) {
    if (label.endsWith(`_${tool}`) && tool.length > (longest?.length ?? 0)) longest = tool;
  }
  return longest;
}

export function resolveRosewoodMcpToolId(toolName: string | null | undefined): string | null {
  const name = toolName == null ? null : resolveRosewoodMcpToolName(toolName);
  return name !== null && Object.hasOwn(ROSEWOOD_MCP_TOOLS, name) ? name : null;
}

type SummaryInput = Readonly<Record<string, unknown>>;

const asSummaryInput = (input: unknown): SummaryInput | undefined =>
  typeof input === "object" && input !== null ? (input as SummaryInput) : undefined;

/** Action tools present each call as the single-purpose tool its action replaced. */
const ACTION_TOOLS: Readonly<Record<string, (action: string) => string | undefined>> = {
  preview_act: (action) => `preview_${action}`,
  rw_queue: (action) => `rw_queue_${action}`,
  rw_pending_request: (action) => `rw_pending_request_${action}`,
  rw_thread_transfer: (action) =>
    ({ fork: "rw_thread_fork", merge_back: "rw_thread_merge_back", status: "rw_thread_transfers" })[
      action
    ],
};

/** Pass the call's input so an action tool resolves to the labels and summary of its action. */
export function resolveRosewoodMcpToolDefinition(
  toolName: string | null | undefined,
  input?: unknown,
): RosewoodMcpToolDefinition | null {
  const name = toolName == null ? null : resolveRosewoodMcpToolName(toolName);
  if (name === null || !Object.hasOwn(ROSEWOOD_MCP_TOOLS, name)) return null;
  const action = asSummaryInput(input)?.action;
  const actionTool = typeof action === "string" ? ACTION_TOOLS[name]?.(action) : undefined;
  return actionTool !== undefined && Object.hasOwn(ROSEWOOD_MCP_TOOLS, actionTool)
    ? ROSEWOOD_MCP_TOOLS[actionTool]!
    : ROSEWOOD_MCP_TOOLS[name]!;
}

/** Tools whose summary depends on which fields a call sets. */
const ACTION_SUMMARIES: Readonly<
  Record<string, (input: SummaryInput) => RosewoodMcpToolSummaryAction | undefined>
> = {
  rw_thread_configure: ({ modelSelection }) =>
    modelSelection === undefined ? "thread-configuration" : "thread-configure",
  schedule_task: ({ scheduledTaskId }) =>
    scheduledTaskId === undefined ? "schedule-create" : "schedule-update",
};

export function resolveRosewoodMcpSummaryAction(
  toolName: string | null | undefined,
  input: unknown,
): RosewoodMcpToolSummaryAction | null {
  const definition = resolveRosewoodMcpToolDefinition(toolName, input);
  if (definition === null) return null;
  const summarize = ACTION_SUMMARIES[resolveRosewoodMcpToolName(toolName!) ?? ""];
  const fields = asSummaryInput(input);
  return (fields && summarize?.(fields)) ?? definition.summaryAction;
}

export function resolveRosewoodMcpToolPresentation(
  toolName: string | null | undefined,
  input?: unknown,
): RosewoodMcpToolPresentation | null {
  const definition = resolveRosewoodMcpToolDefinition(toolName, input);
  return definition === null ? null : { displayName: definition.displayName, logo: "rosewood" };
}
