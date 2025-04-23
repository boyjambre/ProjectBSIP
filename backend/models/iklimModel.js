const mongoose = require("mongoose");

const iklimSchema = new mongoose.Schema({
  ID_WMO: { type: String, default: "-" },
  NAMA_STASIUN: { type: String, required: true, index: true }, // Tambah index untuk pencarian yang lebih cepat
  LATITUDE: { type: Number, default: 0 },
  LONGITUDE: { type: Number, default: 0 },
  ELEVATION: { type: Number, default: 0 },
  TANGGAL: { type: Date, required: true },
  TN: { type: Number }, // Temperatur minimum
  TX: { type: Number }, // Temperatur maksimum
  TAVG: { type: Number }, // Temperatur rata-rata
  RH_AVG: { type: Number }, // Kelembaban relatif rata-rata
  RR: { type: Number }, // Curah hujan
  SS: { type: Number }, // Lama penyinaran matahari
  FF_X: { type: Number }, // Kecepatan angin maksimum
  DDD_X: { type: String }, // Arah angin saat kecepatan maksimum
  FF_AVG: { type: Number }, // Kecepatan angin rata-rata
  DDD_CAR: { type: String }, // Arah angin terbanyak
});

// Tambah index compound untuk pencarian berdasarkan tanggal dan nama stasiun
iklimSchema.index({ TANGGAL: 1, NAMA_STASIUN: 1 });

module.exports = mongoose.model("Iklim", iklimSchema, "iklim"); // Parameter ketiga mendefinisikan nama koleksi eksplisit
