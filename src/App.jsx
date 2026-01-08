import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/admin/AdminDashboard";
import DriverDashboard from "./components/driver/DriverDashboard";
import UserDashboard from "./components/user/UserDashboard";
import Navbar from "./pages/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<><Navbar /><AdminDashboard /></>} />
        <Route path="/driver" element={<><Navbar /><DriverDashboard /></>} />
        <Route path="/user" element={<><Navbar /><UserDashboard /></>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
