-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "EventRole" AS ENUM ('HOST', 'COHOST', 'ATTENDEE');

-- CreateTable
CREATE TABLE "Platform" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT NOT NULL DEFAULT '/placeholder.png',
    "passwordSession" TEXT NOT NULL,
    "accountSession" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuspendedToken" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "suspendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuspendedToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '/event-icon-placeholder.png',
    "cover" TEXT NOT NULL DEFAULT '/event-cover-placeholder.png',
    "banner" TEXT NOT NULL DEFAULT '/event-banner-placeholder.png',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hostUserId" TEXT NOT NULL,
    "hostMemberId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMembership" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventRole" "EventRole" NOT NULL DEFAULT 'ATTENDEE',
    "displayNameAlt" TEXT NOT NULL,
    "avatarAlt" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "EventMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventInvite" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "inviteId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "role" "EventRole" NOT NULL DEFAULT 'ATTENDEE',
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER NOT NULL DEFAULT 0,
    "uses" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPhoto" (
    "id" SERIAL NOT NULL,
    "photoId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "memberId" TEXT,

    CONSTRAINT "EventPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Platform_key_idx" ON "Platform"("key");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordSession_key" ON "User"("passwordSession");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountSession_key" ON "User"("accountSession");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionId_key" ON "Session"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_hash_key" ON "Session"("hash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SuspendedToken_tokenId_key" ON "SuspendedToken"("tokenId");

-- CreateIndex
CREATE INDEX "SuspendedToken_tokenId_idx" ON "SuspendedToken"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventId_key" ON "Event"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_hostMemberId_key" ON "Event"("hostMemberId");

-- CreateIndex
CREATE INDEX "Event_eventId_hostUserId_idx" ON "Event"("eventId", "hostUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventId_hostUserId_key" ON "Event"("eventId", "hostUserId");

-- CreateIndex
CREATE UNIQUE INDEX "EventMembership_memberId_key" ON "EventMembership"("memberId");

-- CreateIndex
CREATE INDEX "EventMembership_eventId_userId_memberId_idx" ON "EventMembership"("eventId", "userId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "EventMembership_eventId_userId_key" ON "EventMembership"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventInvite_inviteId_key" ON "EventInvite"("inviteId");

-- CreateIndex
CREATE UNIQUE INDEX "EventInvite_inviteCode_key" ON "EventInvite"("inviteCode");

-- CreateIndex
CREATE INDEX "EventInvite_eventId_inviteId_inviteCode_idx" ON "EventInvite"("eventId", "inviteId", "inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "EventPhoto_photoId_key" ON "EventPhoto"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "EventPhoto_key_key" ON "EventPhoto"("key");

-- CreateIndex
CREATE INDEX "EventPhoto_eventId_idx" ON "EventPhoto"("eventId");

-- CreateIndex
CREATE INDEX "EventPhoto_memberId_idx" ON "EventPhoto"("memberId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuspendedToken" ADD CONSTRAINT "SuspendedToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_hostMemberId_fkey" FOREIGN KEY ("hostMemberId") REFERENCES "EventMembership"("memberId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMembership" ADD CONSTRAINT "EventMembership_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMembership" ADD CONSTRAINT "EventMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvite" ADD CONSTRAINT "EventInvite_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPhoto" ADD CONSTRAINT "EventPhoto_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPhoto" ADD CONSTRAINT "EventPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPhoto" ADD CONSTRAINT "EventPhoto_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "EventMembership"("memberId") ON DELETE SET NULL ON UPDATE CASCADE;
