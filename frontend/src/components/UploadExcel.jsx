import React from 'react';
import axios from 'axios';

const UploadExcel = () => {

  const handleUpload = (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    axios.post('http://localhost:5000/api/iklim/upload', formData, {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    }).then((res) => alert(res.data.msg))
      .catch(() => alert("Upload gagal"));
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3">Upload Excel Data Iklim</h2>
      <input type="file" onChange={handleUpload} className="border p-2 rounded"/>
    </div>
  );
};

export default UploadExcel;
