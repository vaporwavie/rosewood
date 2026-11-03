import type { ColorValue } from "react-native";
import Svg, { Path } from "react-native-svg";
import { withUniwind } from "uniwind";

const ThemedPath = withUniwind(Path);

export function RosewoodWordmark(props: {
  readonly height: number;
  readonly color?: ColorValue;
  readonly colorClassName?: string;
}) {
  const aspectRatio = 94.3941 / 56.96;
  return (
    <Svg
      accessibilityLabel="Rosewood"
      height={props.height}
      width={props.height * aspectRatio}
      viewBox="38.318 37 48.823 56.96"
    >
      <ThemedPath
        d="M38.318 37H66.798C77.987 37 85.107 44.12 85.107 55.309C85.107 63.446 80.53 69.549 73.41 72.092L87.141 93.96H71.884L59.678 73.617H51.541V93.96H38.318V37ZM51.541 48.189V62.428H65.781C69.849 62.428 71.884 59.377 71.884 55.309C71.884 51.24 69.849 48.189 65.781 48.189H51.541Z"
        color={props.color}
        colorClassName={props.colorClassName}
        fill="currentColor"
      />
    </Svg>
  );
}
