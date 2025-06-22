-- CreateTable
CREATE TABLE "DataTableDefinition" (
    "id" SERIAL NOT NULL,
    "tableName" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataTableDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaLog" (
    "id" SERIAL NOT NULL,
    "tableName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "executedQuery" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchemaLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "notificationKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataTableDefinition_tableName_key" ON "DataTableDefinition"("tableName");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_notificationKey_key" ON "Notification"("notificationKey");
