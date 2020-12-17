import * as express from "express";
import * as path from "path";

const PORT = 3000;

const app = express();

app.use('/edit', express.static(path.join(__dirname, "edit", "public")));
app.use("/generate", express.static(path.join(__dirname, "generate", "public")));

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
});
