// エントリーポイント
import express, { Request, Response } from "express";

const app = express();

app.get("/", (req, res) => res.send("Express + TypeScript サーバー起動"));

app.listen(3000, () => console.log("サーバー起動: http://localhost:3000"));
