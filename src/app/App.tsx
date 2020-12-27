import * as React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import { Edit } from "./scenes/Edit";
import { Generate } from "./scenes/Generate";

export function App(): React.ReactElement {
  return (
    <BrowserRouter basename="/">
      <Route exact path="/edit" component={Edit} />
      <Route path="/generate" component={Generate} />
    </BrowserRouter>
  );
}
