import * as React from "react";
import { Router } from "@reach/router";

import { Edit } from "./scenes/Edit";
import { Generate } from "./scenes/Generate";

export function App(): React.ReactElement {
  return (
    <Router>
      <Edit path="/edit" />
      <Generate path="/generate" />
    </Router>
  );
}
