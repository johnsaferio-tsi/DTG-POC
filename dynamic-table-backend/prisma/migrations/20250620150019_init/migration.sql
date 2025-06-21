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

-- CreateIndex
CREATE UNIQUE INDEX "DataTableDefinition_tableName_key" ON "DataTableDefinition"("tableName");
