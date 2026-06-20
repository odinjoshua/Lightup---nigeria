import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { database } from './firebase';
import { ref, push, onValue } from 'firebase/database';

const demoZones = [
  { id: 1, name: "Ikeja, Lagos", lat: 6.6018, lng: 3.3515, status: "outage" },
  { id: 2, name: "Lekki, Lagos", lat: 6.4698, lng: 3.5852, status: "power" },
  { id: 3, name: "Surulere, Lagos", lat: 6.5059, lng: 3.3590, status: "outage" },
  { id: 4, name: "Garki, Abuja", lat: 9.0333, lng: 7.4833, status: "power" },
  { id: 5, name: "Wuse, Abuja", lat: 9.0765, lng: 7.4862, status: "outage" },
  { id: 6, name: "GRA, Benin City", lat: 6.3176, lng: 5.6037, status: "outage" },
  { id: 7, name: "Agbor, Delta", lat: 6.2500, lng: 6.2000, status: "power" },
  { id: 8, name: "Asaba, Delta", lat: 6.1978, lng: 6.7298, status: "outage" },
  { id: 9, name: "Warri, Delta", lat: 5.5160, lng: 5.7500, status: "power" },
  { id: 10, name: "GRA, Port Harcourt", lat: 4.8242, lng: 7.0336, status: "outage" },
  { id: 11, name: "Sabon Gari, Kano", lat: 12.0022, lng: 8.5920, status: "power" },
  { id: 12, name: "Bodija, Ibadan", lat: 7.4258, lng: 3.9012, status: "outage" },
  { id: 13, name: "Independence Layout, Enugu", lat: 6.4584, lng: 7.5464, status: "power" },
  { id: 14, name: "Barnawa, Kaduna", lat: 10.4763, lng: 7.4234, status: "outage" },
  { id: 15, name: "New Owerri, Imo", lat: 5.4840, lng: 7.0351, status: "power" },
  { id: 16, name: "State Housing, Calabar", lat: 4.9517, lng: 8.3220, status: "outage" },
  { id: 17, name: "Rayfield, Jos", lat: 9.8567, lng: 8.8853, status: "power" },
];

const COLORS = {
  darkGreen: "#0A3D1F",
  green: "#1A7A3C",
  lightGreen: "#2ECC71",
  gold: "#F5A623",
  red: "#E74C3C",
  offWhite: "#F8FAF9",
  lightGray: "#E8F0EB",
  darkGray: "#2D2D2D",
};

function App() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');
  const [lastReportTime, setLastReportTime] = useState(0);
  const [confirmationCounts, setConfirmationCounts] = useState({});

  useEffect(() => {
    const reportsRef = ref(database, 'reports');
    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportList = Object.values(data).reverse();
        setReports(reportList);

        const areaCounts = {};
        reportList.forEach((report) => {
          const key = report.area + '-' + report.type;
          areaCounts[key] = (areaCounts[key] || 0) + 1;
        });
        setConfirmationCounts(areaCounts);
      }
    });
  }, []);

  const submitReport = (type) => {
    const now = Date.now();
    const timeSinceLastReport = now - lastReportTime;
    const cooldownPeriod = 10000;

    if (timeSinceLastReport < cooldownPeriod) {
      const secondsLeft = Math.ceil((cooldownPeriod - timeSinceLastReport) / 1000);
      setMessage('Please wait ' + secondsLeft + 's before reporting again');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    const newReport = {
      type: type,
      area: "My Location",
      time: new Date().toLocaleTimeString(),
      timestamp: now,
    };
    push(ref(database, 'reports'), newReport);
    setLastReportTime(now);
    setMessage(
      type === 'outage'
        ? 'Outage reported successfully!'
        : 'Power restoration reported!'
    );
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div style={{ height: "100vh", width: "100vw", fontFamily: "Arial, sans-serif", overflow: "hidden" }}>

      {/* HEADER */}
      <div
        style={{
          background: COLORS.darkGreen,
          color: "white",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: COLORS.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            ⚡
          </div>
          <span style={{ fontSize: "19px", fontWeight: "bold", letterSpacing: "0.5px" }}>
            LightUp Nigeria
          </span>
        </div>
        <span style={{ fontSize: "12px", color: COLORS.lightGreen, fontWeight: "600" }}>
          ● LIVE OUTAGE MAP
        </span>
      </div>

      {/* CONTROL BAR */}
      <div
        style={{
          background: COLORS.offWhite,
          padding: "14px 20px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          borderBottom: "1px solid " + COLORS.lightGray,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => submitReport('outage')}
          style={{
            background: COLORS.red,
            color: "white",
            border: "none",
            padding: "11px 22px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(231,76,60,0.35)",
            transition: "transform 0.1s",
          }}
        >
          🔴 Light is Out
        </button>

        <button
          onClick={() => submitReport('power')}
          style={{
            background: COLORS.lightGreen,
            color: "white",
            border: "none",
            padding: "11px 22px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(46,204,113,0.35)",
            transition: "transform 0.1s",
          }}
        >
          🟢 Light is Back
        </button>

        {message && (
          <span
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              color: COLORS.green,
              background: "white",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid " + COLORS.lightGray,
            }}
          >
            {message}
          </span>
        )}
      </div>

      {/* MAP */}
      <MapContainer
        center={[9.0820, 8.6753]}
        zoom={6}
        style={{ height: "calc(100vh - 122px)", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="OpenStreetMap contributors"
        />

        {demoZones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={15000}
            pathOptions={{
              color: zone.status === "outage" ? COLORS.red : COLORS.lightGreen,
              fillColor: zone.status === "outage" ? COLORS.red : COLORS.lightGreen,
              fillOpacity: 0.45,
              weight: 2,
            }}
          >
            <Popup>
              <strong style={{ color: COLORS.darkGreen }}>{zone.name}</strong>
              <br />
              Status:{" "}
              {zone.status === "outage" ? (
                <span style={{ color: COLORS.red, fontWeight: "bold" }}>🔴 Power Out</span>
              ) : (
                <span style={{ color: COLORS.green, fontWeight: "bold" }}>🟢 Power On</span>
              )}
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* RECENT REPORTS PANEL */}
      {reports.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            background: "white",
            border: "1px solid " + COLORS.lightGray,
            borderRadius: "14px",
            padding: "14px",
            width: "260px",
            maxHeight: "220px",
            overflowY: "auto",
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              color: COLORS.darkGreen,
              marginBottom: "10px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            📋 Recent Reports
          </div>
          {reports.map((report, index) => {
            const key = report.area + '-' + report.type;
            const count = confirmationCounts[key] || 1;
            const isConfirmed = count >= 3;
            return (
              <div
                key={index}
                style={{
                  fontSize: "12px",
                  padding: "6px 0",
                  borderBottom: "1px solid #f0f0f0",
                  color: COLORS.darkGray,
                }}
              >
                <div>
                  {report.type === 'outage' ? '🔴' : '🟢'} {report.area} — {report.time}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    color: isConfirmed ? COLORS.green : COLORS.gold,
                    fontWeight: "bold",
                  }}
                >
                  {isConfirmed ? '✓ Confirmed (' + count + ')' : '⏳ Unconfirmed (' + count + ')'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* LEGEND */}
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          left: "16px",
          background: "white",
          borderRadius: "10px",
          padding: "10px 14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          fontSize: "11px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: COLORS.red, display: "inline-block" }}></span>
          Outage
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: COLORS.lightGreen, display: "inline-block" }}></span>
          Power On
        </span>
      </div>
    </div>
  );
}

export default App;