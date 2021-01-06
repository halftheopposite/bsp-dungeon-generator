import * as React from "react";
import { BORDER_COLOR } from "../constants";

export function Separator(props: { size?: number }): React.ReactElement {
  const { size = 2 } = props;

  return (
    <div
      style={{ height: size, minHeight: size, backgroundColor: BORDER_COLOR }}
    />
  );
}
