import * as express from "express";
import * as path from "path";

const PORT = 3000;

const app = express();

// Serve the react app on all routes
app.use(express.static(path.join(__dirname, "..", "..", "docs")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "docs", "index.html"));
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
