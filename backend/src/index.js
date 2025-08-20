import express from "express";
import { PORT } from "./config/serverConfig.js";

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Slack Clone API",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
