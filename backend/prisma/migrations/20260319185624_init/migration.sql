-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "poster" TEXT,
    "releaseDate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Theater" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Show" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movieId" INTEGER NOT NULL,
    "theaterId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT '2D',
    "price" REAL NOT NULL,
    CONSTRAINT "Show_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Show_theaterId_fkey" FOREIGN KEY ("theaterId") REFERENCES "Theater" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "showId" INTEGER NOT NULL,
    "row" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    CONSTRAINT "Seat_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "showId" INTEGER NOT NULL,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "paymentMethod" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookingSeat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "seatId" INTEGER NOT NULL,
    CONSTRAINT "BookingSeat_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BookingSeat_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
