-- CreateTable
CREATE TABLE "ProductInventory" (
    "productNo" TEXT NOT NULL PRIMARY KEY,
    "productName" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "stockQuantity1" INTEGER NOT NULL,
    "stockQuantity2" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "OrderData" (
    "orderNo" TEXT NOT NULL PRIMARY KEY,
    "orderDate" DATETIME NOT NULL,
    "productNo" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "purchaserName" TEXT NOT NULL,
    "purchaserAddress" TEXT NOT NULL,
    "purchaserContact" TEXT NOT NULL,
    "purchaseQuantity" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "shippingStatus" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserAuth" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL
);
