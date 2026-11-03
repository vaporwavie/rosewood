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
      viewBox="34.5 37 56.96 56.96"
    >
      <ThemedPath
        d="M47.0 37.0H78.96A12.5 12.5 0 0 1 91.46 49.5V81.46000000000001A12.5 12.5 0 0 1 78.96 93.96000000000001H47.0A12.5 12.5 0 0 1 34.5 81.46000000000001V49.5A12.5 12.5 0 0 1 47.0 37.0ZM34.5 52.90C48 49.40 66 56.90 91.46 51.40V47.00C66 52.50 48 45.00 34.5 48.50ZM34.5 67.90C48 64.40 66 71.90 91.46 66.40V62.00C66 67.50 48 60.00 34.5 63.50ZM34.5 82.90C48 79.40 66 86.90 91.46 81.40V77.00C66 82.50 48 75.00 34.5 78.50Z"
        color={props.color}
        colorClassName={props.colorClassName}
        fill="currentColor"
      />
    </Svg>
  );
}
