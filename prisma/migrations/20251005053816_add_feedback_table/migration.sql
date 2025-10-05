-- CreateTable
CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "feedbackText" TEXT NOT NULL,
    "urls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);
