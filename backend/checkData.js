const mongoose = require("mongoose");
require("dotenv").config();
const Iklim = require("./models/iklimModel");

async function checkData() {
  try {
    // Koneksi ke MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Terhubung ke MongoDB");

    // Tampilkan satu dokumen lengkap
    console.log("\nContoh satu dokumen lengkap:");
    const sample = await Iklim.findOne().lean();
    console.log(JSON.stringify(sample, null, 2));

    // Cek nilai unik untuk NAMA_STASIUN
    console.log("\nNilai unik NAMA_STASIUN:");
    const uniqueStations = await Iklim.distinct("NAMA_STASIUN");
    console.log(uniqueStations);

    // Cek total dokumen per stasiun
    console.log("\nJumlah dokumen per stasiun:");
    for (const station of uniqueStations) {
      const count = await Iklim.countDocuments({ NAMA_STASIUN: station });
      console.log(`${station}: ${count} dokumen`);
    }

    // Cek range tanggal
    console.log("\nRange tanggal per stasiun:");
    for (const station of uniqueStations) {
      const earliest = await Iklim.findOne({ NAMA_STASIUN: station })
        .sort({ TANGGAL: 1 })
        .select("TANGGAL")
        .lean();
      const latest = await Iklim.findOne({ NAMA_STASIUN: station })
        .sort({ TANGGAL: -1 })
        .select("TANGGAL")
        .lean();

      console.log(`\n${station}:`);
      console.log(`- Dari: ${earliest?.TANGGAL}`);
      console.log(`- Sampai: ${latest?.TANGGAL}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkData();
