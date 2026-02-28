-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Sem título';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "language" TEXT NOT NULL DEFAULT 'pt-BR',
    "pipelineStage" TEXT NOT NULL DEFAULT 'discovery',
    "result" TEXT NOT NULL DEFAULT 'Em andamento',
    "participants" TEXT[],
    "winProbability" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "objectionTypes" TEXT[],
    "summary" TEXT NOT NULL DEFAULT '',
    "datetimeStart" TIMESTAMP(3) NOT NULL,
    "datetimeEnd" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingClip" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "transcript" TEXT NOT NULL,
    "processedByAi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingClip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingInsight" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "clipId" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meeting_userId_idx" ON "Meeting"("userId");

-- CreateIndex
CREATE INDEX "Meeting_postId_idx" ON "Meeting"("postId");

-- CreateIndex
CREATE INDEX "Meeting_datetimeStart_idx" ON "Meeting"("datetimeStart");

-- CreateIndex
CREATE INDEX "MeetingClip_meetingId_idx" ON "MeetingClip"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingClip_meetingId_index_key" ON "MeetingClip"("meetingId", "index");

-- CreateIndex
CREATE INDEX "MeetingInsight_meetingId_idx" ON "MeetingInsight"("meetingId");

-- CreateIndex
CREATE INDEX "MeetingInsight_clipId_idx" ON "MeetingInsight"("clipId");

-- CreateIndex
CREATE INDEX "MeetingInsight_type_idx" ON "MeetingInsight"("type");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingClip" ADD CONSTRAINT "MeetingClip_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingInsight" ADD CONSTRAINT "MeetingInsight_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingInsight" ADD CONSTRAINT "MeetingInsight_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "MeetingClip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
