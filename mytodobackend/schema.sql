CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "fullName" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "projects" (
  "id" SERIAL PRIMARY KEY,
  "ownerId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "projectName" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "projectMembers" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" VARCHAR(50) DEFAULT 'Member',
  "joinedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("projectId", "userId")
);

CREATE TABLE IF NOT EXISTS "statuses" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL,
  "isDefault" BOOLEAN DEFAULT FALSE,
  UNIQUE("projectId", "name")
);

CREATE TABLE IF NOT EXISTS "priorities" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL,
  "isDefault" BOOLEAN DEFAULT FALSE,
  UNIQUE("projectId", "name")
);

CREATE TABLE IF NOT EXISTS "tasks" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "ownerId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "assignedToId" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "statusId" INTEGER REFERENCES "statuses"("id") ON DELETE SET NULL,
  "priorityId" INTEGER REFERENCES "priorities"("id") ON DELETE SET NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "dueDate" DATE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "invites" (
  "id" SERIAL PRIMARY KEY,
  "projectId" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "inviterId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "inviteeId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "email" VARCHAR(255) NOT NULL,
  "status" VARCHAR(20) DEFAULT 'pending' CHECK ("status" IN ('pending', 'accepted', 'rejected')),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("projectId", "inviteeId", "status")
);
