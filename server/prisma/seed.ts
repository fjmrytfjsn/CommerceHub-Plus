import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.productInventory.createMany({
    data: [
      {
        productNo: "P1001",
        productName: "高級ボールペン",
        unitPrice: 1200,
        stockQuantity1: 50,
        stockQuantity2: 50,
        category: "文房具",
        manufacturer: "PEN工業",
      },
      {
        productNo: "P1002",
        productName: "ノートパソコン",
        unitPrice: 98000,
        stockQuantity1: 10,
        stockQuantity2: 10,
        category: "電子機器",
        manufacturer: "TechNote",
      },
      {
        productNo: "P1003",
        productName: "USBメモリ 32GB",
        unitPrice: 1500,
        stockQuantity1: 100,
        stockQuantity2: 100,
        category: "電子機器",
        manufacturer: "USBPro",
      },
    ],
  });
  console.log("サンプル商品データを追加しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
