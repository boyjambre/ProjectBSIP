import React, { useEffect, useState } from "react";

const DataTable = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/iklim/search", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="overflow-auto mt-5">
      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>Tanggal</th>
            <th>Max</th>
            <th>Min</th>
            <th>Avg</th>
            <th>Lama Penyinaran</th>
            <th>Provinsi</th>
            <th>Kota</th>
            <th>Stasiun</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id}>
              <td>{new Date(item.TANGGAL).toLocaleDateString()}</td>
              <td>{item.TX}</td>
              <td>{item.TN}</td>
              <td>{item.TAVG}</td>
              <td>{item.SS}</td>
              <td>{item.LATITUDE}</td>
              <td>{item.LONGITUDE}</td>
              <td>{item.NAMA_STASIUN}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
