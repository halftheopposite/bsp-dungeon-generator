import * as express from "express";
import * as path from "path";

const PORT = 3000;

const app = express();

app.use("/edit", express.static(path.join(__dirname, "edit", "public")));
app.use(
  "/generate",
  express.static(path.join(__dirname, "generate", "public"))
);
app.get("/", (req, res) => {
  res.send(
    `
    <h1>Welcome to the dungeon project!</h1>
    <ul>
        <li>
        Edit rooms at <a href="http://localhost:${PORT}/edit/">/edit/</a>
        </li>
        <li>
        Generate dungeons at <a href="http://localhost:${PORT}/generate/">/generate/</a>
        </li>
    </ul>
    `
  );
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
