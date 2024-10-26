-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('deposito', 'saque', 'transferencia');

-- CreateTable
CREATE TABLE "Transactions" (
    "id" SERIAL NOT NULL,
    "tipo" "TransactionType" NOT NULL,
    "origem" INTEGER NOT NULL,
    "destino" INTEGER,
    "valor" DECIMAL(65,30) NOT NULL,
    "carimbo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);
