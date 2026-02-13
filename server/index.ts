import express from "express";
const app = express();
app.use(express.static("dist/public"));
app.get("*", (req, res) => res.sendFile("index.html", { root: "dist/public" }));
app.listen(5000, "0.0.0.0", () => console.log("Static server running on port 5000"));
