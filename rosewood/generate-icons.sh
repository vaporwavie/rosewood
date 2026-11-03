#!/usr/bin/env bash
# usage: rosewood/generate-icons.sh
# Writes placeholder desktop and web icons into rosewood/overlay. Change the colors or the mark here, then run rosewood/sync.sh --merge.
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
overlay="$repo_root/rosewood/overlay"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

MARK='M0 0H28C39 0 46 7 46 18C46 26 41.5 32 34.5 34.5L48 56H33L21 36H13V56H0V0ZM13 11V25H27C31 25 33 22 33 18C33 14 31 11 27 11H13Z'

render() {
  local background="$1" foreground="$2" size="$3" target="$4"
  cat > "$work/icon.svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="$size" height="$size" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="$background"/>
  <path transform="translate(38 32) scale(1.1)" d="$MARK" fill="$foreground"/>
</svg>
EOF
  mkdir -p "$(dirname "$target")"
  rsvg-convert "$work/icon.svg" -o "$target"
}

render_ico() {
  local background="$1" foreground="$2" target="$3"
  local sizes=(16 24 32 48 64 128 256)
  local inputs=()
  for size in "${sizes[@]}"; do
    render "$background" "$foreground" "$size" "$work/ico-$size.png"
    inputs+=("$work/ico-$size.png")
  done
  mkdir -p "$(dirname "$target")"
  magick "${inputs[@]}" "$target"
}

render_channel() {
  local directory="$1" app_prefix="$2" web_prefix="$3" background="$4" foreground="$5"
  local base="$overlay/assets/$directory"
  render "$background" "$foreground" 1024 "$base/$app_prefix-ios-1024.png"
  render "$background" "$foreground" 1024 "$base/$app_prefix-macos-1024.png"
  render "$background" "$foreground" 1024 "$base/$app_prefix-universal-1024.png"
  render "$background" "$foreground" 180 "$base/$web_prefix-web-apple-touch-180.png"
  render "$background" "$foreground" 16 "$base/$web_prefix-web-favicon-16x16.png"
  render "$background" "$foreground" 32 "$base/$web_prefix-web-favicon-32x32.png"
  render_ico "$background" "$foreground" "$base/$web_prefix-web-favicon.ico"
  render_ico "$background" "$foreground" "$base/$web_prefix-windows.ico"
}

PROD_BACKGROUND="#65000B"
PROD_FOREGROUND="#F7EDE2"
DEV_BACKGROUND="#1D4ED8"
NIGHTLY_BACKGROUND="#1E1B4B"
LIGHT_FOREGROUND="#FFFFFF"

render_channel prod black rosewood-black "$PROD_BACKGROUND" "$PROD_FOREGROUND"
render_channel dev blueprint blueprint "$DEV_BACKGROUND" "$LIGHT_FOREGROUND"
render_channel nightly nightly nightly "$NIGHTLY_BACKGROUND" "$LIGHT_FOREGROUND"

public="$overlay/apps/web/public"
render "$DEV_BACKGROUND" "$LIGHT_FOREGROUND" 180 "$public/apple-touch-icon.png"
render "$DEV_BACKGROUND" "$LIGHT_FOREGROUND" 16 "$public/favicon-16x16.png"
render "$DEV_BACKGROUND" "$LIGHT_FOREGROUND" 32 "$public/favicon-32x32.png"
render_ico "$DEV_BACKGROUND" "$LIGHT_FOREGROUND" "$public/favicon.ico"
