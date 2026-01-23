-- CreateTable
CREATE TABLE IF NOT EXISTS "hidden_documents" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "hidden_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "hidden_documents_patientId_documentId_key" ON "hidden_documents"("patientId", "documentId");

-- AddForeignKey
ALTER TABLE "hidden_documents" ADD CONSTRAINT "hidden_documents_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
