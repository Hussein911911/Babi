-- Babylon Motors — initial schema (SQLite)
-- Matches prisma/schema.prisma. Applied by `npm run db:push` (scripts/apply-migrations.ts)
-- or by `prisma db push` in environments with engine downloads available.

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "priceUSD" INTEGER NOT NULL,
    "negotiable" BOOLEAN NOT NULL DEFAULT false,
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "transmission" TEXT NOT NULL DEFAULT 'أوتوماتيك',
    "fuel" TEXT NOT NULL DEFAULT 'بنزين',
    "bodyType" TEXT NOT NULL DEFAULT 'سيدان',
    "condition" TEXT NOT NULL DEFAULT 'جديد',
    "colorName" TEXT NOT NULL DEFAULT 'أبيض لؤلؤي',
    "colorHex" TEXT NOT NULL DEFAULT '#f4f4f4',
    "engine" TEXT NOT NULL DEFAULT '',
    "cylinders" INTEGER NOT NULL DEFAULT 4,
    "horsepower" INTEGER NOT NULL DEFAULT 0,
    "torque" INTEGER NOT NULL DEFAULT 0,
    "acceleration" REAL NOT NULL DEFAULT 0,
    "drivetrain" TEXT NOT NULL DEFAULT 'دفع أمامي',
    "seats" INTEGER NOT NULL DEFAULT 5,
    "doors" INTEGER NOT NULL DEFAULT 4,
    "fuelEconomy" TEXT NOT NULL DEFAULT '',
    "lengthMm" INTEGER NOT NULL DEFAULT 0,
    "widthMm" INTEGER NOT NULL DEFAULT 0,
    "heightMm" INTEGER NOT NULL DEFAULT 0,
    "weightKg" INTEGER NOT NULL DEFAULT 0,
    "safety" TEXT NOT NULL DEFAULT '[]',
    "comfort" TEXT NOT NULL DEFAULT '[]',
    "exterior" TEXT NOT NULL DEFAULT '[]',
    "images" TEXT NOT NULL DEFAULT '[]',
    "description" TEXT NOT NULL DEFAULT '',
    "vin" TEXT,
    "inspection" TEXT NOT NULL DEFAULT '',
    "warranty" TEXT NOT NULL DEFAULT '',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "Car_slug_key" ON "Car"("slug");

CREATE TABLE IF NOT EXISTS "Inquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'عام',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "carId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inquiry_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "carId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug");

CREATE TABLE IF NOT EXISTS "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Subscriber_email_key" ON "Subscriber"("email");

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "detail" TEXT NOT NULL DEFAULT '',
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
