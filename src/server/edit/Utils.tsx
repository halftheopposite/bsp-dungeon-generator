import * as React from "react";
import { BORDER_COLOR } from "./constants";

export function Separator(props: { size?: number }): React.ReactElement {
  const { size = 2 } = props;

  return <div style={{ height: size, backgroundColor: BORDER_COLOR }} />;
}

export function Spacer(props: { size?: number }): React.ReactElement {
  const { size = 8 } = props;

  return <div style={{ height: size, minHeight: size }} />;
}
