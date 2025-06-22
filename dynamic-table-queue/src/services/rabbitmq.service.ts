import amqp from "amqplib"
import dotenv from "dotenv"

dotenv.config()

let channel: amqp.Channel

export async function initRabbitMQ() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL!)
  channel = await conn.createChannel()
  await channel.assertQueue(process.env.QUEUE_NAME!)
  console.log("✅ RabbitMQ Connected & Queue Ready")
}

export function publishBatch(data: any) {
  if (!channel) throw new Error("RabbitMQ channel not initialized")
  channel.sendToQueue(
    process.env.QUEUE_NAME!,
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  )
}

export function getChannel(): amqp.Channel {
  if (!channel) throw new Error("RabbitMQ channel not initialized")
  return channel
}
