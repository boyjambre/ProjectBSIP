const Iklim = require("../models/iklimModel");
const multer = require("multer");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const path = require("path");

// Konfigurasi multer untuk upload Excel
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./file"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

//Fungsi upload Excel
exports.uploadExcel = [
  upload.single("file"),
  async (req, res) => {
    try {
      const workbook = require("xlsx").readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = require("xlsx").utils.sheet_to_json(sheet);

      // Ambil informasi stasiun dari baris pertama
      const stationInfo = {
        ID_WMO: data[0]["ID_WMO"] || "",
        NAMA_STASIUN: data[0]["NAMA_STASIUN"] || "",
        LATITUDE: Number(data[0]["LATITUDE"]) || 0,
        LONGITUDE: Number(data[0]["LONGITUDE"]) || 0,
        ELEVATION: Number(data[0]["ELEVATION"]) || 0,
      };

      // Format data iklim
      const formattedData = data.map((row) => ({
        ...stationInfo, // Tambahkan informasi stasiun ke setiap baris
        TANGGAL: new Date(row["TANGGAL"]),
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
      }));

      await Iklim.insertMany(formattedData);
      res.status(200).json({ msg: "Upload berhasil" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
];

//Fungsi search data berdasarkan range tanggal dan nama stasiun
exports.searchData = async (req, res) => {
  try {
    const { startDate, endDate, stasiun } = req.query;
    let query = {};

    console.log("Search Params:", { startDate, endDate, stasiun });

    // Tampilkan beberapa data pertama untuk debug
    console.log("Sample Data in DB:");
    const sampleData = await Iklim.find().limit(1).lean();
    console.log(sampleData);

    // Debug log untuk request
    console.log("\n=== Search Request ===");
    console.log("Search Params:", { startDate, endDate, stasiun });

    // Cek data yang ada di database
    const totalDocs = await Iklim.countDocuments();
    console.log("\n=== Database Stats ===");
    console.log("Total documents:", totalDocs);

    // Cek stasiun yang tersedia
    const availableStations = await Iklim.distinct("NAMA_STASIUN");
    console.log("Available stations:", availableStations);

    // Build query
    if (stasiun) {
      
      const searchPattern = stasiun;
      query.NAMA_STASIUN = {
        $regex: new RegExp(`:.*${searchPattern}`, "i"),
      };
      console.log("\n=== Station Filter ===");
      console.log("Searching for station:", stasiun);
      console.log("Search pattern:", query.NAMA_STASIUN.$regex);

      // Cek berapa dokumen untuk stasiun ini
      const stationCount = await Iklim.countDocuments(query);
      console.log("Documents for this station:", stationCount);
    }

    if (startDate && endDate) {
      const startDateTime = new Date(startDate + "T00:00:00.000Z");
      const endDateTime = new Date(endDate + "T23:59:59.999Z");
      query.TANGGAL = {
        $gte: startDateTime,
        $lte: endDateTime,
      };
      console.log("\n=== Date Filter ===");
      console.log("Date range:", { startDateTime, endDateTime });
    }

    console.log("MongoDB Query:", JSON.stringify(query, null, 2));

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Eksekusi query dengan logging
    const data = await Iklim.find(query).skip(skip).limit(limit).lean();
    console.log(`Found ${data.length} records`);

    // Total untuk pagination
    const total = await Iklim.countDocuments(query);
    console.log(`Total matching records: ${total}`);

    res.json({
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// In your backend route handler
exports.getStationNames = async (req, res) => {
  try {
    // Fetch distinct station names from the database
    const stations = await Iklim.distinct('NAMA_STASIUN');
    
    // Remove the first two characters from each station name
    const modifiedStations = stations.map(station => station.slice(2));

    // Return the modified list of stations
    res.status(200).json({ stations: modifiedStations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Fungsi Export Excel
exports.exportExcel = async (req, res) => {
  try {
    const ExcelJS = require("exceljs");
    const { stasiun, startDate, endDate, page, limit } = req.query;

    // Ensure startDate and endDate are valid Date objects
    const query = {};

    // Add station filter if provided
    if (stasiun) query.NAMA_STASIUN = { $regex: stasiun, $options: 'i' }; // Case-insensitive search

    // Add date range filter if provided
    if (startDate && endDate) {
      // Convert startDate and endDate to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Adjust the end date to 23:59:59 to include the entire end date
      end.setHours(23, 59, 59, 999);

      query.TANGGAL = { $gte: start, $lte: end };
    }

    // Fetch the filtered data based on search parameters
    const data = await Iklim.find(query).skip((page - 1) * limit).limit(Number(limit));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data Iklim");

    worksheet.columns = [
      { header: "ID WMO", key: "id_wmo", width: 12 },
      { header: "Nama Stasiun", key: "nama_stasiun", width: 25 },
      { header: "Tanggal", key: "tanggal", width: 12 },
      { header: "TN", key: "tn", width: 8 },
      { header: "TX", key: "tx", width: 8 },
      { header: "TAVG", key: "tavg", width: 8 },
      { header: "RH", key: "rh", width: 8 },
      { header: "RR", key: "rr", width: 8 },
      { header: "SS", key: "ss", width: 8 },
      { header: "FF_X", key: "ff_x", width: 8 },
      { header: "DDD_X", key: "ddd_x", width: 8 },
      { header: "FF_AVG", key: "ff_avg", width: 8 },
      { header: "DDD_CAR", key: "ddd_car", width: 8 },
    ];

    // Format each column
    worksheet.getColumn("tanggal").numFmt = "dd/mm/yyyy";
    ["tn", "tx", "tavg", "rh", "rr", "ss", "ff_x", "ff_avg"].forEach((col) => {
      worksheet.getColumn(col).numFmt = "0.0";
    });

    // Add data to the worksheet
    data.forEach((item) => {
      worksheet.addRow({
        id_wmo: item.ID_WMO.replace(/^:\s+/, ""),
        nama_stasiun: item.NAMA_STASIUN.replace(/^:\s+/, ""),
        tanggal: new Date(item.TANGGAL),
        tn: item.TN,
        tx: item.TX,
        tavg: item.TAVG,
        rh: item.RH_AVG,
        rr: item.RR === 8888 ? null : item.RR,
        ss: item.SS === 8888 ? null : item.SS,
        ff_x: item.FF_X,
        ddd_x: item.DDD_X,
        ff_avg: item.FF_AVG,
        ddd_car: item.DDD_CAR,
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="data-iklim.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fungsi Export PDF (menggunakan pdfkit tanpa pdfkit-table)
exports.exportPDF = async (req, res) => {
  try {
    console.log("Export PDF called with params:", req.query);

    const { stasiun, startDate, endDate, page = 1, limit = 1000 } = req.query;

    const query = {};
    if (stasiun) {
      query.NAMA_STASIUN = { $regex: new RegExp(`:.*${stasiun}`, "i") };
    }
    if (startDate && endDate) {
      const startDateTime = new Date(startDate + "T00:00:00.000Z");
      const endDateTime = new Date(endDate + "T23:59:59.999Z");
      query.TANGGAL = {
        $gte: startDateTime,
        $lte: endDateTime,
      };
    }

    let data = await Iklim.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log("Data retrieved:", data.length, "records");

    if (data.length === 0) {
      return res.status(404).json({ message: "Tidak ada data yang ditemukan untuk parameter yang diberikan" });
    }

    data = data.map((item) => ({
      ...item.toObject(),
      ID_WMO: item.ID_WMO.replace(/^:\s+/, ""),
      NAMA_STASIUN: item.NAMA_STASIUN.replace(/^:\s+/, ""),
    }));

    const doc = new PDFDocument({ size: 'A4', margin: 20 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="data-iklim.pdf"');
    doc.pipe(res);

    // Judul
    doc.fontSize(18).text("Data Iklim BSIP", { align: "center" });
    doc.moveDown();

    // Header tabel
    const startX = 20;
    const startY = doc.y;
    const rowHeight = 20;
    const colWidths = [50, 100, 60, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40];

    doc.fontSize(8).font("Helvetica-Bold");
    const headers = ["ID WMO", "Nama Stasiun", "Tanggal", "TN", "TX", "TAVG", "RH", "RR", "SS", "FF_X", "DDD_X", "FF_AVG", "DDD_CAR"];
    let xPos = startX;
    headers.forEach((header, i) => {
      doc.text(header, xPos, startY, { width: colWidths[i], align: "center" });
      xPos += colWidths[i];
    });

    // Garis horizontal untuk header
    doc.moveTo(startX, startY + rowHeight - 5).lineTo(xPos, startY + rowHeight - 5).stroke();

    // Baris data
    doc.fontSize(8).font("Helvetica");
    let yPos = startY + rowHeight;
    data.forEach((item) => {
      xPos = startX;
      const row = [
        item.ID_WMO,
        item.NAMA_STASIUN,
        new Date(item.TANGGAL).toLocaleDateString(),
        item.TN || "-",
        item.TX || "-",
        item.TAVG || "-",
        item.RH_AVG || "-",
        item.RR === 8888 ? null : item.RR || "-",
        item.SS === 8888 ? null : item.SS || "-",
        item.FF_X || "-",
        item.DDD_X || "-",
        item.FF_AVG || "-",
        item.DDD_CAR || "-",
      ];

      row.forEach((cell, i) => {
        doc.text(cell.toString(), xPos, yPos, { width: colWidths[i], align: "center" });
        xPos += colWidths[i];
      });

      yPos += rowHeight;

      // Tambahkan garis horizontal untuk setiap baris
      doc.moveTo(startX, yPos - 5).lineTo(xPos, yPos - 5).stroke();

      // Jika halaman penuh, buat halaman baru
      if (yPos > doc.page.height - 50) {
        doc.addPage();
        yPos = 50;
        xPos = startX;
        doc.fontSize(8).font("Helvetica-Bold");
        headers.forEach((header, i) => {
          doc.text(header, xPos, yPos, { width: colWidths[i], align: "center" });
          xPos += colWidths[i];
        });
        doc.moveTo(startX, yPos + rowHeight - 5).lineTo(xPos, yPos + rowHeight - 5).stroke();
        yPos += rowHeight;
      }
    });

    doc.end();
    console.log("PDF generated successfully");
  } catch (error) {
    console.error("Error in exportPDF:", error);
    res.status(500).json({ error: error.message });
  }
};