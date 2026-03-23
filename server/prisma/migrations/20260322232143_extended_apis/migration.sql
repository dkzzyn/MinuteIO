-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferences" JSONB;

-- CreateTable
CREATE TABLE "crm_clients" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_billing" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL DEFAULT 'MinuteIO Pro',
    "tokens_total_per_cycle" INTEGER NOT NULL DEFAULT 20000,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "cycle_end" TIMESTAMP(3) NOT NULL,
    "overage_price_per_1000" INTEGER NOT NULL DEFAULT 50,
    "usage_entries" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "user_billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crm_clients_user_id_idx" ON "crm_clients"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "user_billing_user_id_key" ON "user_billing"("user_id");

-- CreateIndex
CREATE INDEX "training_progress_user_id_idx" ON "training_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_progress_user_id_lesson_id_key" ON "training_progress"("user_id", "lesson_id");

-- AddForeignKey
ALTER TABLE "crm_clients" ADD CONSTRAINT "crm_clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_billing" ADD CONSTRAINT "user_billing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_progress" ADD CONSTRAINT "training_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
