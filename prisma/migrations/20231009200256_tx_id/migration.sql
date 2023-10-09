/*
  Warnings:

  - A unique constraint covering the columns `[txId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `txId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "txId" STRING NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Message_txId_key" ON "Message"("txId");
