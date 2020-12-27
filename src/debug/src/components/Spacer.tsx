import * as React from "react";

export function Spacer(props: { size?: number }): React.ReactElement {
  const { size = 8 } = props;

  return <div style={{ height: size, minHeight: size }} />;
}
