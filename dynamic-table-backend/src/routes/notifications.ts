// src/routes/notifications.ts

import { Router, Request, Response } from "express"
import {
  createNotification,
  markNotificationAsCreated,
  markNotificationAsCreatedByKey,
  markNotificationAsRead,
  getAllNotifications,
} from "../services/tableService"

const router = Router()

// GET all notifications
router.get("/", async (req: Request, res: Response) => {
  const list = await getAllNotifications()
  res.json(list)
})

// POST a new notification
router.post("/", async (req: Request, res: Response) => {
  const { message, tableName, notificationKey } = req.body
  const note = await createNotification(message, tableName, notificationKey)
  res.json(note)
})

// PATCH notification status to 'CREATED' by ID
router.patch("/:id/created", async (req: Request, res: Response) => {
  const updated = await markNotificationAsCreated(+req.params.id)
  res.json(updated)
})

// PATCH notification as read by ID
router.patch("/:id/read", async (req: Request, res: Response) => {
  const updated = await markNotificationAsRead(+req.params.id)
  res.json(updated)
})

// PATCH notification status to 'CREATED' by notificationKey
router.patch("/by-key", async (req: Request, res: Response) => {
  const { notificationKey } = req.body
  console.log(`notificationKey=====>`, notificationKey)
  await markNotificationAsCreatedByKey(notificationKey)
  return res.json({ success: true })
})

export default router
