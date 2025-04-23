const mongoose = require("mongoose");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const Iklim = require("./models/iklimModel");

// Fungsi untuk menghubungkan ke MongoDB
async function connectToMongo() {
  await mongoose.connect(process.env.MONGO_URI);
  return mongoose.connection.collection("iklim");
}

// Fungsi untuk mengambil informasi stasiun dari file Excel
function getStationInfo(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Mengambil nilai dari sel-sel yang sesuai
  // Tukar posisi ID_WMO dan NAMA_STASIUN
  return {
    ID_WMO: rows[0][2] || "-", // ID_WMO sebenarnya ada di B3
    NAMA_STASIUN: rows[1][2] || "-", // NAMA_STASIUN sebenarnya ada di B2
    LATITUDE: Number(rows[1][2]) || 0,
    LONGITUDE: Number(rows[2][2]) || 0,
    ELEVATION: Number(rows[3][2]) || 0,
  };
}

// Fungsi untuk mengimpor data Excel ke MongoDB
async function importExcelToMongo(excelFile, stationInfo) {
  try {
    const workbook = xlsx.readFile(excelFile);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Baca data dengan skip 7 baris
    const rawData = xlsx.utils.sheet_to_json(sheet, {
      range: 7, // Skip 7 baris pertama
    });

    // Format data sesuai dengan struktur yang diinginkan
    const data = rawData
      .filter((row) => !row.TANGGAL?.includes("KETERANGAN")) // Skip baris keterangan
      .map((row) => ({
        ...stationInfo,
        TANGGAL: row.TANGGAL ? new Date(row.TANGGAL) : null,
        TN: row.TN || null,
        TX: row.TX || null,
        TAVG: row.TAVG || null,
        RH_AVG: row.RH_AVG || null,
        RR: row.RR || null,
        SS: row.SS || null,
        FF_X: row.FF_X || null,
        DDD_X: row.DDD_X || null,
        FF_AVG: row.FF_AVG || null,
        DDD_CAR: row.DDD_CAR || null,
      }))
      .filter((item) => item.TANGGAL instanceof Date && !isNaN(item.TANGGAL)); // Filter tanggal invalid

    // Sambungkan ke MongoDB dan simpan data
    const collection = await connectToMongo();
    await collection.insertMany(data);
    console.log(
      `${data.length} data berhasil diimpor dari ${path.basename(excelFile)}!`
    );
  } catch (error) {
    console.error(`Error saat memproses file ${excelFile}:`, error.message);
  }
}

// Fungsi untuk memproses semua file Excel dalam folder
async function processAllExcelFiles() {
  try {
    // Sambungkan ke MongoDB
    const collection = await connectToMongo();
    console.log("Terhubung ke MongoDB");

    // Hapus data lama
    await collection.deleteMany({});
    console.log("Data lama berhasil dihapus");

    // Baca semua file Excel di folder
    const folderPath = path.join(__dirname, "file");
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".xlsx"));

    // Proses setiap file Excel
    for (const file of files) {
      const excelFile = path.join(folderPath, file);
      console.log(`\nMemproses file: ${file}`);

      // Baca workbook untuk informasi stasiun
      const workbook = xlsx.readFile(excelFile);
      const stationInfo = getStationInfo(workbook);

      // Import data ke MongoDB
      await importExcelToMongo(excelFile, stationInfo);
    }

    console.log("\nSelesai mengimpor semua file");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Jalankan proses
processAllExcelFiles();
