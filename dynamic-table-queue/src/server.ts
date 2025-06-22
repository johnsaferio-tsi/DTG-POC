import app from "./app"
import { initRabbitMQ } from "./services/rabbitmq.service"

const PORT = process.env.PORT || 3003

initRabbitMQ().then(() => {
  app.listen(PORT, () => {
    console.log(`Queue service running on port ${PORT}`)
  })
})
