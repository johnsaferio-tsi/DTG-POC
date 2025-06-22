// src/app.ts
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import queueRouter from "./routes/queue.routes"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "50mb" }))

app.use("/api/queue", queueRouter)

export default app
