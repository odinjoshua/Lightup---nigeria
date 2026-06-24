import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { database } from './firebase';
import { ref, push, onValue, set } from 'firebase/database';

// Agbor, Delta State — Streets & Communities
const demoZones = [
  { id: 1, name: "Baleke Street, Boji-Boji Agbor" , lat: 6.2481, lng: 6.1959 },
  { id: 2, name: "Okoh Street, Boji-Boji Agbor", lat: 6.2495, lng: 6.1972 },
  { id: 3, name: "Ogbemudein Street", lat: 6.2470, lng: 6.1945 },
  { id: 4, name: "Queen Street", lat: 6.2505, lng: 6.1980 },
  { id: 5, name: "White Street", lat: 6.2460, lng: 6.1990 },
  { id: 6, name: "Prof. John Ebie Street", lat: 6.2515, lng: 6.1930 },
  { id: 7, name: "Osegi Street", lat: 6.2450, lng: 6.1965 },
  { id: 8, name: "Ojiefo Street", lat: 6.2490, lng: 6.2010 },
  { id: 9, name: "Odozi Street", lat: 6.2530, lng: 6.1955 },
  { id: 10, name: "Isede Street", lat: 6.2440, lng: 6.1920 },
  { id: 11, name: "Egun Street", lat: 6.2520, lng: 6.2000 },
  { id: 12, name: "Charles Street", lat: 6.2465, lng: 6.1900 },
  { id: 13, name: "Edike Street (INEC Ika South LGA)", lat: 6.2500, lng: 6.1900 },
  { id: 14, name: "Old Lagos-Asaba Road", lat: 6.2550, lng: 6.1980 },
  { id: 15, name: "Abraka Road (Towards UNIDEL)", lat: 6.2400, lng: 6.2050 },
  { id: 16, name: "Warri-Uromi Road", lat: 6.2350, lng: 6.1980 },
  { id: 17, name: "Sakpoba Road", lat: 6.2560, lng: 6.1900 },
  { id: 18, name: "Agbor-Obi Road", lat: 6.2300, lng: 6.1950 },
  { id: 19, name: "Owanta Street, Boji-Boji Owa", lat: 6.2420, lng: 6.1870 },
  { id: 20, name: "Abraka Road, Boji-Boji Owa", lat: 6.2380, lng: 6.1900 },
  { id: 21, name: "Alika Street", lat: 6.2540, lng: 6.2030 },
  { id: 22, name: "Morka Street", lat: 6.2460, lng: 6.2040 },
  { id: 23, name: "Buzugbe Street", lat: 6.2410, lng: 6.1940 },
  { id: 24, name: "Melekwe Street", lat: 6.2480, lng: 6.1880 },
  { id: 25, name: "Convent Street", lat: 6.2530, lng: 6.1870 },
  { id: 26, name: "Efezomor Street", lat: 6.2390, lng: 6.2000 },
  { id: 27, name: "Umeri Street", lat: 6.2450, lng: 6.2030 },
  { id: 28, name: "Ugbaja Street", lat: 6.2510, lng: 6.1910 },
  { id: 29, name: "Hausa Street", lat: 6.2370, lng: 6.1930 },
  { id: 30, name: "Obaigbena Street", lat: 6.2430, lng: 6.1890 },
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
  neutral: "#999999",
};

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestZone(userLat, userLng) {
  let nearest = demoZones[0];
  let minDistance = getDistance(userLat, userLng, demoZones[0].lat, demoZones[0].lng);

  demoZones.forEach((zone) => {
    const distance = getDistance(userLat, userLng, zone.lat, zone.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = zone;
    }
  });

  return { zone: nearest, distance: minDistance };
}

function App() {
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState('');
  const [lastReportTime, setLastReportTime] = useState(0);
  const [confirmationCounts, setConfirmationCounts] = useState({});
  const [zoneStatuses, setZoneStatuses] = useState({});
  const [selectedZoneId, setSelectedZoneId] = useState(demoZones[0].id);
  const [locationStatus, setLocationStatus] = useState('');
  const [userCoords, setUserCoords] = useState(null);

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

  useEffect(() => {
    const zoneStatusRef = ref(database, 'zoneStatus');
    onValue(zoneStatusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setZoneStatuses(data);
      } else {
        setZoneStatuses({});
      }
    });
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Location not supported on this device');
      setTimeout(() => setLocationStatus(''), 3000);
      return;
    }

    setLocationStatus('📍 Getting your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });

        const { zone, distance } = findNearestZone(lat, lng);
        setSelectedZoneId(zone.id);

        setLocationStatus(
          '✓ You appear to be near ' + zone.name + ' (' + distance.toFixed(1) + ' km away)'
        );
        setTimeout(() => setLocationStatus(''), 5000);
      },
      (error) => {
        let errorMsg = 'Could not get your location';
        if (error.code === 1) errorMsg = 'Location permission denied. Please allow access.';
        if (error.code === 2) errorMsg = 'Location unavailable. Try again.';
        if (error.code === 3) errorMsg = 'Location request timed out.';
        setLocationStatus(errorMsg);
        setTimeout(() => setLocationStatus(''), 4000);
      }
    );
  };

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

    const selectedZone = demoZones.find((z) => z.id === selectedZoneId);

    const newReport = {
      type: type,
      area: selectedZone.name,
      time: new Date().toLocaleTimeString(),
      timestamp: now,
      reportedViaGPS: userCoords ? true : false,
    };

    push(ref(database, 'reports'), newReport);

    set(ref(database, 'zoneStatus/' + selectedZone.id), {
      status: type,
      lastUpdated: now,
      area: selectedZone.name,
    });

    setLastReportTime(now);
    setMessage(
      type === 'outage'
        ? selectedZone.name + ' reported as outage!'
        : selectedZone.name + ' reported as power restored!'
    );
    setTimeout(() => setMessage(''), 3000);
  };

  const getZoneStatus = (zone) => {
    if (zoneStatuses[zone.id] && zoneStatuses[zone.id].status) {
      return zoneStatuses[zone.id].status;
    }
    return null;
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
          ● AGBOR PILOT — LIVE OUTAGE MAP
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
          onClick={useMyLocation}
          style={{
            background: COLORS.darkGreen,
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          📍 Use My Location
        </button>

        <select
          value={selectedZoneId}
          onChange={(e) => setSelectedZoneId(Number(e.target.value))}
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid " + COLORS.lightGray,
            fontSize: "13px",
            fontWeight: "600",
            color: COLORS.darkGreen,
            background: "white",
            maxWidth: "220px",
          }}
        >
          {demoZones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>

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

        {locationStatus && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: COLORS.darkGreen,
              background: COLORS.lightGray,
              padding: "8px 14px",
              borderRadius: "8px",
              width: "100%",
            }}
          >
            {locationStatus}
          </span>
        )}
      </div>

      {/* MAP — Centered on Agbor */}
      <MapContainer
        center={[6.2481, 6.1959]}
        zoom={13}
        style={{ height: "calc(100vh - 122px)", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="OpenStreetMap contributors"
        />

        {demoZones.map((zone) => {
          const liveStatus = getZoneStatus(zone);
          let circleColor = COLORS.neutral;
          if (liveStatus === "outage") circleColor = COLORS.red;
          if (liveStatus === "power") circleColor = COLORS.lightGreen;

          return (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={400}
              pathOptions={{
                color: circleColor,
                fillColor: circleColor,
                fillOpacity: liveStatus ? 0.5 : 0.25,
                weight: 2,
              }}
            >
              <Popup>
                <strong style={{ color: COLORS.darkGreen }}>{zone.name}</strong>
                <br />
                Status:{" "}
                {liveStatus === "outage" ? (
                  <span style={{ color: COLORS.red, fontWeight: "bold" }}>🔴 Power Out</span>
                ) : liveStatus === "power" ? (
                  <span style={{ color: COLORS.green, fontWeight: "bold" }}>🟢 Power On</span>
                ) : (
                  <span style={{ color: COLORS.neutral, fontWeight: "bold" }}>⚪ No Reports Yet</span>
                )}
              </Popup>
            </Circle>
          );
        })}
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
                  {report.reportedViaGPS ? ' 📍' : ''}
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
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: COLORS.neutral, display: "inline-block" }}></span>
          No Reports
        </span>
      </div>
    </div>
  );
}

export default App;