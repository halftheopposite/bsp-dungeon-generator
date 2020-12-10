import * as express from "express";
import * as path from "path";

const PORT = 3000;

const app = express();

// Design
app.use(express.static(path.join(__dirname, "design", "public")));
app.use("/design", express.static(path.join(__dirname, "design", "public")));

// Draw
app.use(express.static(path.join(__dirname, "draw", "public")));
app.use("/draw", express.static(path.join(__dirname, "draw", "public")));

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
