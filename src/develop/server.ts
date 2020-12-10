import * as express from "express";
import * as path from "path";

const PORT = 3000;

const app = express();

// Draw
app.use(express.static(path.join(__dirname, "draw", "public")));
app.use("/draw", express.static(path.join(__dirname, "draw", "public")));

// Test
app.get("/test", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
