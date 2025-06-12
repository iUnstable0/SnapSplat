/*
  Warnings:

  - You are about to drop the column `profile_picture` on the `User` table. All the data in the column will be lost.
  - Added the required column `emailVerified` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profilePicture` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "profile_picture",
ADD COLUMN     "allowedTokens" TEXT[],
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "profilePicture" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SuspendedToken"
(
    "id"          SERIAL       NOT NULL,
    "tokenId"     TEXT         NOT NULL,
    "expiresAt"   TIMESTAMP(3) NOT NULL,
    "suspendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuspendedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuspendedToken_tokenId_key" ON "SuspendedToken" ("tokenId");
