const xlsx = require("xlsx");
const path = require("path");

// Baca file Excel pertama
const filePath = path.join(
  __dirname,
  "file",
  "Stasiun Meteorologi Utarom.xlsx"
);
const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Tampilkan range yang digunakan di sheet
console.log("\nRange yang digunakan:", sheet["!ref"]);

// Tampilkan semua sel yang ada
console.log("\nSemua sel:");
Object.keys(sheet).forEach((key) => {
  if (key[0] !== "!") {
    // Skip metadata cells (yang dimulai dengan !)
    console.log(`${key}: ${JSON.stringify(sheet[key])}`);
  }
});

// Baca data dengan berbagai opsi
console.log("\nMencoba membaca dengan opsi berbeda:");
const options = {
  raw: true,
  header: "A",
  defval: null,
};
const data = xlsx.utils.sheet_to_json(sheet, options);
console.log("\nData pertama:", data[0]);
console.log("Data kedua:", data[1]);
