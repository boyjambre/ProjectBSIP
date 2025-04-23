const xlsx = require("xlsx");
const path = require("path");

function checkStationInfo() {
  try {
    // Baca file Excel pertama
    const filePath = path.join(
      __dirname,
      "file",
      "Pos Meteorologi Penggung.xlsx"
    );
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Baca semua sel sebagai array
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Tampilkan 7 baris pertama untuk melihat metadata
    console.log("Checking first 7 rows for station info:");
    console.log("\nRaw data:");
    for (let i = 0; i < 7; i++) {
      console.log(`Row ${i + 1}:`, rows[i]);
    }

    // Tampilkan nilai spesifik
    console.log("\nChecking specific cells:");
    console.log("Row 1 Col 3:", rows[0] ? rows[0][2] : undefined);
    console.log("Row 2 Col 3:", rows[1] ? rows[1][2] : undefined);
    console.log("Row 3 Col 3:", rows[2] ? rows[2][2] : undefined);
    console.log("Row 4 Col 3:", rows[3] ? rows[3][2] : undefined);

    // Cek cell references
    console.log("\nChecking cell references:");
    const cellAddresses = ["C1", "C2", "C3", "C4"];
    cellAddresses.forEach((addr) => {
      const cell = sheet[addr];
      console.log(`${addr}:`, cell ? cell.v : undefined);
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkStationInfo();
