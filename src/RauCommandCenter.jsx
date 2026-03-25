import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  black: "#000000",
  gunmetal: "#1A1A1A",
  gunmetalLight: "#252525",
  gold: "#C5A059",
  goldDim: "rgba(197,160,89,0.3)",
  goldGlow: "rgba(197,160,89,0.15)",
  white: "#F5F5F0",
  whiteDim: "rgba(245,245,240,0.5)",
  whiteMuted: "rgba(245,245,240,0.25)",
  glass: "rgba(26,26,26,0.45)",
  glassBorder: "rgba(197,160,89,0.12)",
  red: "#E63946",
  green: "#4ADE80",
};

const valueData = [
  { month: "Jan", value: 2850000 }, { month: "Feb", value: 2920000 },
  { month: "Mar", value: 2880000 }, { month: "Apr", value: 3050000 },
  { month: "May", value: 3120000 }, { month: "Jun", value: 3080000 },
  { month: "Jul", value: 3200000 }, { month: "Aug", value: 3350000 },
  { month: "Sep", value: 3410000 }, { month: "Oct", value: 3380000 },
  { month: "Nov", value: 3520000 }, { month: "Dec", value: 3640000 },
];

const serviceHistory = [
  { id: 1, date: "2025-12-15", type: "Full Service", desc: "Annual inspection & oil change", km: "4,820 km", cost: "€2,340" },
  { id: 2, date: "2025-09-03", type: "Tire Change", desc: "Michelin Pilot Sport 5 — Full set", km: "3,610 km", cost: "€3,890" },
  { id: 3, date: "2025-06-22", type: "Ceramic Coating", desc: "Gtechniq Crystal Serum Ultra", km: "2,100 km", cost: "€1,850" },
  { id: 4, date: "2025-03-10", type: "Delivery", desc: "Factory delivery — Nardò, IT", km: "0 km", cost: "—" },
  { id: 5, date: "2024-11-28", type: "Commission", desc: "Bespoke spec finalized", km: "—", cost: "€485,000" },
];

const documents = [
  { name: "Certificate of Authenticity", type: "PDF", size: "2.4 MB", icon: "◈" },
  { name: "Service Record 2025", type: "PDF", size: "1.1 MB", icon: "◈" },
  { name: "Insurance Policy", type: "PDF", size: "890 KB", icon: "◈" },
  { name: "Technical Blueprint", type: "DWG", size: "14.2 MB", icon: "⬡" },
  { name: "Paint Specification", type: "PDF", size: "340 KB", icon: "◈" },
];

const hotspots = [
  { id: "fl", label: "Front Left", psi: "34.2 PSI", temp: "38°C", status: "optimal", x3d: -1.6, y3d: -0.3, z3d: 0.85 },
  { id: "fr", label: "Front Right", psi: "34.0 PSI", temp: "37°C", status: "optimal", x3d: -1.6, y3d: -0.3, z3d: -0.85 },
  { id: "rl", label: "Rear Left", psi: "33.8 PSI", temp: "36°C", status: "optimal", x3d: 1.6, y3d: -0.3, z3d: 0.85 },
  { id: "rr", label: "Rear Right", psi: "33.5 PSI", temp: "39°C", status: "attention", x3d: 1.6, y3d: -0.3, z3d: -0.85 },
  { id: "engine", label: "Engine Bay", data: "V10 · 640 PS", temp: "92°C", status: "optimal", x3d: -1.8, y3d: 0.5, z3d: 0 },
  { id: "fuel", label: "Fuel Level", data: "73%", range: "380 km", status: "optimal", x3d: 1.2, y3d: 0.2, z3d: 0.8 },
];

const navItems = [
  { id: "hangar", icon: "⬡", label: "Hangar" },
  { id: "fleet", icon: "◇", label: "Fleet" },
  { id: "performance", icon: "△", label: "Analytics" },
  { id: "vault", icon: "□", label: "Vault" },
  { id: "service", icon: "○", label: "Service" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

function buildCarScene(canvas, hotspotScreenPositions) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 100);
  camera.position.set(5.5, 2.8, 5.5);
  camera.lookAt(0, 0, 0);

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(30, 30);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.9, roughness: 0.3 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.72;
  scene.add(ground);

  // Car materials
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.95, roughness: 0.15 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, metalness: 0.8, roughness: 0.1, transparent: true, opacity: 0.6 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, metalness: 0.7, roughness: 0.4 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.95, roughness: 0.1 });
  const goldLineMat = new THREE.LineBasicMaterial({ color: 0xC5A059, transparent: true, opacity: 0.35 });

  const carGroup = new THREE.Group();

  // Main body (low slung supercar)
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-2.4, 0);
  bodyShape.lineTo(-2.2, 0.15);
  bodyShape.lineTo(-1.0, 0.45);
  bodyShape.lineTo(-0.5, 0.75);
  bodyShape.lineTo(0.4, 0.85);
  bodyShape.lineTo(1.2, 0.75);
  bodyShape.lineTo(2.0, 0.45);
  bodyShape.lineTo(2.4, 0.25);
  bodyShape.lineTo(2.4, 0);
  bodyShape.lineTo(-2.4, 0);

  const extrudeSettings = { depth: 1.7, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4 };
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  bodyGeo.center();
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.05;
  bodyMesh.scale.set(1, 1, 1);
  carGroup.add(bodyMesh);

  // Wireframe overlay
  const wireGeo = new THREE.EdgesGeometry(bodyGeo, 25);
  const wireMesh = new THREE.LineSegments(wireGeo, goldLineMat);
  wireMesh.position.copy(bodyMesh.position);
  wireMesh.scale.copy(bodyMesh.scale);
  carGroup.add(wireMesh);

  // Cabin / windshield area
  const cabinShape = new THREE.Shape();
  cabinShape.moveTo(-0.6, 0);
  cabinShape.lineTo(-0.4, 0.35);
  cabinShape.lineTo(0.5, 0.35);
  cabinShape.lineTo(0.8, 0);
  cabinShape.lineTo(-0.6, 0);
  const cabinGeo = new THREE.ExtrudeGeometry(cabinShape, { depth: 1.3, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 });
  cabinGeo.center();
  const cabinMesh = new THREE.Mesh(cabinGeo, glassMat);
  cabinMesh.position.set(0.1, 0.7, 0);
  carGroup.add(cabinMesh);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.22, 24);
  const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.24, 8);
  const wheelPositions = [
    [-1.55, -0.38, 0.88], [-1.55, -0.38, -0.88],
    [1.55, -0.38, 0.88], [1.55, -0.38, -0.88],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, y, z);
    carGroup.add(wheel);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, y, z);
    carGroup.add(rim);
  });

  // Detail lines on body
  const accentGeo = new THREE.BoxGeometry(4.6, 0.008, 0.008);
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xC5A059, emissive: 0xC5A059, emissiveIntensity: 0.5 });
  [-0.82, 0.82].forEach(z => {
    const accent = new THREE.Mesh(accentGeo, accentMat);
    accent.position.set(0, 0.22, z);
    carGroup.add(accent);
  });

  // Rear light bar
  const rearLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.06, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xe63946, emissive: 0xe63946, emissiveIntensity: 2 })
  );
  rearLight.position.set(2.35, 0.25, 0);
  carGroup.add(rearLight);

  // Headlights
  [-0.5, 0.5].forEach(z => {
    const headlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 3 })
    );
    headlight.position.set(-2.35, 0.25, z);
    carGroup.add(headlight);
  });

  scene.add(carGroup);

  // Studio Lighting
  const ambient = new THREE.AmbientLight(0x111111, 0.5);
  scene.add(ambient);

  const keyLight = new THREE.SpotLight(0xffeedd, 2.5, 20, Math.PI / 5, 0.5);
  keyLight.position.set(5, 6, 3);
  keyLight.lookAt(0, 0, 0);
  scene.add(keyLight);

  const fillLight = new THREE.SpotLight(0xaabbdd, 1.2, 20, Math.PI / 4, 0.6);
  fillLight.position.set(-4, 4, -2);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xC5A059, 1.5, 15);
  rimLight.position.set(0, 3, -5);
  scene.add(rimLight);

  const underGlow = new THREE.PointLight(0xC5A059, 0.4, 5);
  underGlow.position.set(0, -0.3, 0);
  scene.add(underGlow);

  // Slow auto-rotate + mouse interaction
  let mouseX = 0;
  let targetRotY = 0;
  let currentRotY = 0;
  let animFrame;

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
  };
  canvas.addEventListener("mousemove", onMouseMove);

  const animate = () => {
    animFrame = requestAnimationFrame(animate);
    const time = Date.now() * 0.0003;
    targetRotY = Math.sin(time) * 0.4 + mouseX * 0.6;
    currentRotY += (targetRotY - currentRotY) * 0.02;
    carGroup.rotation.y = currentRotY;

    // Project hotspot 3D positions to 2D
    const positions = {};
    hotspots.forEach(hs => {
      const vec = new THREE.Vector3(hs.x3d, hs.y3d, hs.z3d);
      vec.applyMatrix4(carGroup.matrixWorld);
      vec.project(camera);
      positions[hs.id] = {
        x: (vec.x * 0.5 + 0.5) * w,
        y: (-vec.y * 0.5 + 0.5) * h,
        visible: vec.z < 1,
      };
    });
    hotspotScreenPositions.current = positions;

    renderer.render(scene, camera);
  };
  animate();

  const handleResize = () => {
    const nw = canvas.clientWidth;
    const nh = canvas.clientHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  };
  window.addEventListener("resize", handleResize);

  return () => {
    cancelAnimationFrame(animFrame);
    canvas.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("resize", handleResize);
    renderer.dispose();
  };
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: COLORS.gunmetal, border: `1px solid ${COLORS.goldDim}`,
        padding: "10px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
        color: COLORS.gold,
      }}>
        <div style={{ color: COLORS.whiteDim, fontSize: 10, marginBottom: 4 }}>{payload[0].payload.month} 2025</div>
        <div>€{(payload[0].value / 1000000).toFixed(2)}M</div>
      </div>
    );
  }
  return null;
};

export default function RauCommandCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("hangar");
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [hotspotPositions, setHotspotPositions] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const canvasRef = useRef(null);
  const hotspotScreenPositions = useRef({});
  const positionPollRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 300);
    const t2 = setTimeout(() => setScanComplete(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const cleanup = buildCarScene(canvasRef.current, hotspotScreenPositions);
    positionPollRef.current = setInterval(() => {
      if (hotspotScreenPositions.current) {
        setHotspotPositions({ ...hotspotScreenPositions.current });
      }
    }, 50);
    return () => { cleanup(); clearInterval(positionPollRef.current); };
  }, []);

  const sideW = sidebarOpen ? 200 : 56;

  return (
    <div style={{
      width: "100%", height: "100vh", background: COLORS.black, color: COLORS.white,
      fontFamily: "'Outfit', 'Helvetica Neue', sans-serif", overflow: "hidden", position: "relative",
      letterSpacing: "0.04em",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Outfit:wght@200;300;400;500;600&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes scanLine { 0% { top: 0; opacity: 1; } 80% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGold { 0%, 100% { box-shadow: 0 0 4px ${COLORS.goldDim}; } 50% { box-shadow: 0 0 12px ${COLORS.gold}; } }
        @keyframes hotspotPulse { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.8); opacity: 0; } }
        @keyframes slideReveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -2%); }
          30% { transform: translate(1%, -3%); }
          50% { transform: translate(-1%, 2%); }
          70% { transform: translate(3%, 1%); }
          90% { transform: translate(-2%, 3%); }
        }
        .glass-panel {
          background: ${COLORS.glass};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${COLORS.glassBorder};
          border-radius: 2px;
        }
        .gold-line { height: 1px; background: linear-gradient(90deg, transparent, ${COLORS.gold}, transparent); }
        .nav-item { transition: all 0.3s ease; cursor: pointer; position: relative; }
        .nav-item:hover { background: rgba(197,160,89,0.08); }
        .nav-item.active::before {
          content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          width: 2px; height: 24px; background: ${COLORS.gold};
        }
        .doc-row { transition: all 0.25s ease; cursor: pointer; }
        .doc-row:hover { background: rgba(197,160,89,0.06); }
        .service-node { transition: all 0.3s ease; cursor: pointer; }
        .service-node:hover { border-color: ${COLORS.gold} !important; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.goldDim}; border-radius: 2px; }
        * { scrollbar-width: thin; scrollbar-color: ${COLORS.goldDim} transparent; }
      `}</style>

      {/* Scan line animation on load */}
      {!scanComplete && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2, zIndex: 100,
          background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
          animation: "scanLine 1.8s ease-in-out forwards",
          boxShadow: `0 0 30px 10px ${COLORS.goldDim}`,
        }} />
      )}

      {/* Film grain overlay */}
      <div style={{
        position: "fixed", top: "-50%", left: "-50%", right: "-50%", bottom: "-50%",
        width: "200%", height: "200%", zIndex: 99, pointerEvents: "none",
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        animation: "grain 0.5s steps(1) infinite", opacity: 0.6,
      }} />

      {/* Vignette */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 98, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
      }} />

      {/* SIDEBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, bottom: 0, width: sideW, zIndex: 50,
        background: "rgba(10,10,10,0.95)", borderRight: `1px solid ${COLORS.glassBorder}`,
        transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        backdropFilter: "blur(30px)",
        animation: loaded ? "fadeIn 0.8s ease forwards" : "none",
        opacity: loaded ? 1 : 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarOpen ? "28px 24px" : "28px 12px", borderBottom: `1px solid ${COLORS.glassBorder}`,
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
        }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div style={{
            width: 32, height: 32, border: `1.5px solid ${COLORS.gold}`, display: "flex",
            alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13, color: COLORS.gold, fontWeight: 500, letterSpacing: "0.1em",
          }}>R</div>
          {sidebarOpen && (
            <div style={{ animation: "slideReveal 0.4s ease forwards" }}>
              <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.2em", color: COLORS.white }}>RAÚ</div>
              <div style={{ fontSize: 8, letterSpacing: "0.35em", color: COLORS.whiteMuted, marginTop: 1, fontWeight: 300 }}>COMMAND CENTER</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "16px 0", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => (
            <div key={item.id}
              className={`nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: sidebarOpen ? "12px 24px" : "12px 18px",
                color: activeSection === item.id ? COLORS.gold : COLORS.whiteMuted,
                fontSize: 13, fontWeight: 300,
              }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ animation: "slideReveal 0.3s ease forwards", letterSpacing: "0.15em" }}>{item.label}</span>}
            </div>
          ))}
        </div>

        {/* Bottom status */}
        <div style={{ padding: sidebarOpen ? "16px 24px" : "16px 12px", borderTop: `1px solid ${COLORS.glassBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.green, animation: "pulseGold 3s infinite" }} />
            {sidebarOpen && (
              <span style={{ fontSize: 9, letterSpacing: "0.2em", color: COLORS.whiteMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                ALL SYSTEMS NOMINAL
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={{
        marginLeft: sideW, height: "100vh", transition: "margin-left 0.4s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", position: "relative",
      }}>
        {/* TOP BAR */}
        <header style={{
          height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", borderBottom: `1px solid ${COLORS.glassBorder}`,
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(20px)", zIndex: 30,
          animation: loaded ? "fadeIn 0.8s 0.2s ease both" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.3em", color: COLORS.whiteMuted, fontWeight: 300 }}>COLLECTION</span>
            <span style={{ color: COLORS.goldDim }}>›</span>
            <span style={{ fontSize: 10, letterSpacing: "0.3em", color: COLORS.gold, fontWeight: 400 }}>LAMBORGHINI HURACÁN STO</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COLORS.whiteMuted,
              letterSpacing: "0.15em",
            }}>
              VIN: ZHWUF4ZF6LLA14892
            </span>
            <div style={{
              width: 28, height: 28, border: `1px solid ${COLORS.glassBorder}`, display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: COLORS.whiteMuted,
            }}>⚡</div>
          </div>
        </header>

        {/* HANGAR - 3D Viewport */}
        <div style={{
          flex: "1 1 55%", position: "relative", minHeight: 0,
          animation: loaded ? "fadeIn 1s 0.4s ease both" : "none",
        }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

          {/* Vehicle info overlay - top left */}
          <div style={{
            position: "absolute", top: 24, left: 32, zIndex: 20,
            animation: scanComplete ? "fadeIn 0.6s ease forwards" : "none",
            opacity: scanComplete ? 1 : 0,
          }}>
            <div style={{ fontSize: 9, letterSpacing: "0.4em", color: COLORS.whiteMuted, fontWeight: 300, marginBottom: 6 }}>ACTIVE ASSET</div>
            <div style={{ fontSize: 28, fontWeight: 200, letterSpacing: "0.08em", lineHeight: 1.1 }}>Huracán STO</div>
            <div style={{ fontSize: 11, color: COLORS.gold, letterSpacing: "0.2em", fontWeight: 300, marginTop: 4 }}>2025 · V10 · 640 PS · RWD</div>
            <div className="gold-line" style={{ width: 60, marginTop: 14 }} />
          </div>

          {/* Quick stats overlay - top right */}
          <div style={{
            position: "absolute", top: 24, right: 32, zIndex: 20, textAlign: "right",
            fontFamily: "'JetBrains Mono', monospace",
            animation: scanComplete ? "fadeIn 0.6s 0.3s ease both" : "none",
          }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: COLORS.whiteMuted, marginBottom: 8 }}>CURRENT VALUATION</div>
            <div style={{ fontSize: 32, fontWeight: 300, color: COLORS.gold, letterSpacing: "0.02em" }}>€3.64M</div>
            <div style={{ fontSize: 11, color: COLORS.green, marginTop: 4 }}>+3.5% ▲ <span style={{ color: COLORS.whiteMuted }}>30D</span></div>
          </div>

          {/* Hotspot overlays */}
          {hotspots.map(hs => {
            const pos = hotspotPositions[hs.id];
            if (!pos || !pos.visible) return null;
            const isHovered = hoveredHotspot === hs.id;
            return (
              <div key={hs.id}
                onMouseEnter={() => setHoveredHotspot(hs.id)}
                onMouseLeave={() => setHoveredHotspot(null)}
                style={{
                  position: "absolute", left: pos.x - 8, top: pos.y - 8, zIndex: 25,
                  cursor: "pointer",
                }}>
                {/* Pulse ring */}
                <div style={{
                  position: "absolute", inset: -6, borderRadius: "50%",
                  border: `1px solid ${hs.status === "attention" ? COLORS.red : COLORS.gold}`,
                  animation: "hotspotPulse 2.5s ease infinite",
                }} />
                {/* Center dot */}
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: hs.status === "attention" ? COLORS.red : COLORS.gold,
                  opacity: 0.8, transition: "all 0.3s ease",
                  transform: isHovered ? "scale(1.4)" : "scale(1)",
                  boxShadow: `0 0 10px ${hs.status === "attention" ? COLORS.red : COLORS.gold}`,
                }} />
                {/* Tooltip */}
                {isHovered && (
                  <div className="glass-panel" style={{
                    position: "absolute", top: -10, left: 28, padding: "12px 16px",
                    minWidth: 160, whiteSpace: "nowrap",
                    animation: "fadeIn 0.2s ease forwards",
                  }}>
                    <div style={{ fontSize: 9, letterSpacing: "0.25em", color: COLORS.gold, marginBottom: 6 }}>{hs.label.toUpperCase()}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginBottom: 2, color: COLORS.white }}>
                      {hs.psi || hs.data}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COLORS.whiteMuted }}>
                      {hs.temp} {hs.range ? `· ${hs.range}` : ""}
                    </div>
                    {hs.status === "attention" && (
                      <div style={{ fontSize: 9, color: COLORS.red, marginTop: 6, letterSpacing: "0.15em" }}>⚠ MONITOR</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom gradient fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
            background: `linear-gradient(transparent, ${COLORS.black})`, zIndex: 10, pointerEvents: "none",
          }} />
        </div>

        {/* Divider */}
        <div className="gold-line" style={{ flexShrink: 0, zIndex: 20 }} />

        {/* BOTTOM PANELS */}
        <div style={{
          flex: "0 0 auto", height: "42%", minHeight: 280, display: "flex",
          gap: 1, background: COLORS.black, zIndex: 20, overflow: "hidden",
          animation: loaded ? "fadeIn 1s 0.8s ease both" : "none",
        }}>
          {/* ASSET PERFORMANCE */}
          <div style={{ flex: 1, padding: "20px 24px", borderRight: `1px solid ${COLORS.glassBorder}`, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.35em", color: COLORS.whiteMuted, fontWeight: 300 }}>ASSET PERFORMANCE</div>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: COLORS.goldDim, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>FY 2025</div>
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                padding: "4px 10px", border: `1px solid ${COLORS.glassBorder}`,
                color: COLORS.whiteMuted, cursor: "pointer",
              }}>12M</div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={valueData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={COLORS.gold} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false}
                    tick={{ fontSize: 9, fill: COLORS.whiteMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 9, fill: COLORS.whiteMuted, fontFamily: "'JetBrains Mono', monospace" }}
                    tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} domain={["dataMin - 100000", "dataMax + 100000"]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke={COLORS.gold} strokeWidth={1.5}
                    fill="url(#goldGrad)" dot={false} activeDot={{ r: 3, fill: COLORS.gold, stroke: COLORS.black, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DIGITAL VAULT */}
          <div style={{ flex: 0.85, padding: "20px 24px", borderRight: `1px solid ${COLORS.glassBorder}`, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: COLORS.whiteMuted, fontWeight: 300, marginBottom: 4 }}>DIGITAL VAULT</div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: COLORS.goldDim, marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>
              {documents.length} DOCUMENTS
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {documents.map((doc, i) => (
                <div key={i} className="doc-row" style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 8px",
                  borderBottom: `1px solid rgba(197,160,89,0.06)`,
                }}>
                  <span style={{
                    fontSize: 16, color: COLORS.goldDim, width: 24, textAlign: "center",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{doc.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 300, letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: 9, color: COLORS.whiteMuted, fontFamily: "'JetBrains Mono', monospace", marginTop: 2, letterSpacing: "0.1em" }}>
                      {doc.type} · {doc.size}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: COLORS.whiteMuted, cursor: "pointer", padding: "4px 8px" }}>↗</span>
                </div>
              ))}
            </div>
          </div>

          {/* SERVICE TIMELINE */}
          <div style={{ flex: 1.15, padding: "20px 24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: "0.35em", color: COLORS.whiteMuted, fontWeight: 300 }}>SERVICE TIMELINE</div>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: COLORS.goldDim, marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>COMPLETE HISTORY</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {serviceHistory.map((entry, i) => (
                <div key={entry.id} className="service-node" style={{
                  display: "flex", gap: 16, padding: "12px 0",
                  borderBottom: `1px solid rgba(197,160,89,0.06)`,
                  animation: `fadeIn 0.5s ${0.9 + i * 0.1}s ease both`,
                }}>
                  {/* Timeline connector */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16, flexShrink: 0 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", border: `1.5px solid ${i === 0 ? COLORS.gold : COLORS.whiteMuted}`,
                      background: i === 0 ? COLORS.gold : "transparent", flexShrink: 0,
                    }} />
                    {i < serviceHistory.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: `linear-gradient(${COLORS.glassBorder}, transparent)`, marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.06em" }}>{entry.type}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COLORS.gold }}>{entry.cost}</span>
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.whiteDim, fontWeight: 300, marginTop: 3, letterSpacing: "0.03em" }}>{entry.desc}</div>
                    <div style={{
                      display: "flex", gap: 12, marginTop: 5,
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: COLORS.whiteMuted, letterSpacing: "0.1em",
                    }}>
                      <span>{entry.date}</span>
                      <span>{entry.km}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
