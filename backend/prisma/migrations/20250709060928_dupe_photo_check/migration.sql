/*
  Warnings:

  - A unique constraint covering the columns `[eventId,hash]` on the table `EventPhoto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `EventPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventPhoto" ADD COLUMN     "hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EventPhoto_eventId_hash_key" ON "EventPhoto"("eventId", "hash");
