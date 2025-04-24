import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import SearchData from "./components/SearchData";
import DataTable from "./components/DataTable";
import PrivateRoute from "./components/PrivateRoute";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white p-6 flex items-center justify-center">
      <img src="/logo-bsip.png" alt="BSIP Logo" className="w-10 h-10 mr-4" />
      <div className="text-3xl font-bold">Database Project BSIP</div>
      {isLoggedIn && (
        <button
          onClick={() => {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            navigate("/login");
          }}
          className="ml-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Logout
        </button>
      )}
    </header>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

        <div className="flex-1 flex flex-col md:flex-row">
          <main className="flex-1 p-4">
            <Routes>
              <Route
                path="/login"
                element={
                  isLoggedIn ? (
                    <Navigate to="/search" />
                  ) : (
                    <Login setIsLoggedIn={setIsLoggedIn} />
                  )
                }
              />
              <Route path="/register" element={<Register />} />

              <Route
                path="/search"
                element={
                  <PrivateRoute>
                    <SearchData />
                  </PrivateRoute>
                }
              />
              <Route
                path="/data"
                element={
                  <PrivateRoute>
                    <DataTable />
                  </PrivateRoute>
                }
              />

              <Route
                path="/"
                element={
                  isLoggedIn ? (
                    <Navigate to="/search" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </main>
        </div>

        <footer className="bg-gray-800 text-white text-center p-4 mt-4">
          <span>
            Balai Pengujian Standar Instrumen Agroklimat dan Hidrologi Pertanian
          </span>
        </footer>
      </div>
    </Router>
  );
}
