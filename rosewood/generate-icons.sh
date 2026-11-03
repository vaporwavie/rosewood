#!/usr/bin/env bash
# usage: rosewood/generate-icons.sh
# Writes the grained rose tile, the only icon, into rosewood/overlay for every channel and surface. Change it here, then run rosewood/sync.sh --merge.
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
overlay="$repo_root/rosewood/overlay"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

TOP="#C9525F"
BOTTOM="#A0303F"
# Below this size the grain turns to noise.
GRAIN_MIN_SIZE=64
# NEW_MARK_PATH in rebrand.mjs, for surfaces that only take one color.
GLYPH='M47 37H78.96A12.5 12.5 0 0 1 91.46 49.5V81.46A12.5 12.5 0 0 1 78.96 93.96H47A12.5 12.5 0 0 1 34.5 81.46V49.5A12.5 12.5 0 0 1 47 37ZM34.5 52.9C48 49.4 66 56.9 91.46 51.4V47C66 52.5 48 45 34.5 48.5ZM34.5 67.9C48 64.4 66 71.9 91.46 66.4V62C66 67.5 48 60 34.5 63.5ZM34.5 82.9C48 79.4 66 86.9 91.46 81.4V77C66 82.5 48 75 34.5 78.5Z'
GLYPH_VIEWBOX='34.5 37 56.96 56.96'

GRAIN='<g fill="none" stroke="#000" stroke-opacity=".14" stroke-width="1.6" stroke-linecap="round">
    <path d="M-4 20C30 12 58 30 132 14"/>
    <path d="M-4 44C24 34 46 56 132 40"/>
    <path d="M-4 72C36 62 74 88 132 66"/>
    <path d="M-4 96C28 88 60 110 132 92"/>
    <path d="M-4 118C40 110 84 128 132 112"/>
  </g>'
WOOD_DEFS="<defs><linearGradient id=\"wood\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"$TOP\"/><stop offset=\"1\" stop-color=\"$BOTTOM\"/></linearGradient></defs>"

rasterize() {
  local target="$1"
  mkdir -p "$(dirname "$target")"
  rsvg-convert "$work/icon.svg" -o "$target"
}

grain_for() {
  if (( $1 >= GRAIN_MIN_SIZE )); then echo "$GRAIN"; fi
}

tile_svg() {
  local size="$1"
  cat <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="$size" height="$size" viewBox="0 0 128 128">
  $WOOD_DEFS
  <clipPath id="tile"><rect width="128" height="128" rx="28"/></clipPath>
  <g clip-path="url(#tile)"><rect width="128" height="128" fill="url(#wood)"/>$(grain_for "$size")</g>
</svg>
SVG
}

square_svg() {
  local size="$1"
  cat <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="$size" height="$size" viewBox="0 0 128 128">
  $WOOD_DEFS
  <rect width="128" height="128" fill="url(#wood)"/>$GRAIN
</svg>
SVG
}

render() {
  local size="$1" target="$2"
  tile_svg "$size" > "$work/icon.svg"
  rasterize "$target"
}

render_square() {
  local size="$1" target="$2"
  square_svg "$size" > "$work/icon.svg"
  rasterize "$target"
}

render_ico() {
  local target="$1"
  local sizes=(16 24 32 48 64 128 256)
  local inputs=()
  for size in "${sizes[@]}"; do
    render "$size" "$work/ico-$size.png"
    inputs+=("$work/ico-$size.png")
  done
  mkdir -p "$(dirname "$target")"
  magick "${inputs[@]}" "$target"
}

render_glyph() {
  local size="$1" target="$2"
  cat > "$work/icon.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="$size" height="$size" viewBox="0 0 128 128">
  <svg x="32" y="32" width="64" height="64" viewBox="$GLYPH_VIEWBOX"><path d="$GLYPH" fill="#FFFFFF"/></svg>
</svg>
SVG
  rasterize "$target"
}

render_blank() {
  local size="$1" target="$2"
  echo "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"$size\" height=\"$size\"/>" > "$work/icon.svg"
  rasterize "$target"
}

# Icon Composer takes a single full-bleed layer; the OS applies its own mask.
write_icon_composer() {
  local directory="$1"
  local base="$overlay/assets/$directory/app-icon.icon"
  mkdir -p "$base/Assets"
  square_svg 128 > "$base/Assets/background.svg"
  cat > "$base/icon.json" <<JSON
{
  "fill": {
    "solid": "display-p3:0.63000,0.19000,0.25000,1.00000"
  },
  "groups": [
    {
      "layers": [
        {
          "glass": false,
          "image-name": "background.svg",
          "name": "Background",
          "position": {
            "scale": 8.1,
            "translation-in-points": [0, 0]
          }
        }
      ]
    }
  ],
  "supported-platforms": {
    "circles": ["watchOS"],
    "squares": "shared"
  }
}
JSON
}

render_channel() {
  local directory="$1" app_prefix="$2" web_prefix="$3"
  local base="$overlay/assets/$directory"
  render 1024 "$base/$app_prefix-ios-1024.png"
  render 1024 "$base/$app_prefix-macos-1024.png"
  render 1024 "$base/$app_prefix-universal-1024.png"
  render 180 "$base/$web_prefix-web-apple-touch-180.png"
  render 16 "$base/$web_prefix-web-favicon-16x16.png"
  render 32 "$base/$web_prefix-web-favicon-32x32.png"
  render_ico "$base/$web_prefix-web-favicon.ico"
  render_ico "$base/$web_prefix-windows.ico"
  write_icon_composer "$directory"
}

render_channel prod black rosewood-black
render_channel dev blueprint blueprint
render_channel nightly nightly nightly
tile_svg 128 > "$overlay/assets/prod/logo.svg"

for public in "$overlay/apps/web/public" "$overlay/apps/marketing/public"; do
  render 180 "$public/apple-touch-icon.png"
  render 16 "$public/favicon-16x16.png"
  render 32 "$public/favicon-32x32.png"
  render_ico "$public/favicon.ico"
done

android="$overlay/apps/mobile/assets"
render_blank 432 "$android/android-icon-foreground.png"
render_glyph 432 "$android/android-icon-mark.png"
render_glyph 96 "$android/android-notification-icon.png"
for channel in prod dev nightly; do
  render_square 432 "$android/android-icon-background-$channel.png"
  render_square 1152 "$android/android-splash-icon-$channel.png"
done
