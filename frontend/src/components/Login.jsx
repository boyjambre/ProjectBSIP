// frontend/src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token); 
      setIsLoggedIn(true); 
      navigate("/search"); 
    } catch (error) {
      setError("Login gagal! Username atau password salah.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-2xl font-semibold text-center text-blue-600 mb-6">
          Login
        </h2>
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-600">
            Username
          </label>
          <input
            type="text"
            placeholder="Masukkan username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            type="password"
            placeholder="Masukkan password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          Login
        </button>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Belum punya akun?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Daftar
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
