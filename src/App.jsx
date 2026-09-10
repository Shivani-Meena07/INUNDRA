import './App.css'
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function App() {
  return (
    <div className="dashboard">

      {/* Header */}
      <header className="header">
        <div>
          <h1>FloodLens</h1>
          <p>Urban Flood Nowcasting System</p>
        </div>

        <div className="status">
          <span className="live-dot"></span>
          LIVE
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="main">

        {/* Risk Card */}
        <section className="risk-card">
          <p className="label">CURRENT FLOOD RISK</p>
          <h2>MEDIUM</h2>
          <p>Predicted water depth</p>
          <strong>15 cm</strong>
          <p className="warning">⚠ Risk increasing</p>
        </section>

        {/* Map */}
        <section className="map-card">
          <div className="card-title">
            <h2>Flood Risk Map</h2>
            <span>GIS • LIVE</span>
          </div>

          <div className="map">
            <MapContainer
  center={[28.6139, 77.2090]}
  zoom={11}
  scrollWheelZoom={true}
  style={{ height: '100%', width: '100%' }}
>
  <TileLayer
    attribution="&copy; OpenStreetMap contributors"
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  <Circle
    center={[28.6139, 77.2090]}
    radius={1200}
    pathOptions={{
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.35,
    }}
  >
    <Circle
  center={[28.6250, 77.2150]}
  radius={900}
  pathOptions={{
    color: '#f97316',
    fillColor: '#f97316',
    fillOpacity: 0.35,
  }}
>
  <Popup>
    <strong>High Flood Risk</strong>
    <br />
    Predicted water depth: 18 cm
  </Popup>
</Circle>

<Circle
  center={[28.6000, 77.1900]}
  radius={1000}
  pathOptions={{
    color: '#facc15',
    fillColor: '#facc15',
    fillOpacity: 0.35,
  }}
>
  <Popup>
    <strong>Moderate Flood Risk</strong>
    <br />
    Predicted water depth: 10 cm
  </Popup>
</Circle>

<Circle
  center={[28.6400, 77.1800]}
  radius={850}
  pathOptions={{
    color: '#22c55e',
    fillColor: '#22c55e',
    fillOpacity: 0.30,
  }}
>
  <Popup>
    <strong>Low Flood Risk</strong>
    <br />
    Predicted water depth: 3 cm
  </Popup>
</Circle>

    <Popup>
      <strong>High Flood Risk</strong>
      <br />
      Predicted water depth: 24 cm
      <br />
      Risk increasing
    </Popup>
  </Circle>
  <Marker position={[28.6200, 77.2100]}>
  <Popup>
    <strong>🚧 Drainage Bottleneck</strong>
    <br />
    Drainage capacity: 82%
    <br />
    Overflow risk: High
  </Popup>
</Marker>
<Marker position={[28.6050, 77.2250]}>
  <Popup>
    <strong>📍 Reported Drainage Blockage</strong>
    <br />
    Report: Garbage accumulation
    <br />
    Status: Under review
  </Popup>
</Marker>
<Circle
  center={[28.6150, 77.2300]}
  radius={700}
  pathOptions={{
    color: '#f97316',
    fillColor: '#f97316',
    fillOpacity: 0.45,
    dashArray: '8 8',
  }}
>
  <Popup>
    <strong>+1 Hour Forecast</strong>
    <br />
    Predicted water depth: 20 cm
    <br />
    Risk: High
  </Popup>
</Circle>
<div className="map-legend">
  <h4>Flood Risk</h4>

  <div className="legend-item">
    <span className="legend-color low-color"></span>
    Low
  </div>

  <div className="legend-item">
    <span className="legend-color moderate-color"></span>
    Moderate
  </div>

  <div className="legend-item">
    <span className="legend-color high-color"></span>
    High
  </div>

  <div className="legend-item">
    <span className="legend-color severe-color"></span>
    Severe
  </div>

  <div className="legend-item">
    🚧 Drainage bottleneck
  </div>

  <div className="legend-item">
    📍 Reported blockage
  </div>
</div>
</MapContainer>
          </div>

          <div className="legend">
            <span>🟢 Low</span>
            <span>🟡 Moderate</span>
            <span>🟠 High</span>
            <span>🔴 Severe</span>
          </div>
        </section>

        {/* Nowcast */}
        <section className="nowcast">
          <div className="card-title">
            <h2>3-Hour Flood Nowcast</h2>
            <span>WATER DEPTH</span>
          </div>

          <div className="forecast">

            <div>
              <p>NOW</p>
              <strong>12 cm</strong>
              <span>🟡 Moderate</span>
            </div>

            <div>
              <p>+1 HR</p>
              <strong>20 cm</strong>
              <span>🟠 High</span>
            </div>

            <div>
              <p>+2 HR</p>
              <strong>31 cm</strong>
              <span>🔴 Severe</span>
            </div>

            <div>
              <p>+3 HR</p>
              <strong>38 cm</strong>
              <span>🔴 Severe</span>
            </div>

          </div>
        </section>

        {/* Information Cards */}
        <div className="info-grid">

          <section className="info-card">
            <p className="label">🌧 RAINFALL</p>
            <h2>32 mm/hr</h2>
            <p>Current rainfall intensity</p>
            <span className="positive">↑ Increasing</span>
          </section>

          <section className="info-card">
            <p className="label">🚧 DRAINAGE</p>
            <h2>82%</h2>
            <p>Network capacity</p>
            <span className="warning">⚠ Bottleneck detected</span>
          </section>

          <section className="info-card">
            <p className="label">🚗 SAFE ROUTE</p>
            <h2>3 roads</h2>
            <p>Currently high-risk</p>
            <button>Find safer route →</button>
          </section>

        </div>

        {/* Bottom Actions */}
        <section className="bottom-bar">
          <div>
            <h3>⚠ Active Alerts</h3>
            <p>3 flood-risk alerts in your area</p>
          </div>

          <button>＋ Report Blockage</button>
        </section>

      </main>

    </div>
  )
}

export default App
