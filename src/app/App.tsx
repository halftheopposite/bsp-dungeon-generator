import * as React from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import { BACKGROUND_DARK, BORDER_COLOR, PUBLIC_URL } from "./constants";

import { Edit } from "./scenes/Edit";
import { Generate } from "./scenes/Generate";

const HEADER_HEIGHT = 50;

export function App(): React.ReactElement {
  return (
    <BrowserRouter basename={PUBLIC_URL}>
      <Header />
      <Body />
    </BrowserRouter>
  );
}

function Header(): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        height: HEADER_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: `2px solid ${BORDER_COLOR}`,
      }}
    >
      <Link to="/edit">Edit</Link>•<Link to="/generate">Generate</Link>
    </div>
  );
}

function Body(): React.ReactElement {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: HEADER_HEIGHT + 2,
        right: 0,
        bottom: 0,
        backgroundColor: BACKGROUND_DARK,
      }}
    >
      <Switch>
        <Route exact path="/edit" component={Edit} />
        <Route path="/generate" component={Generate} />
      </Switch>
    </div>
  );
}
