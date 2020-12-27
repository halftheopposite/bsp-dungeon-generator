import * as express from "express";
import * as path from "path";

const PORT = 3000;

const app = express();

// Remove the trailing "/"
app.use(function (req, res, next) {
  if (req.path.substr(-1) == "/" && req.path.length > 1) {
    var query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

// Serve the react app on all routes
app.use(express.static(path.join(__dirname, "..", "..", "docs")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "docs", "index.html"));
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
