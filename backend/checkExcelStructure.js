const xlsx = require("xlsx");
const path = require("path");

function checkExcelStructure() {
  try {
    // Baca file Excel pertama
    const filePath = path.join(
      __dirname,
      "file",
      "Pos Meteorologi Penggung.xlsx"
    );
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Konversi ke array untuk melihat struktur
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Tampilkan 10 baris pertama untuk analisis
    console.log("10 baris pertama dari Excel:");
    rows.slice(0, 10).forEach((row, idx) => {
      console.log(`\nBaris ${idx}:`);
      console.log(row);
    });

    // Tampilkan headers setelah baris ke-7
    console.log("\nHeaders setelah baris metadata (baris 8):");
    console.log(rows[7]);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkExcelStructure();
