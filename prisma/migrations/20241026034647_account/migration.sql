-- CreateTable
CREATE TABLE "Accounts" (
    "numero" SERIAL NOT NULL,
    "saldo" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "carimbo" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accounts_pkey" PRIMARY KEY ("numero")
);
