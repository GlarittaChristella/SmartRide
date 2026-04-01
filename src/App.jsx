import { useState } from "react";
import "./App.css";
import { supabase } from "./supabase";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix marker icon issue
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function App() {
  const [screen, setScreen] = useState("home");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [currentUser, setCurrentUser] = useState(null);

  const [position, setPosition] = useState([13.0827, 80.2707]);

  const [driver, setDriver] = useState({
    name: "",
    vehicle: "2 Wheeler",
    area: ""
  });

  const [eta, setEta] = useState("");
  const [status, setStatus] = useState("");

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
      (u) => u.email === form.email && u.password === form.password
    );

    if (user) {
      setCurrentUser(user);
      setScreen("dashboard");
    } else {
      alert("Invalid credentials ❌");
    }
  };

  // ---------------- DRIVER ----------------
  const goOnline = async () => {
    alert("You are now visible to passengers 🟢");

    try {
      await supabase.from("drivers").insert([
        {
          name: driver.name,
          vehicle: driver.vehicle,
          area: driver.area,
          lat: position[0],
          lng: position[1]
        }
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- PASSENGER ----------------
  const findNearby = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      setPosition([lat, lon]);

      let time = Math.floor(Math.random() * 8) + 2;
      setEta(time + " mins");

      setStatus("Drivers visible nearby ✅");

      speechSynthesis.speak(
        new SpeechSynthesisUtterance("Drivers nearby are now visible")
      );
    });
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
          <button onClick={() => setScreen("home")}>⬅ Back</button>
        </div>
      )}

      {/* LOGIN */}
      {screen === "login" && (
        <div className="panel">
          <h2>Sign In</h2>
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} />
          <button onClick={handleLogin}>Login</button>
          <button onClick={() => setScreen("home")}>⬅ Back</button>
        </div>
      )}

      {/* DASHBOARD */}
      {screen === "dashboard" && (
        <div className="panel">
          <h2>Welcome {currentUser?.name} 👋</h2>
          <button onClick={() => setScreen("driver")}>🚖 Driver</button>
          <button onClick={() => setScreen("passenger")}>🙋 Passenger</button>
          <button onClick={() => setScreen("home")}>Logout</button>
        </div>
      )}

      {/* DRIVER */}
      {screen === "driver" && (
        <div className="panel">
          <h2>Driver Panel</h2>

          <input placeholder="Driver Name"
            onChange={(e)=>setDriver({...driver, name:e.target.value})} />

          <select
            onChange={(e)=>setDriver({...driver, vehicle:e.target.value})}>
            <option>2 Wheeler</option>
            <option>3 Wheeler</option>
            <option>4 Wheeler</option>
          </select>

          <input placeholder="Area"
            onChange={(e)=>setDriver({...driver, area:e.target.value})} />

          <button className="green" onClick={goOnline}>
            🟢 Go Visible
          </button>

          <p>👤 {driver.name}</p>
          <p>🚗 {driver.vehicle}</p>
          <p>📍 {driver.area}</p>

          <button onClick={() => setScreen("dashboard")}>⬅ Back</button>
        </div>
      )}

      {/* PASSENGER */}
      {screen === "passenger" && (
        <div className="panel">

          {/* MAP */}
          <div style={{ height: "300px" }}>
            <MapContainer center={position} zoom={13} style={{ height: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position}>
                <Popup>You are here 📍</Popup>
              </Marker>
            </MapContainer>
          </div>

          <h2>Nearby Drivers</h2>

          <button onClick={findNearby}>
            🔍 Show Nearby Drivers
          </button>

          <p>{status}</p>
          <p>🚖 Driver: {driver.name || "Searching..."}</p>
          <p>⏱ ETA: {eta}</p>

          <button onClick={() => alert("SOS Sent 🚨")}>
            🛡 SOS
          </button>

          <button onClick={() => setScreen("dashboard")}>
            ⬅ Back
          </button>
        </div>
      )}

    </div>
  );
}
