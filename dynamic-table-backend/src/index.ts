import express from "express"
import uploadRoute from "./routes/upload"
import cors from "cors"

const app = express()

app.use(
  cors({
    origin: "http://localhost:3001", // your Next.js frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
)

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Dynamic Table Backend is running 🚀")
})

app.use("/api", uploadRoute)

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
