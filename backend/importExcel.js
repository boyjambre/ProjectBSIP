const mongoose = require("mongoose");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const Iklim = require("./models/iklimModel");

// Fungsi untuk parse tanggal dari format DD-MM-YYYY
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return null;
  }
};

// Fungsi untuk membaca file Excel
const readExcelFile = async (filePath) => {
  try {
    console.log(`Membaca file: ${filePath}`);
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // Baca data dengan header
    const rawData = xlsx.utils.sheet_to_json(sheet, {
      raw: true,
      dateNF: "DD-MM-YYYY",
    });

    // Ambil informasi stasiun dari nama file
    const stationInfo = {
      ID_WMO: "-", // Default value karena tidak ada di Excel
      NAMA_STASIUN: path.basename(filePath, ".xlsx"),
      LATITUDE: 0, // Default values karena tidak ada di Excel
      LONGITUDE: 0,
      ELEVATION: 0,
    };

    console.log("Info Stasiun:", stationInfo);

    // Format data dengan chunk size 100 untuk menghindari response too long
    const chunkSize = 100;
    const formattedData = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const tanggal = parseDate(row["TANGGAL"]);

      // Skip row jika tanggal tidak valid
      if (!tanggal) {
        console.log(`Skipping row with invalid date: `, row);
        continue;
      }

      const item = {
        ...stationInfo,
        TANGGAL: tanggal,
        TN: Number(row["TN"]) || null,
        TX: Number(row["TX"]) || null,
        TAVG: Number(row["TAVG"]) || null,
        RH_AVG: Number(row["RH_AVG"]) || null,
        RR: Number(row["RR"]) || null,
        SS: Number(row["SS"]) || null,
        FF_X: Number(row["FF_X"]) || null,
        DDD_X: row["DDD_X"] || null,
        FF_AVG: Number(row["FF_AVG"]) || null,
        DDD_CAR: row["DDD_CAR"] || null,
      };

      // Filter out any NaN values
      Object.keys(item).forEach((key) => {
        if (typeof item[key] === "number" && isNaN(item[key])) {
          item[key] = null;
        }
      });

      formattedData.push(item);

      // Jika chunk penuh atau ini adalah data terakhir, simpan ke database
      if (formattedData.length === chunkSize || i === rawData.length - 1) {
        try {
          await Iklim.insertMany(formattedData);
          console.log(
            `Berhasil menyimpan ${formattedData.length} data dari ${stationInfo.NAMA_STASIUN}`
          );
        } catch (error) {
          console.error(`Error menyimpan chunk data:`, error);
        }
        formattedData.length = 0; // Reset array
      }
    }

    console.log(`Selesai memproses file: ${filePath}`);
  } catch (error) {
    console.error(`Error saat memproses file ${filePath}:`, error);
  }
};

// Fungsi utama untuk mengimpor semua file
const importAllFiles = async () => {
  try {
    // Koneksi ke MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Terhubung ke MongoDB");

    // Baca semua file Excel di folder /file
    const fileDir = path.join(__dirname, "file");
    const files = fs
      .readdirSync(fileDir)
      .filter((file) => file.endsWith(".xlsx"));

    // Proses setiap file secara berurutan
    for (const file of files) {
      const filePath = path.join(fileDir, file);
      await readExcelFile(filePath);
    }

    console.log("Selesai mengimpor semua file");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

// Jalankan import
importAllFiles();
