const mongoose = require("mongoose");
require("dotenv").config();
const Iklim = require("./models/iklimModel");

async function checkDatabase() {
  try {
    // Koneksi ke MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Terhubung ke MongoDB");

    // Hitung total data
    const total = await Iklim.countDocuments();
    console.log(`\nTotal data dalam database: ${total}`);

    // Tampilkan beberapa data pertama
    console.log("\nContoh data pertama:");
    const sampleData = await Iklim.find().limit(3);
    console.log(JSON.stringify(sampleData, null, 2));

    // Tampilkan nama-nama stasiun unik
    const uniqueStations = await Iklim.distinct("NAMA_STASIUN");
    console.log("\nDaftar nama stasiun:");
    console.log(uniqueStations);

    // Tampilkan range tanggal
    const [earliest] = await Iklim.find().sort({ TANGGAL: 1 }).limit(1);
    const [latest] = await Iklim.find().sort({ TANGGAL: -1 }).limit(1);
    console.log("\nRange tanggal data:");
    console.log(`Dari: ${earliest?.TANGGAL}`);
    console.log(`Sampai: ${latest?.TANGGAL}`);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkDatabase();
