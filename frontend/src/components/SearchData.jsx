import React, { useState, useEffect } from "react";
import axios from "axios";

const SearchData = () => {
  const [station, setStation] = useState("");
  const [parameter, setParameter] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stationName, setStationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [error, setError] = useState("");
  const [stations, setStations] = useState([]);

  useEffect(() => {
    // Fetch station names when the component mounts
    const fetchStations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/iklim/stations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStations(response.data.stations); // Populate the stations array with data
      } catch (err) {
        console.error("Error fetching station names:", err);
      }
    };

    fetchStations();
  }, []);

  const handleSearch = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/iklim/search",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            stasiun: stationName,
            startDate,
            endDate,
            page,
            limit: 10,
          },
        }
      );

      setResults(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError("Terjadi kesalahan saat mengambil data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      handleSearch(newPage);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/iklim/export/excel",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            stasiun: stationName,
            startDate: startDate, // Should be in the format YYYY-MM-DD
            endDate: endDate, // Should be in the format YYYY-MM-DD
            page: 1,
            limit: 1000, // Adjust according to the number of records you want to export
          },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-iklim.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Gagal mengekspor Excel");
      console.error("Error:", err);
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/iklim/export/pdf",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            stasiun: stationName,
            startDate: startDate, // Tambahkan startDate
            endDate: endDate, // Tambahkan endDate
            page: 1,
            limit: 1000, // Sesuaikan limit sesuai kebutuhan
          },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data-iklim.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Gagal mengekspor PDF");
      console.error("Error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="w-full md:w-1/2 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Pencarian Data
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium">Jenis Stasiun</label>
          <select
            className="w-full p-2 border border-gray-300 rounded"
            value={station}
            onChange={(e) => setStation(e.target.value)}
          >
            <option value="UPT">UPT</option>
            <option value="UPT">Pilih</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">No/Nama Stasiun</label>
          <select
            value={stationName}
            onChange={(e) => setStationName(e.target.value)} // Update state when user selects a station
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Pilih Stasiun</option>
            {stations.length > 0 ? (
              stations.map((station, index) => (
                <option key={index} value={station}>
                  {station}
                </option>
              ))
            ) : (
              <option value="">Loading...</option> // In case stations are still being fetched
            )}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Parameter</label>
          <div className="flex flex-wrap">
            <div className="flex items-center w-full sm:w-1/2">
              <input
                type="checkbox"
                value="Arah_angin_kecepatan_maksimum"
                onChange={(e) => setParameter([...parameter, e.target.value])}
                className="mr-2"
              />
              <span>Arah angin saat kecepatan maksimum (ddd_x)</span>
            </div>
            <div className="flex items-center w-full sm:w-1/2">
              <input
                type="checkbox"
                value="Arah_angin_terbanyak"
                onChange={(e) => setParameter([...parameter, e.target.value])}
                className="mr-2"
              />
              <span>Arah angin terbanyak (ddd_car)</span>
            </div>
            <div className="flex items-center w-full sm:w-1/2">
              <input
                type="checkbox"
                value="Curah_hujan"
                onChange={(e) => setParameter([...parameter, e.target.value])}
                className="mr-2"
              />
              <span>Curah hujan (RR)</span>
            </div>
            <div className="flex items-center w-full sm:w-1/2">
              <input
                type="checkbox"
                value="Kecepatan_angin_maksimum"
                onChange={(e) => setParameter([...parameter, e.target.value])}
                className="mr-2"
              />
              <span>Kecepatan angin maksimum (ff_x)</span>
            </div>
            <div className="flex items-center w-full sm:w-1/2">
              <input
                type="checkbox"
                value="Kecepatan_angin_rata_rata"
                onChange={(e) => setParameter([...parameter, e.target.value])}
                className="mr-2"
              />
              <span>Kecepatan angin rata-rata (ff_avg)</span>
            </div>
            <div className="flex items-center w-full sm:w-1/2">
              <input
                type="checkbox"
                value="Kelembapan_rata_rata"
                onChange={(e) => setParameter([...parameter, e.target.value])}
                className="mr-2"
              />
              <span>Kelembapan rata-rata (RH_avg)</span>
            </div>
            <div className="flex items-center w-full sm:w-1/2">
              <input
                type="checkbox"
                value="Lamanya_penyinaran_matahari"
                onChange={(e) => setParameter([...parameter, e.target.value])}
                className="mr-2"
              />
              <span>Lamanya penyinaran matahari (ss)</span>
            </div>
            <div className="flex items-center w-full sm:w-1/2">
              <input
                type="checkbox"
                value="Temperatur_maksimum"
                onChange={(e) => setParameter([...parameter, e.target.value])}
                className="mr-2"
              />
              <span>Temperatur maksimum (Tx)</span>
            </div>
            <div className="flex items-center w-full sm:w-1/2">
              <input
                type="checkbox"
                value="Temperatur_minimum"
                onChange={(e) => setParameter([...parameter, e.target.value])}
                className="mr-2"
              />
              <span>Temperatur minimum (Tn)</span>
            </div>
            <div className="flex items-center w-full sm:w-1/2">
              <input
                type="checkbox"
                value="Temperatur_rata_rata"
                onChange={(e) => setParameter([...parameter, e.target.value])}
                className="mr-2"
              />
              <span>Temperatur rata-rata (Tavg)</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Rentang Waktu</label>
          <div className="flex">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border border-gray-300 rounded mr-2"
            />
            <span className="mx-2">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <button
          onClick={() => handleSearch(1)}
          disabled={loading}
          className={`bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Mencari..." : "Proses"}
        </button>

        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Hasil Pencarian</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Tanggal</th>
                    <th className="p-2 border">Nama Stasiun</th>
                    <th className="p-2 border">Temperatur Min</th>
                    <th className="p-2 border">Temperatur Max</th>
                    <th className="p-2 border">Temperatur Avg</th>
                    <th className="p-2 border">Kelembaban</th>
                    <th className="p-2 border">Curah Hujan</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2 border">
                        {new Date(item.TANGGAL).toLocaleDateString()}
                      </td>
                      <td className="p-2 border">
                        {item.NAMA_STASIUN.replace(/^:\s+/, "")}
                      </td>
                      <td className="p-2 border">{item.TN || "-"}</td>
                      <td className="p-2 border">{item.TX || "-"}</td>
                      <td className="p-2 border">{item.TAVG || "-"}</td>
                      <td className="p-2 border">{item.RH_AVG || "-"}</td>
                      <td className="p-2 border">{item.RR || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Export Buttons */}
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Export to Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Export to PDF
              </button>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`px-3 py-1 rounded ${
                  pagination.hasPrev
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Previous
              </button>
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`px-3 py-1 rounded ${
                  pagination.hasNext
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchData;
