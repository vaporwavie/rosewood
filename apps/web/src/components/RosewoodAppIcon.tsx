// The production icon, as GitHub shows the Rosewood app, whatever this build's channel.
import appIconUrl from "../../../../assets/prod/rosewood-black-web-apple-touch-180.png";

export function RosewoodAppIcon(props: { readonly className?: string }) {
  return <img src={appIconUrl} alt="" className={props.className} />;
}
