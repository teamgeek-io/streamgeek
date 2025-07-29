-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "thumbnailUrl" TEXT,
    "playlistUrl" TEXT,
    "duration" INTEGER
);
INSERT INTO "new_Video" ("createdAt", "description", "duration", "id", "playlistUrl", "thumbnailUrl", "title", "updatedAt") SELECT "createdAt", "description", "duration", "id", "playlistUrl", "thumbnailUrl", "title", "updatedAt" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE INDEX "Video_id_idx" ON "Video"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
