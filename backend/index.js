import express from "express";
import dotenv from "dotenv";


dotenv.config({quiet: true});

const app = express();
const PORT = 5000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});