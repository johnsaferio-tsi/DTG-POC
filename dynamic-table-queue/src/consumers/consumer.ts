import dotenv from "dotenv"
dotenv.config()

import amqp from "amqplib"
import axios from "axios"

const RABBITMQ_URL = process.env.RABBITMQ_URL!
const QUEUE_NAME = process.env.QUEUE_NAME!
const BACKEND_URL =
  process.env.UPLOAD_API_URL || "http://localhost:3002/api/upload-csv"
const NOTIFY_URL = "http://localhost:3002/api/notifications/by-key"

async function consumeMessages() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL)
    const channel = await connection.createChannel()

    await channel.assertQueue(QUEUE_NAME, { durable: true })
    console.log(`✅ Waiting for messages in ${QUEUE_NAME}...`)

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg) {
          const batch = JSON.parse(msg.content.toString())

          const isFirstBatch = batch.batchNumber === 1
          const payload = {
            ...batch,
            isFirstBatch,
          }

          try {
            console.log(
              `⬆️ Uploading batch ${batch.batchNumber} for '${batch.csvName}'...`
            )
            const response = await axios.post(BACKEND_URL, payload)
            console.log(
              `✅ Batch ${batch.batchNumber} uploaded:`,
              response.data
            )

            await axios.patch(NOTIFY_URL, {
              notificationKey: batch.notificationKey,
            })

            console.log(
              `📢 Patched notification as created for key: ${batch.notificationKey}`
            )

            channel.ack(msg)
          } catch (error) {
            console.error(`❌ Failed batch ${batch.batchNumber}:`, error)
            // Do not ack, message stays in queue
          }
        }
      },
      { noAck: false }
    )
  } catch (error) {
    console.error("❌ Consumer failed to start:", error)
  }
}

consumeMessages()
