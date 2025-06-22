import express from "express"
import uploadRoute from "./routes/upload"
import cors from "cors"
import notificationRoutes from "./routes/notifications"
import tableRouter from "./routes/tables"

const app = express()

const FRONT_END_URL = process.env.FRONT_END_URL || "http://localhost:3000"
const QUEUE_SERVICE_URL =
  process.env.QUEUE_SERVICE_URL || "http://localhost:3003"

app.use(
  cors({
    origin: [FRONT_END_URL, QUEUE_SERVICE_URL], // your Next.js frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
)

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Dynamic Table Backend is running 🚀")
})

app.use("/api", uploadRoute)
app.use("/api/notifications", notificationRoutes)
app.use("/api/tables", tableRouter)

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
