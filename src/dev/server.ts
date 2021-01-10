import express from "express";
import path from "path";

const PORT = 3000;

const app = express();

// Serve the react app on all routes
app.use(express.static(path.join(__dirname, "..", "..", "public")));
app.get("*", (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, "..", "..", "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
