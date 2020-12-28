import * as React from "react";
import { BACKGROUND_DARK } from "../constants";

export function SectionTitle(props: {
  children?: React.ReactNode;
}): React.ReactElement {
  const { children } = props;

  return (
    <p style={{ fontSize: 16, color: BACKGROUND_DARK, textAlign: "center" }}>
      {children}
    </p>
  );
}
