/*
  Warnings:

  - Made the column `openingHours` on table `Business` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "openingHours" SET NOT NULL;
