const mongoose = require("mongoose");
require("dotenv").config();
const Iklim = require("./models/iklimModel");

async function testSearch() {
  try {
    // Koneksi ke MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Terhubung ke MongoDB");

    // Cek total data
    const total = await Iklim.countDocuments();
    console.log("\nTotal data:", total);

    // Cek nama-nama stasiun yang tersedia
    const stations = await Iklim.distinct("NAMA_STASIUN");
    console.log("\nDaftar stasiun tersedia:");
    stations.forEach((station) => console.log(`- ${station}`));

    // Coba pencarian untuk Pos Meteorologi Penggung
    const stationName = "Pos Meteorologi Penggung";
    console.log(`\nMencari data untuk stasiun: ${stationName}`);

    const query = {
      NAMA_STASIUN: { $regex: new RegExp(stationName, "i") },
    };

    const count = await Iklim.countDocuments(query);
    console.log(`Jumlah data ditemukan: ${count}`);

    // Tampilkan beberapa data
    console.log("\nContoh data:");
    const samples = await Iklim.find(query).limit(3);
    samples.forEach((sample) => {
      console.log(
        `Tanggal: ${sample.TANGGAL}, Stasiun: ${sample.NAMA_STASIUN}`
      );
      console.log(`TN: ${sample.TN}, TX: ${sample.TX}, TAVG: ${sample.TAVG}`);
      console.log("---");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testSearch();
