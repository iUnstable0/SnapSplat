-- DropIndex
DROP INDEX "EventPhoto_key_key";

-- AlterTable
ALTER TABLE "EventPhoto" ADD COLUMN     "hash" TEXT;
