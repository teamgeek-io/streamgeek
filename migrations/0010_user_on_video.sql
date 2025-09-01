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
    "duration" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "userId" TEXT,
    CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Video" ("createdAt", "description", "duration", "height", "id", "playlistUrl", "thumbnailUrl", "title", "updatedAt", "width") SELECT "createdAt", "description", "duration", "height", "id", "playlistUrl", "thumbnailUrl", "title", "updatedAt", "width" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE INDEX "Video_id_idx" ON "Video"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
