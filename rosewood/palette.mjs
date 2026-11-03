// The default palette, applied by rebrand.mjs so upstream edits to the same lines never conflict with main.
// Heartwood red is the accent, bark and sapwood are the neutrals, blossom pink is the highlight on dark.

const LIGHT = {
  canvas: "#fef8f7",
  surface: "#fffdfc",
  sidebar: "#fbf3f1",
  control: "#f6ece9",
  bubble: "#f1e3df",
  border: "#eadcd9",
  input: "#decdc8",
  text: "#34211c",
  muted: "#745d57",
  accent: "#872330",
  accentHover: "#98333d",
  updateSurface: "#fce0e0",
  selection: "#eecaca",
  scrollbar: "#d9cecc",
  scrollbarHover: "#beb1ad",
};

const DARK = {
  canvas: "#140a08",
  sidebar: "#0e0605",
  surface: "#1c110e",
  control: "#221613",
  bubble: "#2a1d19",
  rowActive: "#2c1e1a",
  border: "#30231f",
  input: "#3b2c28",
  text: "#f5eae7",
  sidebarText: "#f1e5e2",
  muted: "#af9d98",
  accent: "#b73f4b",
  accentHover: "#c6515b",
  blossom: "#f2a6a8",
  cursor: "#f8b7b8",
  updateSurface: "#39191b",
  selection: "#582f31",
  scrollbar: "#352825",
  scrollbarHover: "#4c3b37",
};

function themeRoles(
  tone,
  {
    updateForeground,
    cursor,
    rowHover,
    rowActive,
    rowSelected,
    sidebarText,
    sidebarControl,
    secondary,
    raised,
    overlay,
    toolbarHover,
    toolbarControl,
    accentSurface,
    messageSurface,
  },
) {
  return {
    canvas: tone.canvas,
    chrome: tone.canvas,
    toolbar: tone.canvas,
    toolbarForeground: tone.text,
    toolbarBorder: tone.border,
    toolbarControl,
    toolbarControlForeground: tone.text,
    toolbarControlHover: toolbarHover,
    surface: tone.surface,
    surfaceRaised: raised,
    surfaceOverlay: overlay,
    text: tone.text,
    textMuted: tone.muted,
    border: tone.border,
    input: tone.input,
    focus: tone.accent,
    accent: tone.accent,
    secondary,
    secondaryForeground: tone.text,
    muted: secondary,
    mutedForeground: tone.muted,
    placeholder: tone.muted,
    secondaryLabel: tone.muted,
    iconMuted: tone.muted,
    update: tone.accent,
    updateForeground,
    updateSurface: tone.updateSurface,
    accentSurface,
    accentSurfaceForeground: tone.text,
    messageSurface,
    messageForeground: tone.text,
    messageAction: tone.accent,
    messageActionHover: tone.accentHover,
    codeBackground: tone.surface,
    codeForeground: tone.text,
    sidebar: tone.sidebar,
    sidebarForeground: sidebarText,
    sidebarMutedForeground: tone.muted,
    sidebarControlSurface: sidebarControl,
    sidebarRowHover: rowHover,
    sidebarRowActive: rowActive,
    sidebarRowSelected: rowSelected,
    sidebarBorder: tone.border,
    terminalBackground: tone.canvas,
    terminalForeground: tone.text,
    terminalCursor: cursor,
    terminalSelection: tone.selection,
    terminalScrollbar: tone.scrollbar,
    terminalScrollbarHover: tone.scrollbarHover,
  };
}

const LIGHT_ROLES = themeRoles(LIGHT, {
  updateForeground: LIGHT.accent,
  cursor: LIGHT.accent,
  rowHover: LIGHT.canvas,
  rowActive: LIGHT.surface,
  rowSelected: LIGHT.surface,
  sidebarText: LIGHT.text,
  sidebarControl: LIGHT.control,
  secondary: LIGHT.sidebar,
  raised: LIGHT.canvas,
  overlay: LIGHT.surface,
  toolbarHover: LIGHT.control,
  toolbarControl: LIGHT.surface,
  accentSurface: LIGHT.control,
  messageSurface: LIGHT.control,
});

const DARK_ROLES = themeRoles(DARK, {
  updateForeground: DARK.blossom,
  cursor: DARK.cursor,
  rowHover: DARK.control,
  rowActive: DARK.rowActive,
  rowSelected: DARK.surface,
  sidebarText: DARK.sidebarText,
  sidebarControl: DARK.canvas,
  secondary: DARK.surface,
  raised: DARK.surface,
  overlay: DARK.surface,
  toolbarHover: DARK.control,
  toolbarControl: DARK.surface,
  accentSurface: DARK.control,
  messageSurface: DARK.control,
});

// One hue across the ramp, on Tailwind's lightness steps so the utilities built on it keep their contrast.
const NEUTRAL_HUE = 35;
const NEUTRAL_RAMP = [
  ["25", 0.984, 0.006],
  ["50", 0.97, 0.009],
  ["100", 0.95, 0.012],
  ["200", 0.905, 0.016],
  ["300", 0.86, 0.02],
  ["400", 0.7, 0.024],
  ["500", 0.55, 0.03],
  ["600", 0.44, 0.03],
  ["700", 0.37, 0.028],
  ["800", 0.27, 0.024],
  ["900", 0.21, 0.022],
  ["950", 0.15, 0.018],
];

const neutralRamp = NEUTRAL_RAMP.flatMap(([step, lightness, chroma]) =>
  ["zinc", "neutral"].map(
    (name) => `  --color-${name}-${step}: oklch(${lightness} ${chroma} ${NEUTRAL_HUE});`,
  ),
).join("\n");

const WEB_CSS = `/* Rosewood's default palette. Scoped to the unthemed root so every picked theme paints as authored. */
html:not([data-theme-id]) {
${neutralRamp}
  --card: oklch(0.995 0.003 35);
  --popover: oklch(0.995 0.003 35);
  --primary: oklch(0.42 0.135 18);
  --message-surface: oklch(0.925 0.016 35);
  --sidebar-row-active: var(--card);
  --sidebar-row-selected: var(--card);
  --terminal-cursor: oklch(0.42 0.135 18);
  --terminal-selection-background: oklch(0.42 0.135 18 / 20%);

  --stage-art-top: oklch(0.55 0.13 15);
  --stage-art-mid: oklch(0.44 0.13 18);
  --stage-art-bottom: oklch(0.32 0.1 20);
  --stage-art-highlight: oklch(0.95 0.03 25);
  --stage-art-secondary: oklch(0.78 0.09 15);
  --stage-art-tertiary: oklch(0.68 0.12 5);
  --stage-art-line: oklch(0.95 0.025 25);
  --stage-night-base-top: oklch(0.25 0.05 20);
  --stage-night-base-mid: oklch(0.2 0.035 28);
  --stage-night-base-bottom: oklch(0.17 0.025 35);
  --stage-night-highlight: oklch(0.72 0.1 15);
  --stage-night-secondary: oklch(0.58 0.11 10);
  --stage-night-tertiary: oklch(0.6 0.13 0);
  --stage-night-line: oklch(0.94 0.025 20);
  --stage-night-glow-highlight: oklch(0.52 0.12 15);
  --stage-night-glow-secondary: oklch(0.33 0.07 20);
  --stage-night-sparkle: oklch(0.88 0.05 15);

  @variant dark {
    --stage-art-top: oklch(0.46 0.12 18);
    --stage-art-mid: oklch(0.36 0.11 18);
    --stage-art-bottom: oklch(0.24 0.07 22);
    --background: oklch(0.16 0.018 35);
    --surface-raised: oklch(0.19 0.02 35);
    --card: oklch(0.19 0.02 35);
    --popover: oklch(0.19 0.02 35);
    --primary: oklch(0.54 0.155 18);
    --message-surface: oklch(0.245 0.022 35);
    --update-foreground: oklch(0.8 0.09 18);
    --sidebar: oklch(0.135 0.016 35);
    --sidebar-stage-fade: var(--sidebar);
    --sidebar-row-active: var(--accent);
    --sidebar-row-selected: var(--muted);
    --terminal-cursor: oklch(0.84 0.075 18);
    --terminal-selection-background: oklch(0.84 0.075 18 / 25%);
  }
}

html:not([data-theme-id]) [data-app-sidebar] {
  --card: oklch(0.995 0.003 35);
  --sidebar-row-active: var(--card);
  --sidebar-row-selected: var(--card);

  @variant dark {
    --background: oklch(0.135 0.016 35);
    --foreground: oklch(0.93 0.014 35);
    --card: oklch(0.135 0.016 35);
    --accent: oklch(0.25 0.024 35);
    --accent-foreground: oklch(0.945 0.012 35);
    --muted: oklch(0.16 0.018 35);
    --muted-foreground: oklch(0.71 0.022 35);
    --secondary-label: oklch(0.66 0.022 35);
  }
}

`;

function overrideRoles(block, roles) {
  return Object.entries(roles).reduce(
    (text, [role, value]) => text.replace(new RegExp(`(\\b${role}: )"[^"]*"`), `$1"${value}"`),
    block,
  );
}

const required = (file, find, replace, expect = 1) => ({ file, find, replace, expect });
const fixture = (file, find, replace) => ({ file, find, replace, optional: true });

const OLD_LIGHT_PRIMARY = /oklch\(0\.488 0\.217 264\)/g;
const NEW_LIGHT_PRIMARY = "oklch(0.42 0.135 18)";

export const PALETTE_PATCHES = [
  required(
    "packages/shared/src/themePalettes.ts",
    /export const ROSEWOOD_LIGHT_THEME_COLORS[^;]*?\n\};/g,
    (block) => overrideRoles(block, LIGHT_ROLES),
  ),
  required(
    "packages/shared/src/themePalettes.ts",
    /export const ROSEWOOD_DARK_THEME_COLORS[^;]*?\n\};/g,
    (block) => overrideRoles(block, DARK_ROLES),
  ),
  required(
    "apps/web/src/themePalette.ts",
    /(\.\.\.ROSEWOOD_DARK_THEME_COLORS,\s*canvas: )"#000000"/g,
    `$1"${DARK.canvas}"`,
  ),
  required(
    "apps/web/src/themePalette.ts",
    /light: \{ messageSurface: "#ebebed" \},\s*dark: \{ canvas: "#000000", messageSurface: "#1e1e1e" \},/g,
    `light: { messageSurface: "${LIGHT.bubble}" },\n  dark: { canvas: "${DARK.canvas}", messageSurface: "${DARK.bubble}" },`,
  ),
  required(
    "apps/web/src/index.css",
    /\/\* Theme files are expressed in app color roles/g,
    (anchor) => `${WEB_CSS}${anchor}`,
  ),
  required(
    "apps/web/index.html",
    /<meta name="theme-color" content="#000000" \/>/g,
    `<meta name="theme-color" content="${DARK.canvas}" />`,
  ),
  required(
    "apps/web/index.html",
    /LIGHT_BACKGROUND = "#ffffff"/g,
    `LIGHT_BACKGROUND = "${LIGHT.canvas}"`,
  ),
  required(
    "apps/web/index.html",
    /DARK_BACKGROUND = "#000000"/g,
    `DARK_BACKGROUND = "${DARK.canvas}"`,
  ),
  required(
    "apps/web/index.html",
    /const SPLASH_COLORS = \{[^;]*?\};/g,
    `const SPLASH_COLORS = {
          light: {
            background: "${LIGHT.canvas}",
            foreground: "${LIGHT.text}",
            accent: "${LIGHT.accent}",
          },
          dark: {
            background: "${DARK.canvas}",
            foreground: "${DARK.text}",
            accent: "${DARK.blossom}",
          },
        };`,
  ),
  required("apps/web/public/manifest.webmanifest", /"#161616"/g, `"${DARK.canvas}"`, 2),
  required(
    "apps/desktop/src/window/DesktopWindow.ts",
    /shouldUseDarkColors \? "#000000" : "#ffffff"/g,
    `shouldUseDarkColors ? "${DARK.canvas}" : "${LIGHT.canvas}"`,
  ),
  required(
    "apps/desktop/src/app/DesktopStartupRecovery.ts",
    /shouldUseDarkColors \? "#000000" : "#ffffff"/g,
    `shouldUseDarkColors ? "${DARK.canvas}" : "${LIGHT.canvas}"`,
  ),
  required(
    "packages/shared/src/themePreview.ts",
    /light: \{\s*canvas: "#fcfcfc",\s*accent: "#f4f4f5",\s*messageAction: "#4f46e5",\s*\},\s*dark: \{\s*canvas: "#0a0a0a",\s*accent: "#1c1c1f",\s*messageAction: "#8b9cff",\s*\},/g,
    `light: {
      canvas: "${LIGHT.canvas}",
      accent: "${LIGHT.control}",
      messageAction: "${LIGHT.accent}",
    },
    dark: {
      canvas: "${DARK.canvas}",
      accent: "${DARK.control}",
      messageAction: "${DARK.blossom}",
    },`,
  ),
  ...[
    "apps/desktop/src/preview/Manager.ts",
    "apps/desktop/src/preview/Annotation.css",
    "apps/desktop/src/preview/AnnotationStyles.generated.ts",
    "apps/web/src/browser/annotationTheme.ts",
  ].map((file) => fixture(file, OLD_LIGHT_PRIMARY, NEW_LIGHT_PRIMARY)),
  required(
    "apps/mobile/app.config.ts",
    /androidAdaptiveBackgroundColor: "#347FF8"/g,
    'androidAdaptiveBackgroundColor: "#A0303F"',
  ),
  required(
    "apps/mobile/app.config.ts",
    /androidAdaptiveBackgroundColor: "#111533"/g,
    'androidAdaptiveBackgroundColor: "#A0303F"',
  ),
  required(
    "apps/mobile/app.config.ts",
    /androidAdaptiveBackgroundColor: "#000000"/g,
    'androidAdaptiveBackgroundColor: "#A0303F"',
  ),
  required(
    "apps/mobile/app.config.ts",
    /androidNotificationColor: "#00639B"/g,
    'androidNotificationColor: "#A0303F"',
  ),
  required(
    "apps/mobile/app.config.ts",
    /androidNotificationColor: "#7565C7"/g,
    'androidNotificationColor: "#A0303F"',
  ),
  required(
    "apps/mobile/app.config.ts",
    /androidNotificationColor: "#FFFFFF"/g,
    'androidNotificationColor: "#A0303F"',
  ),
  required(
    "apps/mobile/app.config.ts",
    /backgroundColor: "#ffffff"/g,
    `backgroundColor: "${LIGHT.canvas}"`,
  ),
  required(
    "apps/mobile/app.config.ts",
    /backgroundColor: "#0a0a0a"/g,
    `backgroundColor: "${DARK.canvas}"`,
  ),
  required(
    "apps/mobile/app.config.ts",
    /androidAdaptiveBackgroundImage: undefined/g,
    'androidAdaptiveBackgroundImage: "./assets/android-icon-background-prod.png"',
  ),
  // Fixtures that pin the old surfaces. A miss only fails that test.
  fixture(
    "apps/web/src/themePalette.test.ts",
    /light: \["#fcfcfc", "#ffffff", "#ebebed"\],\s*dark: \["#000000", "#0a0a0a", "#111111", "#141414", "#1e1e1e"\],/g,
    `light: ["${LIGHT.canvas}", "${LIGHT.surface}", "${LIGHT.bubble}"],\n      dark: ["${DARK.canvas}", "${DARK.sidebar}", "${DARK.surface}", "${DARK.control}", "${DARK.bubble}"],`,
  ),
  ...[
    ['isDark ? "#0a0a0a" : "#fcfcfc"', `isDark ? "${DARK.canvas}" : "${LIGHT.canvas}"`],
    ['isDark ? "#f5f5f5" : "#27272a"', `isDark ? "${DARK.text}" : "${LIGHT.text}"`],
    ['isDark ? "#818181" : "#71717b"', `isDark ? "${DARK.muted}" : "${LIGHT.muted}"`],
    ['isDark ? "#191919" : "#e4e4e7"', `isDark ? "${DARK.border}" : "${LIGHT.border}"`],
  ].map(([find, replace]) =>
    fixture(
      "apps/mobile/scripts/generate-uniwind-themes.test.ts",
      new RegExp(find.replaceAll("?", "\\?"), "g"),
      replace,
    ),
  ),
];
