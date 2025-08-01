-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "agentId" TEXT NOT NULL,
    "sourceFileId" TEXT,
    "errorMessage" TEXT,
    CONSTRAINT "Job_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("agentId", "createdAt", "errorMessage", "id", "status", "updatedAt", "videoId") SELECT "agentId", "createdAt", "errorMessage", "id", "status", "updatedAt", "videoId" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE INDEX "Job_id_idx" ON "Job"("id");
CREATE INDEX "Job_videoId_idx" ON "Job"("videoId");
CREATE INDEX "Job_agentId_idx" ON "Job"("agentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
