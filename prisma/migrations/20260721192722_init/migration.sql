-- CreateTable
CREATE TABLE "FerrariModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "series" TEXT,
    "yearStart" INTEGER NOT NULL,
    "yearEnd" INTEGER,
    "bodyStyles" TEXT NOT NULL,
    "aliases" TEXT NOT NULL,
    "matchPatterns" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SaleRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "modelId" TEXT,
    "year" INTEGER,
    "vin" TEXT,
    "mileage" INTEGER,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "salePrice" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "saleDate" DATETIME,
    "imageUrl" TEXT,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SaleRecord_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "FerrariModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModelStat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "windowDays" INTEGER NOT NULL,
    "avgPrice" INTEGER NOT NULL,
    "medianPrice" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "pctChange" REAL,
    "computedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ModelStat_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "FerrariModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FerrariModel_slug_key" ON "FerrariModel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SaleRecord_url_key" ON "SaleRecord"("url");

-- CreateIndex
CREATE INDEX "SaleRecord_modelId_saleDate_idx" ON "SaleRecord"("modelId", "saleDate");

-- CreateIndex
CREATE INDEX "SaleRecord_saleDate_idx" ON "SaleRecord"("saleDate");

-- CreateIndex
CREATE UNIQUE INDEX "ModelStat_modelId_windowDays_key" ON "ModelStat"("modelId", "windowDays");
