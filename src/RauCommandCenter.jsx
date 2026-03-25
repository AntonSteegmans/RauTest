import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const C = {
  bg: "#080808", panel: "#141414", panelHover: "#1c1c1c", panelBorder: "#2a2a2a",
  surface: "#1e1e1e", surfaceHover: "#262626",
  gold: "#D4A84B", goldBright: "#E8C068", goldDim: "rgba(212,168,75,0.4)",
  goldGlow: "rgba(212,168,75,0.15)", goldSubtle: "rgba(212,168,75,0.08)",
  white: "#F0EDE6", text: "#C8C4BB", textMuted: "#8A8680", textDark: "#5A5752",
  red: "#E8524A", redDim: "rgba(232,82,74,0.15)",
  green: "#5ABF6E", greenDim: "rgba(90,191,110,0.15)", blue: "#5B9FD4",
};

const fleet = [
  {
    id: "huracan", name: "Huracán STO", make: "Lamborghini", year: 2025,
    spec: "V10 · 640 PS · RWD", vin: "ZHWUF4ZF6LLA14892", color: "#1a1a1a",
    value: 3640000, change: +3.5, mileage: "4,820 km", fuel: 73, image: "🏎",
    hotspots: [
      { id: "fl", label: "FRONT LEFT TIRE", val: "34.2 PSI", sub: "38°C · Optimal", status: "ok" },
      { id: "fr", label: "FRONT RIGHT TIRE", val: "34.0 PSI", sub: "37°C · Optimal", status: "ok" },
      { id: "rl", label: "REAR LEFT TIRE", val: "33.8 PSI", sub: "36°C · Optimal", status: "ok" },
      { id: "rr", label: "REAR RIGHT TIRE", val: "33.5 PSI", sub: "39°C · Monitor", status: "warn" },
      { id: "eng", label: "ENGINE BAY", val: "V10 · 640 PS", sub: "Oil Temp: 92°C", status: "ok" },
      { id: "fuel", label: "FUEL LEVEL", val: "73%", sub: "Range: ~380 km", status: "ok" },
    ],
    valueHistory: [
      { m:"Jan",v:2850 },{ m:"Feb",v:2920 },{ m:"Mar",v:2880 },{ m:"Apr",v:3050 },
      { m:"May",v:3120 },{ m:"Jun",v:3080 },{ m:"Jul",v:3200 },{ m:"Aug",v:3350 },
      { m:"Sep",v:3410 },{ m:"Oct",v:3380 },{ m:"Nov",v:3520 },{ m:"Dec",v:3640 },
    ],
    services: [
      { date:"2025-12-15", type:"Full Service", desc:"Annual inspection & oil change", km:"4,820 km", cost:"€2,340" },
      { date:"2025-09-03", type:"Tire Replacement", desc:"Michelin Pilot Sport 5 — Full set", km:"3,610 km", cost:"€3,890" },
      { date:"2025-06-22", type:"Ceramic Coating", desc:"Gtechniq Crystal Serum Ultra", km:"2,100 km", cost:"€1,850" },
      { date:"2025-03-10", type:"Delivery", desc:"Factory delivery — Nardò, IT", km:"0 km", cost:"—" },
    ],
    docs: [
      { name:"Certificate of Authenticity", type:"PDF", size:"2.4 MB" },
      { name:"Service Record 2025", type:"PDF", size:"1.1 MB" },
      { name:"Insurance Policy", type:"PDF", size:"890 KB" },
      { name:"Technical Blueprint", type:"DWG", size:"14.2 MB" },
      { name:"Paint Specification", type:"PDF", size:"340 KB" },
    ],
  },
  {
    id: "gt3rs", name: "911 GT3 RS", make: "Porsche", year: 2024,
    spec: "Flat-6 · 525 PS · RWD", vin: "WP0AF2A99RLS26714", color: "#e8e8e8",
    value: 412000, change: +5.2, mileage: "12,340 km", fuel: 45, image: "🏁",
    hotspots: [
      { id: "fl", label: "FRONT LEFT", val: "32.8 PSI", sub: "35°C · Optimal", status: "ok" },
      { id: "rl", label: "REAR LEFT", val: "30.2 PSI", sub: "41°C · Low", status: "warn" },
      { id: "eng", label: "ENGINE", val: "Flat-6 · 525 PS", sub: "Oil: 88°C", status: "ok" },
      { id: "fuel", label: "FUEL", val: "45%", sub: "Range: ~210 km", status: "ok" },
    ],
    valueHistory: [
      { m:"Jan",v:380 },{ m:"Feb",v:385 },{ m:"Mar",v:378 },{ m:"Apr",v:390 },
      { m:"May",v:395 },{ m:"Jun",v:388 },{ m:"Jul",v:398 },{ m:"Aug",v:402 },
      { m:"Sep",v:405 },{ m:"Oct",v:400 },{ m:"Nov",v:408 },{ m:"Dec",v:412 },
    ],
    services: [
      { date:"2025-11-20", type:"Brake Service", desc:"PCCB front & rear pads", km:"12,340 km", cost:"€4,200" },
      { date:"2025-07-14", type:"Full Service", desc:"Annual inspection", km:"9,800 km", cost:"€1,890" },
      { date:"2024-12-01", type:"Delivery", desc:"Factory — Zuffenhausen, DE", km:"0 km", cost:"—" },
    ],
    docs: [
      { name:"Certificate of Authenticity", type:"PDF", size:"1.9 MB" },
      { name:"Service Record 2025", type:"PDF", size:"980 KB" },
      { name:"Insurance Policy", type:"PDF", size:"750 KB" },
    ],
  },
  {
    id: "sf90", name: "SF90 Stradale", make: "Ferrari", year: 2023,
    spec: "V8 Hybrid · 1000 PS · AWD", vin: "ZFF93LMA5P0284521", color: "#b91c1c",
    value: 895000, change: -1.2, mileage: "8,450 km", fuel: 88, image: "🐎",
    hotspots: [
      { id: "fl", label: "FRONT LEFT", val: "33.0 PSI", sub: "36°C · Optimal", status: "ok" },
      { id: "eng", label: "HYBRID POWERTRAIN", val: "V8+E · 1000 PS", sub: "Battery: 64%", status: "ok" },
      { id: "fuel", label: "FUEL", val: "88%", sub: "Range: ~520 km", status: "ok" },
    ],
    valueHistory: [
      { m:"Jan",v:920 },{ m:"Feb",v:915 },{ m:"Mar",v:910 },{ m:"Apr",v:905 },
      { m:"May",v:912 },{ m:"Jun",v:908 },{ m:"Jul",v:900 },{ m:"Aug",v:895 },
      { m:"Sep",v:898 },{ m:"Oct",v:892 },{ m:"Nov",v:890 },{ m:"Dec",v:895 },
    ],
    services: [
      { date:"2025-10-08", type:"Full Service", desc:"Annual inspection & fluid change", km:"8,450 km", cost:"€3,100" },
      { date:"2025-05-20", type:"Software Update", desc:"Hybrid firmware v4.2", km:"5,200 km", cost:"€0" },
      { date:"2024-09-15", type:"Delivery", desc:"Factory — Maranello, IT", km:"0 km", cost:"—" },
    ],
    docs: [
      { name:"Certificate of Authenticity", type:"PDF", size:"3.1 MB" },
      { name:"Service Record 2024–25", type:"PDF", size:"1.4 MB" },
      { name:"Hybrid System Manual", type:"PDF", size:"6.7 MB" },
    ],
  },
];

const notifications = [
  { id:1, title:"Tire Pressure Alert", desc:"Rear right tire on Huracán STO below optimal (33.5 PSI)", time:"2h ago", type:"warn" },
  { id:2, title:"Service Due", desc:"911 GT3 RS — Annual inspection in 30 days", time:"1d ago", type:"info" },
  { id:3, title:"Value Update", desc:"Huracán STO appreciated +3.5% this month", time:"2d ago", type:"ok" },
  { id:4, title:"Insurance Renewal", desc:"SF90 Stradale policy expires Feb 28, 2026", time:"5d ago", type:"warn" },
];

const mono = "'JetBrains Mono', monospace";
const sans = "'Outfit', sans-serif";
const fmtEuro = v => v >= 1e6 ? `€${(v/1e6).toFixed(2)}M` : `€${(v/1000).toFixed(0)}K`;
const pieColors = [C.gold, C.blue, C.red];

function buildCar(canvas, carColor) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setSize(w, h); r.setPixelRatio(Math.min(devicePixelRatio, 2));
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.4;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, w/h, 0.1, 100);
  cam.position.set(5.8, 2.6, 5.8); cam.lookAt(0,0,0);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40,40), new THREE.MeshStandardMaterial({color:0x0c0c0c, metalness:0.85, roughness:0.35}));
  ground.rotation.x = -Math.PI/2; ground.position.y = -0.72; scene.add(ground);
  const grid = new THREE.GridHelper(20, 40, 0x1a1a1a, 0x141414); grid.position.y = -0.71; scene.add(grid);

  const bodyMat = new THREE.MeshStandardMaterial({color: new THREE.Color(carColor), metalness:0.92, roughness:0.12});
  const glassMat = new THREE.MeshStandardMaterial({color:0x2a3a4a, metalness:0.7, roughness:0.1, transparent:true, opacity:0.55});
  const wheelMat = new THREE.MeshStandardMaterial({color:0x111111, metalness:0.6, roughness:0.5});
  const rimMat = new THREE.MeshStandardMaterial({color:0x333333, metalness:0.95, roughness:0.08});
  const goldMat = new THREE.MeshStandardMaterial({color:0xD4A84B, emissive:0xD4A84B, emissiveIntensity:0.8});

  const cg = new THREE.Group();
  const bs = new THREE.Shape();
  bs.moveTo(-2.4,0); bs.lineTo(-2.2,0.15);
  bs.bezierCurveTo(-1.8,0.35,-1.2,0.55,-0.5,0.75);
  bs.bezierCurveTo(0,0.88,0.6,0.88,1.0,0.78);
  bs.bezierCurveTo(1.6,0.6,2.1,0.4,2.4,0.25);
  bs.lineTo(2.4,0); bs.lineTo(-2.4,0);
  const bg = new THREE.ExtrudeGeometry(bs, {depth:1.8, bevelEnabled:true, bevelThickness:0.1, bevelSize:0.1, bevelSegments:6});
  bg.center(); const bm = new THREE.Mesh(bg, bodyMat); bm.position.y = 0.05; cg.add(bm);

  const wg = new THREE.EdgesGeometry(bg, 20);
  const wm = new THREE.LineSegments(wg, new THREE.LineBasicMaterial({color:0xD4A84B, transparent:true, opacity:0.2}));
  wm.position.copy(bm.position); cg.add(wm);

  const cs = new THREE.Shape();
  cs.moveTo(-0.6,0); cs.bezierCurveTo(-0.5,0.3,-0.2,0.38,0.3,0.38);
  cs.bezierCurveTo(0.6,0.38,0.8,0.1,0.85,0); cs.lineTo(-0.6,0);
  const cGeo = new THREE.ExtrudeGeometry(cs, {depth:1.35, bevelEnabled:true, bevelThickness:0.04, bevelSize:0.04, bevelSegments:4});
  cGeo.center(); const cm = new THREE.Mesh(cGeo, glassMat); cm.position.set(0.05,0.72,0); cg.add(cm);

  [[-1.55,-0.38,0.92],[-1.55,-0.38,-0.92],[1.55,-0.38,0.92],[1.55,-0.38,-0.92]].forEach(([x,y,z])=>{
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,0.24,28), wheelMat);
    wh.rotation.x=Math.PI/2; wh.position.set(x,y,z); cg.add(wh);
    const ri = new THREE.Mesh(new THREE.CylinderGeometry(0.23,0.23,0.26,10), rimMat);
    ri.rotation.x=Math.PI/2; ri.position.set(x,y,z); cg.add(ri);
  });
  [-0.86,0.86].forEach(z=>{const l=new THREE.Mesh(new THREE.BoxGeometry(4.6,0.01,0.01),goldMat);l.position.set(0,0.22,z);cg.add(l);});
  const rl=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.07,1.6),new THREE.MeshStandardMaterial({color:0xe8524a,emissive:0xe8524a,emissiveIntensity:2.5}));
  rl.position.set(2.38,0.25,0);cg.add(rl);
  [-0.55,0.55].forEach(z=>{const hl=new THREE.Mesh(new THREE.SphereGeometry(0.09,14,14),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:4}));hl.position.set(-2.38,0.26,z);cg.add(hl);});
  scene.add(cg);

  scene.add(new THREE.AmbientLight(0x222222, 1.0));
  const kl=new THREE.SpotLight(0xfff0dd,3.5,25,Math.PI/5,0.4);kl.position.set(6,7,4);kl.lookAt(0,0,0);scene.add(kl);
  const fl=new THREE.SpotLight(0xbbccee,2.0,25,Math.PI/4,0.5);fl.position.set(-5,5,-3);scene.add(fl);
  scene.add(Object.assign(new THREE.PointLight(0xD4A84B,2.0,18),{position:new THREE.Vector3(0,4,-6)}));
  scene.add(Object.assign(new THREE.PointLight(0xffffff,1.2,15),{position:new THREE.Vector3(0,8,0)}));
  scene.add(Object.assign(new THREE.PointLight(0xD4A84B,0.6,5),{position:new THREE.Vector3(0,-0.2,0)}));

  let mx=0, af, tr=0, cr2=0;
  const onM=e=>{const rc=canvas.getBoundingClientRect();mx=((e.clientX-rc.left)/rc.width-0.5)*2;};
  canvas.addEventListener("mousemove",onM);
  const anim=()=>{af=requestAnimationFrame(anim);const t=Date.now()*0.00025;tr=Math.sin(t)*0.45+mx*0.7;cr2+=(tr-cr2)*0.025;cg.rotation.y=cr2;r.render(scene,cam);};
  anim();
  const onR=()=>{const nw=canvas.clientWidth,nh=canvas.clientHeight;cam.aspect=nw/nh;cam.updateProjectionMatrix();r.setSize(nw,nh);};
  window.addEventListener("resize",onR);
  return()=>{cancelAnimationFrame(af);canvas.removeEventListener("mousemove",onM);window.removeEventListener("resize",onR);r.dispose();};
}

const Badge=({children,color=C.gold})=>(
  <span style={{fontSize:10,fontFamily:mono,letterSpacing:"0.1em",padding:"3px 10px",background:`${color}18`,color,border:`1px solid ${color}35`,borderRadius:2,fontWeight:500}}>{children}</span>
);

const Panel=({children,style,onClick,hov})=>{
  const [h,setH]=useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{background:hov&&h?C.panelHover:C.panel,border:`1px solid ${hov&&h?C.goldDim:C.panelBorder}`,borderRadius:4,cursor:onClick?"pointer":"default",transition:"all 0.25s",...style}}>{children}</div>;
};

const Modal=({open,onClose,title,children})=>{
  if(!open)return null;
  return <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.panel,border:`1px solid ${C.panelBorder}`,borderRadius:6,width:"90%",maxWidth:520,maxHeight:"80vh",overflow:"auto"}}>
      <div style={{padding:"18px 22px",borderBottom:`1px solid ${C.panelBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,letterSpacing:"0.25em",color:C.gold,fontWeight:500}}>{title}</span>
        <span onClick={onClose} style={{cursor:"pointer",color:C.textMuted,fontSize:20,lineHeight:1}}>×</span>
      </div>
      <div style={{padding:22}}>{children}</div>
    </div>
  </div>;
};

const Tip=({active,payload,pre="€",suf="K"})=>{
  if(!active||!payload?.length)return null;
  return <div style={{background:C.surface,border:`1px solid ${C.goldDim}`,padding:"10px 14px",fontFamily:mono,fontSize:12,color:C.gold,borderRadius:2}}>
    <div style={{color:C.textMuted,fontSize:10,marginBottom:3}}>{payload[0].payload.m}</div>
    <div>{pre}{payload[0].value}{suf}</div>
  </div>;
};

function SettingRow({label,desc,active:init}){
  const [on,setOn]=useState(init);
  return <Panel hov onClick={()=>setOn(!on)} style={{padding:"16px 20px",marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div><div style={{fontSize:13,color:C.text}}>{label}</div><div style={{fontSize:11,color:C.textMuted,marginTop:3}}>{desc}</div></div>
    <div style={{width:40,height:22,borderRadius:11,padding:2,background:on?C.gold:C.panelBorder,transition:"all 0.25s"}}>
      <div style={{width:18,height:18,borderRadius:"50%",background:C.white,transition:"all 0.25s",transform:on?"translateX(18px)":"translateX(0)"}}/>
    </div>
  </Panel>;
}

export default function App(){
  const [sideOpen,setSideOpen]=useState(true);
  const [nav,setNav]=useState("hangar");
  const [carIdx,setCarIdx]=useState(0);
  const [hotModal,setHotModal]=useState(null);
  const [docModal,setDocModal]=useState(null);
  const [svcModal,setSvcModal]=useState(null);
  const [notifOpen,setNotifOpen]=useState(false);
  const [fleetFilter,setFleetFilter]=useState("all");
  const [loaded,setLoaded]=useState(false);
  const [scanDone,setScanDone]=useState(false);
  const canvasRef=useRef(null);
  const cleanRef=useRef(null);
  const car=fleet[carIdx];

  useEffect(()=>{setTimeout(()=>setLoaded(true),200);setTimeout(()=>setScanDone(true),1800);},[]);
  useEffect(()=>{
    if(!canvasRef.current||nav!=="hangar")return;
    if(cleanRef.current)cleanRef.current();
    cleanRef.current=buildCar(canvasRef.current,car.color);
    return()=>{if(cleanRef.current)cleanRef.current();};
  },[carIdx,nav]);

  const sw=sideOpen?210:58;
  const totalVal=fleet.reduce((s,c)=>s+c.value,0);
  const navItems=[{id:"hangar",icon:"⬡",label:"Hangar"},{id:"fleet",icon:"◇",label:"Fleet"},{id:"analytics",icon:"△",label:"Analytics"},{id:"vault",icon:"□",label:"Vault"},{id:"service",icon:"○",label:"Service"},{id:"settings",icon:"⚙",label:"Settings"}];

  const renderHangar=()=>(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{flex:"1 1 55%",position:"relative",minHeight:300}}>
        <canvas ref={canvasRef} style={{width:"100%",height:"100%",display:"block"}}/>
        <div style={{position:"absolute",top:28,left:32,zIndex:10,opacity:scanDone?1:0,transition:"opacity 0.6s"}}>
          <div style={{fontSize:10,letterSpacing:"0.4em",color:C.textMuted,fontWeight:300,marginBottom:6}}>ACTIVE ASSET</div>
          <div style={{fontSize:30,fontWeight:200,letterSpacing:"0.06em",color:C.white}}>{car.name}</div>
          <div style={{fontSize:12,color:C.gold,letterSpacing:"0.18em",fontWeight:400,marginTop:6}}>{car.year} · {car.spec}</div>
        </div>
        <div style={{position:"absolute",top:28,right:32,zIndex:10,textAlign:"right",fontFamily:mono,opacity:scanDone?1:0,transition:"opacity 0.6s 0.2s"}}>
          <div style={{fontSize:10,letterSpacing:"0.3em",color:C.textMuted}}>CURRENT VALUATION</div>
          <div style={{fontSize:34,fontWeight:300,color:C.goldBright,marginTop:4}}>{fmtEuro(car.value)}</div>
          <div style={{fontSize:12,marginTop:4,color:car.change>=0?C.green:C.red}}>
            {car.change>=0?"+":""}{car.change}% {car.change>=0?"▲":"▼"} <span style={{color:C.textMuted,marginLeft:6}}>30D</span>
          </div>
        </div>
        <div style={{position:"absolute",bottom:28,left:32,zIndex:10,display:"flex",gap:8,opacity:scanDone?1:0,transition:"opacity 0.6s 0.4s"}}>
          {fleet.map((c,i)=>{const sel=i===carIdx;return(
            <div key={c.id} onClick={()=>setCarIdx(i)} style={{padding:"10px 18px",background:sel?C.surface:"rgba(8,8,8,0.8)",border:`1px solid ${sel?C.gold:C.panelBorder}`,borderRadius:3,cursor:"pointer",transition:"all 0.3s",backdropFilter:"blur(12px)"}}>
              <div style={{fontSize:11,color:sel?C.gold:C.text,fontWeight:500,letterSpacing:"0.1em"}}>{c.make}</div>
              <div style={{fontSize:10,color:C.textMuted,fontFamily:mono,marginTop:2}}>{c.name}</div>
            </div>
          );})}
        </div>
        <div style={{position:"absolute",bottom:28,right:32,zIndex:10,display:"flex",gap:6,flexWrap:"wrap",maxWidth:320,justifyContent:"flex-end",opacity:scanDone?1:0,transition:"opacity 0.6s 0.5s"}}>
          {car.hotspots.map(hs=>(
            <div key={hs.id} onClick={()=>setHotModal(hs)} style={{padding:"7px 14px",background:"rgba(8,8,8,0.85)",backdropFilter:"blur(12px)",border:`1px solid ${hs.status==="warn"?C.red+"60":C.panelBorder}`,borderRadius:3,cursor:"pointer",transition:"all 0.25s",display:"flex",alignItems:"center",gap:7}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=hs.status==="warn"?C.red:C.gold;e.currentTarget.style.background=C.surface;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=hs.status==="warn"?C.red+"60":C.panelBorder;e.currentTarget.style.background="rgba(8,8,8,0.85)";}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:hs.status==="warn"?C.red:C.green,boxShadow:`0 0 6px ${hs.status==="warn"?C.red:C.green}`}}/>
              <span style={{fontSize:10,color:C.text,fontFamily:mono,letterSpacing:"0.08em"}}>{hs.val}</span>
            </div>
          ))}
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:100,background:`linear-gradient(transparent,${C.bg})`,pointerEvents:"none",zIndex:5}}/>
      </div>
      <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,opacity:0.5,flexShrink:0}}/>
      <div style={{flex:"0 0 auto",height:"40%",minHeight:260,display:"flex",gap:1,background:C.bg}}>
        <div style={{flex:1,padding:"18px 22px",borderRight:`1px solid ${C.panelBorder}`,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div><div style={{fontSize:11,letterSpacing:"0.3em",color:C.text,fontWeight:500}}>ASSET PERFORMANCE</div></div>
            <Badge>12M</Badge>
          </div>
          <div style={{flex:1,minHeight:0}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={car.valueHistory} margin={{top:5,right:5,bottom:0,left:-20}}>
                <defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.gold} stopOpacity={0.3}/><stop offset="100%" stopColor={C.gold} stopOpacity={0.02}/></linearGradient></defs>
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fontSize:9,fill:C.textMuted,fontFamily:mono}}/>
                <YAxis axisLine={false} tickLine={false} tick={{fontSize:9,fill:C.textMuted,fontFamily:mono}}/>
                <Tooltip content={<Tip/>}/>
                <Area type="monotone" dataKey="v" stroke={C.gold} strokeWidth={2} fill="url(#gg)" dot={false} activeDot={{r:4,fill:C.gold,stroke:C.bg,strokeWidth:2}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{flex:0.8,padding:"18px 22px",borderRight:`1px solid ${C.panelBorder}`,display:"flex",flexDirection:"column"}}>
          <div style={{fontSize:11,letterSpacing:"0.3em",color:C.text,fontWeight:500,marginBottom:14}}>DIGITAL VAULT</div>
          <div style={{flex:1,overflowY:"auto"}}>
            {car.docs.map((d,i)=>(
              <div key={i} onClick={()=>setDocModal(d)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 10px",borderBottom:`1px solid ${C.panelBorder}20`,cursor:"pointer",transition:"all 0.2s",borderRadius:3}}
                onMouseEnter={e=>e.currentTarget.style.background=C.surfaceHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:C.goldSubtle,border:`1px solid ${C.goldDim}`,borderRadius:3,fontSize:12,color:C.gold,fontFamily:mono,fontWeight:600}}>◈</div>
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</div><div style={{fontSize:10,color:C.textMuted,fontFamily:mono,marginTop:2}}>{d.type} · {d.size}</div></div>
                <span style={{fontSize:14,color:C.textMuted}}>→</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{flex:1,padding:"18px 22px",display:"flex",flexDirection:"column"}}>
          <div style={{fontSize:11,letterSpacing:"0.3em",color:C.text,fontWeight:500,marginBottom:14}}>SERVICE TIMELINE</div>
          <div style={{flex:1,overflowY:"auto"}}>
            {car.services.map((s,i)=>(
              <div key={i} onClick={()=>setSvcModal(s)} style={{display:"flex",gap:14,padding:"12px 0",cursor:"pointer",borderBottom:`1px solid ${C.panelBorder}20`,transition:"all 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.surfaceHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:18,flexShrink:0}}>
                  <div style={{width:10,height:10,borderRadius:"50%",border:`2px solid ${i===0?C.gold:C.textDark}`,background:i===0?C.gold:"transparent"}}/>
                  {i<car.services.length-1&&<div style={{width:1,flex:1,background:C.panelBorder,marginTop:4}}/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.text}}>{s.type}</span><span style={{fontFamily:mono,fontSize:11,color:C.gold}}>{s.cost}</span></div>
                  <div style={{fontSize:11,color:C.textMuted,marginTop:3}}>{s.desc}</div>
                  <div style={{fontFamily:mono,fontSize:9,color:C.textDark,marginTop:5}}>{s.date} · {s.km}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFleet=()=>(
    <div style={{padding:32,overflowY:"auto",height:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><div style={{fontSize:11,letterSpacing:"0.3em",color:C.text,fontWeight:500}}>FLEET OVERVIEW</div><div style={{fontSize:10,color:C.textMuted,fontFamily:mono,marginTop:3}}>{fleet.length} ASSETS · {fmtEuro(totalVal)}</div></div>
        <div style={{display:"flex",gap:6}}>{["all","appreciating","depreciating"].map(f=>(
          <div key={f} onClick={()=>setFleetFilter(f)} style={{padding:"5px 14px",fontSize:10,letterSpacing:"0.12em",border:`1px solid ${fleetFilter===f?C.gold:C.panelBorder}`,color:fleetFilter===f?C.gold:C.textMuted,background:fleetFilter===f?C.goldSubtle:"transparent",cursor:"pointer",borderRadius:2,transition:"all 0.2s",fontFamily:mono}}>{f.toUpperCase()}</div>
        ))}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
        {fleet.filter(c=>fleetFilter==="all"||(fleetFilter==="appreciating"?c.change>0:c.change<0)).map((c,i)=>(
          <Panel key={c.id} hov onClick={()=>{setCarIdx(fleet.indexOf(c));setNav("hangar");}} style={{padding:0,overflow:"hidden",cursor:"pointer"}}>
            <div style={{height:3,background:`linear-gradient(90deg,${c.color},${C.gold})`}}/>
            <div style={{padding:"20px 22px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:10,letterSpacing:"0.3em",color:C.textMuted}}>{c.make.toUpperCase()}</div>
                  <div style={{fontSize:20,color:C.white,fontWeight:300,marginTop:4}}>{c.name}</div>
                  <div style={{fontSize:11,color:C.textMuted,marginTop:4,fontFamily:mono}}>{c.year} · {c.spec}</div>
                </div>
                <div style={{fontSize:36,opacity:0.25}}>{c.image}</div>
              </div>
              <div style={{marginTop:18,display:"flex",gap:20}}>
                <div><div style={{fontSize:9,color:C.textDark,letterSpacing:"0.2em"}}>VALUE</div><div style={{fontSize:18,color:C.goldBright,fontFamily:mono,fontWeight:500,marginTop:2}}>{fmtEuro(c.value)}</div></div>
                <div><div style={{fontSize:9,color:C.textDark,letterSpacing:"0.2em"}}>30D</div><div style={{fontSize:14,fontFamily:mono,fontWeight:500,marginTop:4,color:c.change>=0?C.green:C.red}}>{c.change>=0?"+":""}{c.change}%</div></div>
                <div><div style={{fontSize:9,color:C.textDark,letterSpacing:"0.2em"}}>MILEAGE</div><div style={{fontSize:14,color:C.text,fontFamily:mono,marginTop:4}}>{c.mileage}</div></div>
              </div>
              <div style={{marginTop:16}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:9,color:C.textDark,letterSpacing:"0.15em"}}>FUEL</span><span style={{fontSize:10,color:C.textMuted,fontFamily:mono}}>{c.fuel}%</span></div>
                <div style={{height:3,background:C.panelBorder,borderRadius:2}}><div style={{height:"100%",borderRadius:2,width:`${c.fuel}%`,background:`linear-gradient(90deg,${C.gold},${C.goldBright})`,transition:"width 0.5s"}}/></div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );

  const renderAnalytics=()=>(
    <div style={{padding:32,overflowY:"auto",height:"100%"}}>
      <div style={{fontSize:11,letterSpacing:"0.3em",color:C.text,fontWeight:500,marginBottom:20}}>PORTFOLIO ANALYTICS</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:24}}>
        {[{l:"TOTAL ASSETS",v:fleet.length,s:"Vehicles"},{l:"AVG APPRECIATION",v:`+${(fleet.reduce((s,c)=>s+c.change,0)/fleet.length).toFixed(1)}%`,s:"30 Day Avg"},{l:"TOTAL SERVICE",v:"€17,270",s:"FY 2025"}].map((st,i)=>(
          <Panel key={i} style={{padding:"20px 22px"}}><div style={{fontSize:9,letterSpacing:"0.3em",color:C.textMuted}}>{st.l}</div><div style={{fontSize:28,color:C.goldBright,fontFamily:mono,marginTop:8}}>{st.v}</div><div style={{fontSize:10,color:C.textDark,marginTop:6}}>{st.s}</div></Panel>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <Panel style={{padding:"20px 22px"}}><div style={{fontSize:11,letterSpacing:"0.3em",color:C.text,fontWeight:500,marginBottom:16}}>VALUE COMPARISON</div>
          <div style={{height:220}}><ResponsiveContainer width="100%" height="100%"><BarChart data={fleet.map(c=>({name:c.name.split(" ")[0],value:c.value/1000}))} margin={{top:5,right:5,bottom:0,left:-10}}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10,fill:C.textMuted,fontFamily:mono}}/>
            <YAxis axisLine={false} tickLine={false} tick={{fontSize:9,fill:C.textMuted,fontFamily:mono}} tickFormatter={v=>`€${v}K`}/>
            <Tooltip content={<Tip/>}/><Bar dataKey="value" radius={[3,3,0,0]}>{fleet.map((_,i)=><Cell key={i} fill={pieColors[i]} fillOpacity={0.8}/>)}</Bar>
          </BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel style={{padding:"20px 22px",display:"flex",flexDirection:"column"}}><div style={{fontSize:11,letterSpacing:"0.3em",color:C.text,fontWeight:500,marginBottom:16}}>ALLOCATION</div>
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={fleet.map(c=>({name:c.name,value:c.value}))} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} stroke="none">
            {fleet.map((_,i)=><Cell key={i} fill={pieColors[i]}/>)}</Pie><Tooltip content={<Tip/>}/></PieChart></ResponsiveContainer></div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:8}}>{fleet.map((c,i)=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:2,background:pieColors[i]}}/><span style={{fontSize:10,color:C.text,flex:1}}>{c.name}</span><span style={{fontSize:10,color:C.textMuted,fontFamily:mono}}>{((c.value/totalVal)*100).toFixed(1)}%</span></div>
          ))}</div>
        </Panel>
      </div>
    </div>
  );

  const renderVault=()=>(
    <div style={{padding:32,overflowY:"auto",height:"100%"}}>
      <div style={{fontSize:11,letterSpacing:"0.3em",color:C.text,fontWeight:500,marginBottom:20}}>DOCUMENT VAULT</div>
      {fleet.map(c=>(
        <div key={c.id} style={{marginBottom:28}}>
          <div style={{fontSize:11,letterSpacing:"0.2em",color:C.gold,marginBottom:12,fontWeight:500}}>{c.make.toUpperCase()} {c.name.toUpperCase()}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
            {c.docs.map((d,di)=>(
              <Panel key={di} hov onClick={()=>setDocModal({...d,car:c.name})} style={{padding:"16px 18px",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",background:C.goldSubtle,border:`1px solid ${C.goldDim}`,borderRadius:3,fontSize:14,color:C.gold,fontFamily:mono}}>◈</div>
                  <div><div style={{fontSize:12,color:C.text}}>{d.name}</div><div style={{fontSize:10,color:C.textMuted,fontFamily:mono,marginTop:2}}>{d.type} · {d.size}</div></div>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderService=()=>(
    <div style={{padding:32,overflowY:"auto",height:"100%"}}>
      <div style={{fontSize:11,letterSpacing:"0.3em",color:C.text,fontWeight:500,marginBottom:20}}>SERVICE CENTER</div>
      {fleet.map(c=>(
        <div key={c.id} style={{marginBottom:32}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,padding:"12px 16px",background:C.panel,border:`1px solid ${C.panelBorder}`,borderRadius:4}}>
            <div style={{fontSize:11,letterSpacing:"0.2em",color:C.gold,flex:1,fontWeight:500}}>{c.make.toUpperCase()} {c.name.toUpperCase()}</div>
            <Badge>{c.mileage}</Badge><Badge color={C.green}>{c.services.length} RECORDS</Badge>
          </div>
          {c.services.map((s,si)=>(
            <div key={si} onClick={()=>setSvcModal({...s,car:c.name})} style={{display:"flex",gap:16,padding:"14px 16px",marginLeft:20,borderLeft:`1px solid ${C.panelBorder}`,cursor:"pointer",transition:"all 0.2s",borderRadius:"0 4px 4px 0",marginBottom:2}}
              onMouseEnter={e=>e.currentTarget.style.background=C.surfaceHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{width:12,height:12,borderRadius:"50%",flexShrink:0,marginTop:2,border:`2px solid ${si===0?C.gold:C.textDark}`,background:si===0?C.gold:"transparent",marginLeft:-7}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:C.text}}>{s.type}</span><span style={{fontFamily:mono,fontSize:12,color:C.gold}}>{s.cost}</span></div>
                <div style={{fontSize:11,color:C.textMuted,marginTop:3}}>{s.desc}</div>
                <div style={{fontFamily:mono,fontSize:9,color:C.textDark,marginTop:5}}>{s.date} · {s.km}</div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderSettings=()=>(
    <div style={{padding:32,overflowY:"auto",height:"100%",maxWidth:600}}>
      <div style={{fontSize:11,letterSpacing:"0.3em",color:C.text,fontWeight:500,marginBottom:20}}>SETTINGS</div>
      {[{l:"Notifications",d:"Email alerts for value changes & service",a:true},{l:"Dark Mode",d:"Enhanced dark interface",a:true},{l:"Two-Factor Auth",d:"Secure vault with 2FA",a:false},{l:"Auto-Valuation",d:"Daily market value updates",a:true},{l:"Sharing",d:"Share collection with partners",a:false}].map((s,i)=><SettingRow key={i} label={s.l} desc={s.d} active={s.a}/>)}
      <div style={{marginTop:32}}>
        <div style={{fontSize:11,letterSpacing:"0.3em",color:C.text,fontWeight:500,marginBottom:12}}>ACCOUNT</div>
        <Panel style={{padding:"20px 22px"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:C.goldSubtle,border:`2px solid ${C.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.gold,fontWeight:500}}>AS</div>
            <div><div style={{fontSize:14,color:C.white}}>Anton Steegmans</div><div style={{fontSize:11,color:C.textMuted,marginTop:2}}>Collector · Premium Tier</div></div>
          </div>
        </Panel>
      </div>
    </div>
  );

  const sections={hangar:renderHangar,fleet:renderFleet,analytics:renderAnalytics,vault:renderVault,service:renderService,settings:renderSettings};

  return(
    <div style={{width:"100%",height:"100vh",background:C.bg,color:C.white,fontFamily:sans,overflow:"hidden",position:"relative",letterSpacing:"0.03em"}}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Outfit:wght@200;300;400;500;600&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes scanLine{0%{top:0;opacity:1}80%{opacity:1}100%{top:100%;opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.goldDim};border-radius:2px}
        *{scrollbar-width:thin;scrollbar-color:${C.goldDim} transparent}
      `}</style>

      {!scanDone&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,zIndex:200,background:`linear-gradient(90deg,transparent,${C.goldBright},transparent)`,animation:"scanLine 1.6s ease-in-out forwards",boxShadow:`0 0 40px 15px ${C.goldDim}`}}/>}
      <div style={{position:"fixed",inset:0,zIndex:99,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 65%,rgba(0,0,0,0.4) 100%)"}}/>

      {/* Sidebar */}
      <nav style={{position:"fixed",top:0,left:0,bottom:0,width:sw,zIndex:100,background:C.panel,borderRight:`1px solid ${C.panelBorder}`,transition:"width 0.35s cubic-bezier(0.4,0,0.2,1)",display:"flex",flexDirection:"column",opacity:loaded?1:0}}>
        <div onClick={()=>setSideOpen(!sideOpen)} style={{padding:sideOpen?"24px 22px":"24px 14px",borderBottom:`1px solid ${C.panelBorder}`,display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"padding 0.35s"}}>
          <div style={{width:30,height:30,border:`1.5px solid ${C.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:mono,fontSize:13,color:C.gold,fontWeight:600,letterSpacing:"0.1em",flexShrink:0}}>R</div>
          {sideOpen&&<div><div style={{fontSize:14,fontWeight:600,letterSpacing:"0.22em",color:C.white}}>RAÚ</div><div style={{fontSize:8,letterSpacing:"0.35em",color:C.textMuted}}>COMMAND CENTER</div></div>}
        </div>
        <div style={{flex:1,padding:"12px 0",display:"flex",flexDirection:"column",gap:2}}>
          {navItems.map(it=>{const a=nav===it.id;return(
            <div key={it.id} onClick={()=>setNav(it.id)} style={{display:"flex",alignItems:"center",gap:14,padding:sideOpen?"11px 22px":"11px 18px",color:a?C.gold:C.textMuted,fontSize:13,fontWeight:a?500:300,cursor:"pointer",transition:"all 0.25s",background:a?C.goldSubtle:"transparent",borderLeft:a?`2px solid ${C.gold}`:"2px solid transparent"}}
              onMouseEnter={e=>{if(!a)e.currentTarget.style.background=C.surfaceHover}} onMouseLeave={e=>{if(!a)e.currentTarget.style.background="transparent"}}>
              <span style={{fontSize:16,width:20,textAlign:"center",flexShrink:0}}>{it.icon}</span>
              {sideOpen&&<span style={{letterSpacing:"0.15em"}}>{it.label}</span>}
            </div>
          );})}
        </div>
        <div style={{padding:sideOpen?"12px 22px":"12px 14px",borderTop:`1px solid ${C.panelBorder}`}}>
          <div onClick={()=>setNotifOpen(!notifOpen)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",padding:"8px 0"}}>
            <div style={{position:"relative"}}><span style={{fontSize:16,color:C.textMuted}}>🔔</span><div style={{position:"absolute",top:-2,right:-4,width:8,height:8,borderRadius:"50%",background:C.red}}/></div>
            {sideOpen&&<span style={{fontSize:10,color:C.textMuted,letterSpacing:"0.15em"}}>NOTIFICATIONS</span>}
          </div>
        </div>
        <div style={{padding:sideOpen?"12px 22px 16px":"12px 14px 16px",borderTop:`1px solid ${C.panelBorder}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:7,height:7,borderRadius:"50%",background:C.green,boxShadow:`0 0 8px ${C.green}`}}/>{sideOpen&&<span style={{fontSize:9,letterSpacing:"0.18em",color:C.textMuted,fontFamily:mono}}>SYSTEMS NOMINAL</span>}</div>
        </div>
      </nav>

      {/* Main */}
      <main style={{marginLeft:sw,height:"100vh",transition:"margin-left 0.35s cubic-bezier(0.4,0,0.2,1)",display:"flex",flexDirection:"column"}}>
        <header style={{height:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",borderBottom:`1px solid ${C.panelBorder}`,background:C.panel,zIndex:30,flexShrink:0,opacity:loaded?1:0}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <span style={{fontSize:10,letterSpacing:"0.3em",color:C.textMuted}}>COLLECTION</span><span style={{color:C.textDark}}>›</span>
            <span style={{fontSize:10,letterSpacing:"0.25em",color:C.gold,fontWeight:500}}>{car.make.toUpperCase()} {car.name.toUpperCase()}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <span style={{fontFamily:mono,fontSize:10,color:C.textMuted}}>VIN: {car.vin}</span>
            <div onClick={()=>setNotifOpen(!notifOpen)} style={{width:30,height:30,border:`1px solid ${C.panelBorder}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",borderRadius:3,transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.goldDim;e.currentTarget.style.background=C.surface}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.panelBorder;e.currentTarget.style.background="transparent"}}>
              <span style={{fontSize:13,color:C.textMuted}}>⚡</span>
            </div>
          </div>
        </header>
        <div style={{flex:1,minHeight:0,overflow:"hidden"}}>{sections[nav]?.()}</div>
      </main>

      {/* Modals */}
      <Modal open={!!hotModal} onClose={()=>setHotModal(null)} title={hotModal?.label||""}>
        {hotModal&&<div>
          <div style={{fontSize:28,color:C.goldBright,fontFamily:mono,marginBottom:8}}>{hotModal.val}</div>
          <div style={{fontSize:13,color:C.text,marginBottom:16}}>{hotModal.sub}</div>
          <div style={{padding:"12px 16px",background:hotModal.status==="warn"?C.redDim:C.greenDim,border:`1px solid ${hotModal.status==="warn"?C.red:C.green}40`,borderRadius:4}}>
            <div style={{fontSize:11,color:hotModal.status==="warn"?C.red:C.green,fontWeight:500}}>{hotModal.status==="warn"?"⚠ ATTENTION REQUIRED":"✓ OPERATING NORMALLY"}</div>
            <div style={{fontSize:12,color:C.text,marginTop:6}}>{hotModal.status==="warn"?"Below optimal range. Schedule inspection.":"All readings within optimal parameters."}</div>
          </div>
        </div>}
      </Modal>
      <Modal open={!!docModal} onClose={()=>setDocModal(null)} title={docModal?.name||""}>
        {docModal&&<div>
          <div style={{display:"flex",gap:8,marginBottom:20}}><Badge>{docModal.type}</Badge><Badge color={C.text}>{docModal.size}</Badge>{docModal.car&&<Badge color={C.blue}>{docModal.car}</Badge>}</div>
          <div style={{height:180,background:C.surface,border:`1px solid ${C.panelBorder}`,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
            <div style={{fontSize:40,opacity:0.3}}>◈</div><div style={{fontSize:12,color:C.textMuted}}>Document Preview</div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:20}}>
            <button style={{flex:1,padding:12,background:C.gold,color:C.bg,border:"none",borderRadius:3,fontSize:12,fontWeight:600,letterSpacing:"0.15em",cursor:"pointer",fontFamily:"inherit"}}>DOWNLOAD</button>
            <button style={{flex:1,padding:12,background:"transparent",color:C.text,border:`1px solid ${C.panelBorder}`,borderRadius:3,fontSize:12,letterSpacing:"0.15em",cursor:"pointer",fontFamily:"inherit"}}>SHARE</button>
          </div>
        </div>}
      </Modal>
      <Modal open={!!svcModal} onClose={()=>setSvcModal(null)} title={svcModal?.type||""}>
        {svcModal&&<div>
          {svcModal.car&&<div style={{marginBottom:16}}><Badge color={C.blue}>{svcModal.car}</Badge></div>}
          <div style={{fontSize:14,color:C.text,marginBottom:16}}>{svcModal.desc}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{l:"DATE",v:svcModal.date},{l:"MILEAGE",v:svcModal.km},{l:"COST",v:svcModal.cost},{l:"STATUS",v:"Completed"}].map((it,i)=>(
              <div key={i} style={{padding:"12px 14px",background:C.surface,borderRadius:3}}><div style={{fontSize:9,letterSpacing:"0.2em",color:C.textDark}}>{it.l}</div><div style={{fontSize:14,color:C.goldBright,fontFamily:mono,marginTop:4}}>{it.v}</div></div>
            ))}
          </div>
          <button style={{width:"100%",marginTop:20,padding:12,background:C.gold,color:C.bg,border:"none",borderRadius:3,fontSize:12,fontWeight:600,letterSpacing:"0.15em",cursor:"pointer",fontFamily:"inherit"}}>VIEW INVOICE PDF</button>
        </div>}
      </Modal>

      {/* Notifications */}
      {notifOpen&&<div style={{position:"fixed",top:50,right:0,width:360,bottom:0,zIndex:150,background:C.panel,borderLeft:`1px solid ${C.panelBorder}`,animation:"slideIn 0.25s ease",overflowY:"auto",boxShadow:"-10px 0 40px rgba(0,0,0,0.5)"}}>
        <div style={{padding:"20px 22px",borderBottom:`1px solid ${C.panelBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,letterSpacing:"0.25em",color:C.gold,fontWeight:500}}>NOTIFICATIONS</span>
          <span onClick={()=>setNotifOpen(false)} style={{cursor:"pointer",color:C.textMuted,fontSize:20}}>×</span>
        </div>
        {notifications.map(n=>(
          <div key={n.id} style={{padding:"16px 22px",borderBottom:`1px solid ${C.panelBorder}20`,cursor:"pointer",transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.surfaceHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:n.type==="warn"?C.red:n.type==="ok"?C.green:C.blue}}/>
              <span style={{fontSize:12,color:C.text,fontWeight:500}}>{n.title}</span>
            </div>
            <div style={{fontSize:11,color:C.textMuted,marginLeft:16,lineHeight:1.5}}>{n.desc}</div>
            <div style={{fontSize:9,color:C.textDark,fontFamily:mono,marginTop:6,marginLeft:16}}>{n.time}</div>
          </div>
        ))}
      </div>}
    </div>
  );
}
