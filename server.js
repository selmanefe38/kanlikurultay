const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express(), server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, "public")));
const players = new Map();
const rooms = new Set(["ARENA-01"]);
function spawn() { return { x:(Math.random()-.5)*12, z:(Math.random()-.5)*12, yaw:0, hp:100, kills:0, deaths:0, team:Math.random()<.5?"BLUE":"RED" }; }
io.on("connection", socket => {
  socket.on("join", raw => {
    const name = String(raw || "Gladiator").replace(/[<>]/g,"").trim().slice(0,16) || "Gladiator";
    players.set(socket.id, {id:socket.id,name,...spawn(),lastAttack:0});
    socket.emit("joined", {id:socket.id, players:[...players.values()], rooms:[...rooms]});
    socket.broadcast.emit("playerJoined", players.get(socket.id));
  });
  socket.on("move", data => {
    const p=players.get(socket.id); if(!p || !data) return;
    p.x=Math.max(-19,Math.min(19,Number(data.x)||0));
    p.z=Math.max(-19,Math.min(19,Number(data.z)||0));
    p.yaw=Number(data.yaw)||0;
    socket.broadcast.emit("playerMoved",{id:p.id,x:p.x,z:p.z,yaw:p.yaw,hp:p.hp});
  });
  socket.on("attack", () => {
    const p=players.get(socket.id); if(!p || Date.now()-p.lastAttack<650) return;
    p.lastAttack=Date.now();
    let target=null, best=2.9;
    for(const other of players.values()){
      if(other.id===p.id || other.hp<=0) continue;
      const dx=other.x-p.x,dz=other.z-p.z,dist=Math.hypot(dx,dz);
      const angle=Math.atan2(-dx,-dz),diff=Math.atan2(Math.sin(angle-p.yaw),Math.cos(angle-p.yaw));
      if(dist<best && Math.abs(diff)<0.95){target=other;best=dist;}
    }
    if(target){
      target.hp-=34;
      io.emit("hit",{target:target.id,hp:Math.max(0,target.hp),attacker:p.id});
      if(target.hp<=0){
        p.kills++; target.deaths++;
        io.emit("feed",{text:`${p.name}  ⚔  ${target.name}`});
        setTimeout(()=>{const t=players.get(target.id);if(t){Object.assign(t,spawn(),{name:t.name,id:t.id,kills:t.kills,deaths:t.deaths});io.to(t.id).emit("respawn",t);io.emit("playerMoved",{id:t.id,x:t.x,z:t.z,yaw:t.yaw,hp:t.hp});}},2200);
      }
      io.emit("stats",[...players.values()].map(({id,name,hp,kills,deaths,team})=>({id,name,hp,kills,deaths,team})));
    }
  });
  socket.on("disconnect",()=>{players.delete(socket.id);io.emit("playerLeft",socket.id);});
});
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`Kanlı Kurultay Arena running at http://localhost:${PORT}`));