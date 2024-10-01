import { generateRadiologyTemplate } from "./templates/radiology-report";

const express = require("express");
const app = express();
const port = 3000;

app.get("/", async (_, res) => {
    console.log("new request")
  const templateFileString = await generateRadiologyTemplate();
  res.send(templateFileString);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
