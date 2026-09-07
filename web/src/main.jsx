
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

const initialServices = [
  {
    name: "Web Application",
    type: "React + Vite",
    icon: "◈",
    status: "Running",
    port: "80",
  },
  {
    name: "API Service",
    type: "Node.js + Express",
    icon: "⌘",
    status: "Running",
    port: "5000",
  },
  {
    name: "MongoDB",
    type: "Database",
    icon: "◆",
    status: "Pending",
    port: "27017",
  },
  {
    name: "Redis",
    type: "Cache",
    icon: "◇",
    status: "Pending",
    port: "6379",
  },
  {
    name: "Nginx",
    type: "Reverse Proxy",
    icon: "▣",
    status: "Running",
    port: "8080",
  },
];

function App() {
  const [services, setServices] = useState(initialServices);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState("Never");

  const checkApi = async () => {
    setLoading(true);

    const start = performance.now();

    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      const latency = Math.round(performance.now() - start);

      if (response.ok) {
        setApiResponse({
          success: true,
          message: data.status,
          service: data.service,
          mongodb: data.mongodb,
          redis: data.redis,
          latency,
        });

        setServices((current) =>
          current.map((service) => {
            if (service.name === "API Service") {
              return {
                ...service,
                status: "Running",
              };
            }

            if (service.name === "MongoDB") {
              return {
                ...service,
                status:
                  data.mongodb === "connected" ? "Running" : "Offline",
              };
            }

            if (service.name === "Redis") {
              return {
                ...service,
                status: data.redis === "connected" ? "Running" : "Offline",
              };
            }

            return service;
          })
        );
      } else {
        throw new Error("API health check failed");
      }
    } catch (error) {
      setApiResponse({
        success: false,
        message: "API unavailable",
        service: "api",
        mongodb: "unavailable",
        redis: "unavailable",
        latency: null,
      });

      setServices((current) =>
        current.map((service) => {
          if (service.name === "API Service") {
            return {
              ...service,
              status: "Offline",
            };
          }

          if (service.name === "MongoDB" || service.name === "Redis") {
            return {
              ...service,
              status: "Offline",
            };
          }

          return service;
        })
      );
    } finally {
      setLastChecked(new Date().toLocaleTimeString());
      setLoading(false);
    }
  };

  useEffect(() => {
    checkApi();
  }, []);

  const runningServices = services.filter(
    (service) => service.status === "Running"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">MS</div>
          <div>
            <strong>MultiService</strong>
            <span>Platform</span>
          </div>
        </div>

        <nav>
          <a className="active">
            <span>⌂</span>
            Overview
          </a>
          <a>
            <span>▣</span>
            Services
          </a>
          <a>
            <span>◉</span>
            API Monitor
          </a>
          <a>
            <span>◌</span>
            Infrastructure
          </a>
          <a>
            <span>≡</span>
            Logs
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="environment">
            <span className="status-dot"></span>
            Development
          </div>
          <div className="version">v1.0.0</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">INFRASTRUCTURE</p>
            <h1>Service Overview</h1>
          </div>

          <div className="header-actions">
            <div className="system-status">
              <span className="status-dot"></span>
              {runningServices}/5 services active
            </div>

            <button onClick={checkApi} disabled={loading}>
              {loading ? "Checking..." : "Refresh"}
            </button>
          </div>
        </header>

        <section className="hero">
          <div>
            <p className="eyebrow">MULTI-SERVICE APPLICATION</p>
            <h2>Application Control Center</h2>
            <p>
              Monitor your frontend, API, database, cache and reverse proxy
              from a single dashboard.
            </p>
          </div>

          <div className="hero-badge">
            <span className="pulse"></span>
            SYSTEM ONLINE
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span>Total Services</span>
            <strong>05</strong>
            <small>Application components</small>
          </div>

          <div className="stat-card">
            <span>Active Services</span>
            <strong>{runningServices}</strong>
            <small>Currently responding</small>
          </div>

          <div className="stat-card">
            <span>API Latency</span>
            <strong>
              {apiResponse?.latency !== null &&
              apiResponse?.latency !== undefined
                ? `${apiResponse.latency}ms`
                : "--"}
            </strong>
            <small>Last health check</small>
          </div>

          <div className="stat-card">
            <span>Environment</span>
            <strong>DEV</strong>
            <small>Local Docker environment</small>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CONTAINERS</p>
              <h3>Service Health</h3>
            </div>

            <span className="updated">
              Last checked: {lastChecked}
            </span>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <div className="service-card" key={service.name}>
                <div className="service-top">
                  <div className="service-icon">{service.icon}</div>

                  <span
                    className={`badge ${
                      service.status === "Running"
                        ? "success"
                        : service.status === "Offline"
                        ? "danger"
                        : "pending"
                    }`}
                  >
                    <span className="mini-dot"></span>
                    {service.status}
                  </span>
                </div>

                <h4>{service.name}</h4>
                <p>{service.type}</p>

                <div className="service-footer">
                  <span>PORT</span>
                  <strong>{service.port}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lower-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">API MONITOR</p>
                <h3>Health Check</h3>
              </div>

              <span className="live-label">
                <span className="status-dot"></span>
                LIVE
              </span>
            </div>

            <div className="endpoint">
              <span className="method">GET</span>
              <code>/api/health</code>
              <span className="endpoint-status">
                {apiResponse?.success ? "200 OK" : "ERROR"}
              </span>
            </div>

            <div className="response">
              <span>Response</span>

              <pre>
{apiResponse
  ? JSON.stringify(
      {
        status: apiResponse.message,
        service: apiResponse.service,
        mongodb: apiResponse.mongodb,
        redis: apiResponse.redis,
      },
      null,
      2
    )
  : "Waiting for response..."}
              </pre>
            </div>

            <button className="check-button" onClick={checkApi}>
              {loading ? "Checking API..." : "Run Health Check"}
            </button>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">ARCHITECTURE</p>
                <h3>Service Flow</h3>
              </div>
            </div>

            <div className="flow">
              <div className="flow-item">
                <span>01</span>
                <div>
                  <strong>React</strong>
                  <small>Frontend</small>
                </div>
              </div>

              <div className="flow-line"></div>

              <div className="flow-item">
                <span>02</span>
                <div>
                  <strong>Nginx</strong>
                  <small>Reverse Proxy</small>
                </div>
              </div>

              <div className="flow-line"></div>

              <div className="flow-item">
                <span>03</span>
                <div>
                  <strong>Express API</strong>
                  <small>Backend</small>
                </div>
              </div>

              <div className="flow-line"></div>

              <div className="flow-item split">
                <div>
                  <strong>MongoDB</strong>
                  <small>Database</small>
                </div>

                <div>
                  <strong>Redis</strong>
                  <small>Cache</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <span>Multi-Service Application</span>
          <span>Dockerized Microservices Project</span>
        </footer>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

