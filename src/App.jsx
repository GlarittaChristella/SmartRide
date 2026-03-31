import { useState } from "react";
import "./App.css";
import { supabase } from "./supabase";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

L.Marker.prototype.options.icon = DefaultIcon;
export default function App() {
  const [receipt, setReceipt] = useState(null);
  const [screen, setScreen] = useState("home");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [currentUser, setCurrentUser] = useState(null);
const [position, setPosition] = useState([13.0827, 80.2707]);
  const [driver, setDriver] = useState({
    name: "",
    license: "",
    vehicle: "2 Wheeler",
    area: ""
  });

  const [distance, setDistance] = useState("");
  const [demand, setDemand] = useState("");
  const [fare, setFare] = useState(0);

  // ---------------- AUTH ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = () => {
    setUsers([...users, form]);
    alert("Account Created ✅");
    setScreen("login");
  };

  const handleLogin = () => {
    const user = users.find(
      (u) =>
        u.email === form.email && u.password === form.password
    );

    if (user) {
      setCurrentUser(user);
      setScreen("dashboard");
    } else {
      alert("Invalid credentials ❌");
    }
  };

  // ---------------- DRIVER ----------------
  const goOnline = () => {
    alert("Driver Online 🟢");
  };

  const goOffline = () => {
    alert("Driver Offline 🔴");
  };

  // ---------------- PASSENGER ----------------
 const findDriver = () => {
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    setPosition([lat, lon]);

    let dist = Math.floor(Math.random() * 10) + 1;
    setDistance(dist);

    if (dist > 5) setDemand("🔴 High Demand");
    else if (dist > 3) setDemand("🟡 Medium Demand");
    else setDemand("🔵 Low Demand");

    setFare(dist * 10);

    speechSynthesis.speak(
      new SpeechSynthesisUtterance("Driver found nearby")
    );
  });
};

  // ✅ BACKEND CONNECT
  const createRide = async () => {
    try {
      const res = await fetch("http://localhost:5000/ride", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          driver: driver.name,
          passenger: currentUser?.name,
          distance: distance
        })
      });

      const data = await res.json();

      alert("Ride Confirmed 🚖 Fare: ₹" + data.fare);

      setReceipt(data);

    } catch (err) {
      alert("Backend not connected ❌");
    }
  };

  return (
    <div className="app">

      {/* HOME */}
      {screen === "home" && (
        <div className="panel">
          <h1>🚕 SmartRide</h1>
          <button onClick={() => setScreen("signup")}>Create Account</button>
          <button onClick={() => setScreen("login")}>Sign In</button>
        </div>
      )}

      {/* SIGNUP */}
      {screen === "signup" && (
        <div className="panel">
          <h2>Create Account</h2>
          <input name="name" placeholder="Name" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} />
          <button onClick={handleSignup}>Sign Up</button>
          <button className="back" onClick={() => setScreen("home")}>⬅ Back</button>
        </div>
      )}

      {/* LOGIN */}
      {screen === "login" && (
        <div className="panel">
          <h2>Sign In</h2>
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} />
          <button onClick={handleLogin}>Login</button>
          <button className="back" onClick={() => setScreen("home")}>⬅ Back</button>
        </div>
      )}

      {/* DASHBOARD */}
      {screen === "dashboard" && (
        <div className="panel">
          <h2>Welcome {currentUser?.name} 👋</h2>
          <button onClick={() => setScreen("driver")}>🚖 Driver</button>
          <button onClick={() => setScreen("passenger")}>🙋 Passenger</button>
          <button className="back" onClick={() => setScreen("home")}>Logout</button>
        </div>
      )}

      {/* DRIVER */}
      {screen === "driver" && (
        <div className="panel">
          <h2>Driver Panel</h2>

          <input placeholder="Driver Name" onChange={(e)=>setDriver({...driver, name:e.target.value})} />
          <input placeholder="License Number" onChange={(e)=>setDriver({...driver, license:e.target.value})} />

          <select onChange={(e)=>setDriver({...driver, vehicle:e.target.value})}>
            <option>2 Wheeler</option>
            <option>3 Wheeler</option>
            <option>4 Wheeler</option>
          </select>

          <input placeholder="Current Area" onChange={(e)=>setDriver({...driver, area:e.target.value})} />

          <button className="green" onClick={goOnline}>🟢 Go Online</button>
          <button className="red" onClick={goOffline}>🔴 Go Offline</button>

          <p>👤 {driver.name}</p>
          <p>🪪 {driver.license}</p>
          <p>🚗 {driver.vehicle}</p>
          <p>📍 {driver.area}</p>
         
          <button className="back" onClick={() => setScreen("dashboard")}>⬅ Back</button>
        </div>
      )}

      {/* PASSENGER */}
      {screen === "passenger" && (
        <div className="panel">
          {/* MAP UI */}
<div style={{ height: "300px" }}>
  <MapContainer center={[13.0827, 80.2707]} zoom={13} style={{ height: "100%" }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={[13.0827, 80.2707]}>
      <Popup>Map Working ✅</Popup>
    </Marker>
  </MapContainer>
</div>
          <h2>Passenger Panel</h2>

          <button className="green" onClick={findDriver}>🚖 Find Driver</button>

          <p>🚖 Driver: {driver.name || "Not Assigned"}</p>
          <p>📏 Distance: {distance} km</p>
          <p>{demand}</p>
          <p>💰 Fare: ₹{fare}</p>

          <button onClick={createRide}>
            Confirm Ride & Generate Receipt
          </button>

          <button onClick={()=>alert("SOS Alert Sent 🚨")}>
            🛡 SOS
          </button>

          {/* ✅ RECEIPT */}
          {receipt && (
            <div style={{ marginTop: "15px", background: "#eee", padding: "10px", borderRadius:"10px" }}>
              <h3>🧾 Receipt</h3>
              <p>👤 Passenger: {receipt.passenger}</p>
              <p>🚖 Driver: {receipt.driver}</p>
              <p>📏 Distance: {receipt.distance} km</p>
              <p>💰 Fare: ₹{receipt.fare}</p>
              <p>🕒 Time: {receipt.time}</p>
            </div>
          )}

          <button className="back" onClick={() => setScreen("dashboard")}>
            ⬅ Back
          </button>
        </div>
      )}

    </div>
  );
}