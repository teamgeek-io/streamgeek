-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "thumbnailUrl" TEXT,
    "playlistUrl" TEXT,
    "duration" INTEGER
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "agentId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "outputUrl" TEXT,
    "errorMessage" TEXT,
    CONSTRAINT "Job_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fqdn" TEXT NOT NULL,
    "lastSeen" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Video_id_idx" ON "Video"("id");

-- CreateIndex
CREATE INDEX "Job_id_idx" ON "Job"("id");

-- CreateIndex
CREATE INDEX "Job_videoId_idx" ON "Job"("videoId");

-- CreateIndex
CREATE INDEX "Job_agentId_idx" ON "Job"("agentId");

-- CreateIndex
CREATE INDEX "Agent_id_idx" ON "Agent"("id");
