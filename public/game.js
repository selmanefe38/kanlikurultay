import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
const $=s=>document.querySelector(s), login=$("#login"), game=$("#game"), canvasHost=$("#gameCanvas");
const socket=io(); let myId=null, me=null, running=false, yaw=0, pitch=-.12, keys={}, lastMove=0, swingUntil=0, swingCooldown=0, remote={}, meshes={}, localMesh, sword, camera, scene, renderer;
const mat=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness});
const stone=mat(0x71695a), darkStone=mat(0x393a36), wood=mat(0x4b3323), metal=mat(0x9ca3a8,.35), gold=mat(0xc49b51,.4);
function createArena(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x9ba7a7);scene.fog=new THREE.Fog(0x9ba7a7,26,68);
 camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,100); renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:"low-power"});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=false;canvasHost.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xe4e6db,0x393027,2));const sun=new THREE.DirectionalLight(0xffe1b1,2.1);sun.position.set(-8,16,5);scene.add(sun);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(22,64),mat(0x887b65));floor.rotation.x=-Math.PI/2;floor.position.y=-.06;scene.add(floor);
 const ring=new THREE.Mesh(new THREE.RingGeometry(19.5,20.1,64),gold);ring.rotation.x=-Math.PI/2;ring.position.y=.015;scene.add(ring);
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,x=Math.cos(a)*21,z=Math.sin(a)*21;const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.65,.8,5,6),darkStone);pillar.position.set(x,2.5,z);scene.add(pillar);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,.35,6),stone);cap.position.set(x,5.1,z);scene.add(cap);}
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const x=Math.cos(a)*14,z=Math.sin(a)*14;const block=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.4,1.2),stone);block.position.set(x,.7,z);block.rotation.y=-a;scene.add(block);}
 // Banners and torches give the arena a recognizable silhouette.
 for(let i=0;i<4;i++){let a=i*Math.PI/2,x=Math.cos(a)*17,z=Math.sin(a)*17;const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,4,6),wood);pole.position.set(x,2,z);scene.add(pole);const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.6),mat(i%2?0x873f36:0x294d65));flag.position.set(x,3.1,z);flag.rotation.y=-a;scene.add(flag);}
 createFighter(true);camera.position.set(0,1.65,0);
 window.addEventListener("resize",resize);renderer.domElement.addEventListener("click",()=>{if(running)renderer.domElement.requestPointerLock?.();});
 document.addEventListener("pointerlockchange",()=>{});
 document.addEventListener("mousemove",e=>{if(running&&document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0024;pitch=Math.max(-.55,Math.min(.35,pitch-e.movementY*.0018));}});
 document.addEventListener("keydown",e=>{keys[e.code]=true;if(["Space","ArrowUp","ArrowDown"].includes(e.code))e.preventDefault();if(e.code==="Escape"&&running&&document.pointerLockElement)document.exitPointerLock();});
 document.addEventListener("keyup",e=>keys[e.code]=false);
 renderer.domElement.addEventListener("mousedown",e=>{if(e.button===0)attack();});
 renderer.setAnimationLoop(tick);
}
function createFighter(local=false,team="BLUE"){
 const root=new THREE.Group();const armor=mat(team==="RED"?0x783d36:0x3e6077), skin=mat(0xb58e6b), cloth=mat(team==="RED"?0x4e2421:0x1f3546);
 const torso=new THREE.Mesh(new THREE.BoxGeometry(.62,.72,.34),armor);torso.position.y=1.2;root.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.22,8,7),skin);head.position.y=1.76;root.add(head);
 const helm=new THREE.Mesh(new THREE.SphereGeometry(.245,8,6,0,Math.PI*2,0,Math.PI*.62),metal);helm.position.y=1.83;root.add(helm);
 const skirt=new THREE.Mesh(new THREE.BoxGeometry(.65,.38,.4),cloth);skirt.position.y=.78;root.add(skirt);
 for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.2,.58,.22),darkStone);leg.position.set(side*.19,.35,0);root.add(leg);const arm=new THREE.Mesh(new THREE.BoxGeometry(.2,.58,.22),armor);arm.position.set(side*.43,1.23,0);arm.rotation.z=side*.12;root.add(arm);}
 const blade=new THREE.Group();const hilt=new THREE.Mesh(new THREE.BoxGeometry(.08,.34,.08),wood);hilt.position.y=-.25;blade.add(hilt);const guard=new THREE.Mesh(new THREE.BoxGeometry(.35,.07,.1),gold);guard.position.y=-.04;blade.add(guard);const edge=new THREE.Mesh(new THREE.BoxGeometry(.11,.8,.045),metal);edge.position.y=.39;blade.add(edge);blade.position.set(.52,1.25,-.05);blade.rotation.z=-.35;root.add(blade);
 scene.add(root);if(local){localMesh=root;sword=blade;}return root;
}
function resize(){if(!renderer)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
function addRemote(p){if(!scene||p.id===myId)return;remote[p.id]=p;if(!meshes[p.id])meshes[p.id]=createFighter(false,p.team);meshes[p.id].position.set(p.x,0,p.z);meshes[p.id].rotation.y=p.yaw;}
function showToast(t){const el=$("#toast");el.textContent=t;el.style.opacity=1;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.style.opacity=0,2600);}
function updateList(list){$("#onlineCount").textContent=`${list.length} SAVAŞÇI`;$("#playersList").innerHTML=list.sort((a,b)=>b.kills-a.kills).map(p=>`<div class="player-row"><i class="dot ${p.team==="RED"?"red":""}"></i><span class="player-name">${escapeHtml(p.name)}${p.id===myId?" (SEN)":""}</span><span class="kills">${p.kills||0}</span></div>`).join("");}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function attack(){if(!running||Date.now()<swingCooldown||me?.hp<=0)return;swingCooldown=Date.now()+650;swingUntil=performance.now()+260;socket.emit("attack");}
function tick(t){if(!renderer||!running){if(renderer)renderer.render(scene,camera);return;}
 const speed=keys.ShiftLeft?7.1:4.6,dt=Math.min(.04,(t-(tick.last||t))/1000);tick.last=t;
 const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),side=(keys.KeyD?1:0)-(keys.KeyA?1:0);
 const fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);
 if(me&&me.hp>0){me.x=Math.max(-18.5,Math.min(18.5,me.x+(fx*forward+rx*side)*speed*dt));me.z=Math.max(-18.5,Math.min(18.5,me.z+(fz*forward+rz*side)*speed*dt));localMesh.position.set(me.x,0,me.z);localMesh.rotation.y=yaw;camera.position.set(me.x,1.58,me.z);camera.rotation.order="YXZ";camera.rotation.set(pitch,yaw,0);
 if(t-lastMove>65){socket.emit("move",{x:me.x,z:me.z,yaw});lastMove=t;}}
 if(sword){const active=t<swingUntil;sword.rotation.z=active?-.35-Math.sin((swingUntil-t)/260*Math.PI)*1.8:-.35;}
 for(const [id,p] of Object.entries(remote)){const m=meshes[id];if(m){m.position.x+=(p.x-m.position.x)*.35;m.position.z+=(p.z-m.position.z)*.35;m.rotation.y=p.yaw;}}
 renderer.render(scene,camera);
}
function enter(){const name=$("#nickname").value.trim()||"Gladiator";$("#enter").disabled=true;$("#enter").textContent="BAĞLANIYOR...";if(!scene)createArena();login.classList.add("hidden");game.classList.remove("hidden");running=true;me={x:0,z:0,hp:100,kills:0,deaths:0};socket.emit("join",name);showToast("Kılıcını kuşan. Rakibine yaklaş ve sol tıkla saldır.");}
$("#enter").addEventListener("click",enter);$("#nickname").addEventListener("keydown",e=>{if(e.key==="Enter")enter();});
$("#leave").addEventListener("click",()=>{running=false;document.exitPointerLock?.();game.classList.add("hidden");login.classList.remove("hidden");$("#enter").disabled=false;$("#enter").innerHTML='ARENAYA GİR <span>→</span>';});
socket.on("joined",data=>{myId=data.id;const self=data.players.find(p=>p.id===myId);if(self){me=self;localMesh.position.set(me.x,0,me.z);}data.players.forEach(addRemote);updateList(data.players);});
socket.on("playerJoined",p=>{addRemote(p);showToast(`${p.name} arenaya katıldı.`);socket.emit("move",{x:me?.x||0,z:me?.z||0,yaw});});
socket.on("playerMoved",p=>{if(p.id===myId){if(me){me.hp=p.hp??me.hp;}return;}if(remote[p.id])Object.assign(remote[p.id],p);else addRemote(p);});
socket.on("playerLeft",id=>{delete remote[id];if(meshes[id]){scene?.remove(meshes[id]);delete meshes[id];}showToast("Bir savaşçı arenadan ayrıldı.");});
socket.on("hit",d=>{if(d.target===myId&&me){me.hp=d.hp;$("#hpText").textContent=`${d.hp} / 100`;$("#hpBar").style.width=d.hp+"%";if(d.hp<=0){$("#death").classList.remove("hidden");showToast("Yenildin. Yeniden doğuş bekleniyor...");}}if(remote[d.target])remote[d.target].hp=d.hp;});
socket.on("respawn",p=>{if(p.id===myId){me=p;localMesh.position.set(p.x,0,p.z);$("#death").classList.add("hidden");$("#hpText").textContent="100 / 100";$("#hpBar").style.width="100%";showToast("Tekrar savaşa dön!");}else addRemote(p);});
socket.on("stats",updateList);socket.on("feed",d=>{const el=document.createElement("div");el.textContent=d.text;$("#feed").prepend(el);setTimeout(()=>el.remove(),4500);});
