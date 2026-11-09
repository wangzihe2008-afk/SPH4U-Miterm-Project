/* Behind the Web — SPH4U interactive physics companion.
   Works offline. No trackers, databases, APIs, or third-party libraries.
   All movie and model topics are restricted to the five group-selected scenes. */
'use strict';

const PI = Math.PI, g = 9.81;
const scenes = [
  {id:'ferry',no:'01',title:'Staten Island Ferry',short:'Ferry Rescue',subtitle:'Can the web strands keep both halves together?',tag:'Forces + Material Physics',topics:['Tension','Elastic Energy','Stress'],color:'#ec4c57',
   quote:'A strong web is not enough. Its angle, thickness, and attachment matter.',
   limit:'This treats each ferry half as a horizontal load. Real hull forces, buoyancy, and uneven strand loading are not modeled.',
   source:['Team ferry analysis: 200 kN separating force per half and 10 strands per half are assumptions.','Natural spider silk representative parameters: Young’s modulus 8.0 GPa and strength 932 MPa.'],
   links:[['Spider silk material study','https://pmc.ncbi.nlm.nih.gov/articles/PMC7355793/']]},
  {id:'vulture',no:'02',title:'Vulture Drop',short:'Vulture Drop',subtitle:'How does an open parachute change Peter’s fall?',tag:'Kinematics + Air Resistance',topics:['Drag','Terminal Speed','Momentum'],color:'#64d1db',
   quote:'Drag grows with the square of speed, so a parachute changes the whole motion.',
   limit:'The descent curve assumes an already-open parachute starting from rest. In the film, deployment follows a brief free fall; opening-force estimates use a separate simplified impulse model.',
   source:['Team model: 64 kg, parachute diameter 7.0 m, Cd = 1.5, ρ = 1.225 kg/m³.','1,000 m drop height is a team modeling assumption, not a film measurement.'],links:[]},
  {id:'laser',no:'03',title:'Alien Weapon',short:'Alien Weapon',subtitle:'How much thermal power would a brick-wall cut require?',tag:'Thermal Energy + Power',topics:['Heat Capacity','Fusion','Power'],color:'#c997ff',
   quote:'A short cut through brick can imply an enormous rate of energy transfer.',
   limit:'The beam, cut shape, heating uniformity, ceramic properties, and assumed melting process are simplified. This is an energy-budget estimate, not a verified weapon specification.',
   source:['Team measurements: 0.55491 m² cut area, 92 mm wall thickness, and 2.87 s beam duration.','Team research assumptions: ρbrick = 1,920 kg/m³, c = 840 J/(kg·K), initial temperature 25°C, melting temperature 1,100°C, latent heat 250 kJ/kg.'],
   links:[['Specific heat reference','https://www.engineeringtoolbox.com/specific-heat-capacity-d_391.html'],['Ceramic properties reference','https://www.engineeringtoolbox.com/ceramics-properties-d_1227.html']]},
  {id:'elevator',no:'04',title:'Elevator Rescue',short:'Elevator Rescue',subtitle:'Can an elastic web stop the falling elevator safely?',tag:'Energy + Damping',topics:['Work–Energy','Spring Force','Damping'],color:'#f7bf64',
   quote:'Stopping the elevator is not the hard part. Stopping it gently is.',
   limit:'The simple spring calculation fixes stopping distance and ignores detailed motion. Critical damping is an independent illustrative extension; switching it on does not solve a fully coupled spring–damper trajectory.',
   source:['Team assumed mass 1,500 kg, initial fall 10 m, web stretch 2 m, and 30 kJ optional dissipation.','Critical damping model: ccrit = 2√(mk), with damping force c·v.'],
   links:[['University physics reference — OpenStax','https://openstax.org/details/books/university-physics-volume-1']]},
  {id:'shocker',no:'05',title:'Shocker Battle',short:'Shocker Battle',subtitle:'Five physics moments, one fight.',tag:'Momentum + Torque',topics:['Impulse','Rotation','Friction'],color:'#85b8ff',
   quote:'Force, impact time, and where the force acts can change the outcome.',
   limit:'The source report identifies five moments but does not provide measured numeric inputs. The calculator uses explicitly assumed values to demonstrate its equations, not to claim scene-accurate measurements.',
   source:['Team clip event windows: lockers 0:01–0:10; blast 0:13–0:16; bus 0:46–0:55; webbing 1:05–1:12; car 1:33–1:43.','Numerical speed, impact time, bus force, Shocker mass, and turn radius are interactive assumptions.'],
   links:[['Team-selected Shocker clip','https://www.youtube.com/watch?v=tu6FDI4JBDY']]}
];
const byId = Object.fromEntries(scenes.map(s=>[s.id,s]));
const controlSets = {
 ferry:[
  {key:'force',label:'Separating force / half',unit:'kN',min:80,max:400,step:10},
  {key:'webs',label:'Webs / ferry half',unit:'strands',min:4,max:20,step:1},
  {key:'angle',label:'Web angle',unit:'°',min:0,max:75,step:5},
  {key:'diameter',label:'Equivalent web diameter',unit:'mm',min:3,max:16,step:.5}
 ],
 vulture:[
  {key:'mass',label:'Peter’s mass',unit:'kg',min:40,max:95,step:1},
  {key:'diameter',label:'Parachute diameter',unit:'m',min:3,max:9,step:.5},
  {key:'cd',label:'Drag coefficient',unit:'',min:.8,max:2,step:.1},
  {key:'height',label:'Assumed fall height',unit:'m',min:80,max:1000,step:20}
 ],
 laser:[
  {key:'area',label:'Cut area',unit:'m²',min:.15,max:1.1,step:.01},
  {key:'thickness',label:'Brick thickness',unit:'mm',min:46,max:200,step:2},
  {key:'duration',label:'Beam duration',unit:'s',min:.5,max:7,step:.01},
  {key:'melting',label:'Target temperature',unit:'°C',min:900,max:1400,step:25}
 ],
 elevator:[
  {key:'mass',label:'Elevator + passengers',unit:'kg',min:800,max:2200,step:50},
  {key:'drop',label:'Free-fall distance',unit:'m',min:3,max:20,step:.5},
  {key:'stretch',label:'Web stopping distance',unit:'m',min:1,max:5,step:.25},
  {key:'loss',label:'Energy dissipated',unit:'kJ',min:0,max:60,step:5}
 ]
};
const shockerModes = {
 lockers:{label:'Lockers',sub:'Peter runs into metal lockers.',controls:[{key:'mass',label:'Peter’s mass',unit:'kg',min:50,max:90,step:1},{key:'speed',label:'Impact speed',unit:'m/s',min:2,max:15,step:.5},{key:'stop',label:'Stopping time',unit:'s',min:.05,max:.75,step:.01}]},
 blast:{label:'Blast',sub:'The Shocker sends Peter backward.',controls:[{key:'mass',label:'Peter’s mass',unit:'kg',min:50,max:90,step:1},{key:'speed',label:'Speed after blast',unit:'m/s',min:2,max:18,step:.5},{key:'stop',label:'Blast duration',unit:'s',min:.05,max:.8,step:.01}]},
 bus:{label:'Bus',sub:'A force rotates or moves the bus.',controls:[{key:'force',label:'Applied force',unit:'kN',min:1,max:30,step:.5},{key:'lever',label:'Moment arm',unit:'m',min:.25,max:3,step:.25},{key:'angle',label:'Force angle',unit:'°',min:10,max:90,step:5}]},
 web:{label:'Webbing',sub:'Webs restrain the Shocker.',controls:[{key:'mass',label:'Assumed Shocker mass',unit:'kg',min:55,max:110,step:1},{key:'strands',label:'Supporting strands',unit:'strands',min:1,max:6,step:1},{key:'angle',label:'Web angle from vertical',unit:'°',min:0,max:65,step:5}]},
 car:{label:'Car turn',sub:'Peter rides on a turning vehicle.',controls:[{key:'mass',label:'Peter’s mass',unit:'kg',min:50,max:90,step:1},{key:'speed',label:'Car speed',unit:'m/s',min:3,max:25,step:.5},{key:'radius',label:'Turn radius',unit:'m',min:8,max:70,step:1}]}
};
const state={
 active:'home',values:{
  ferry:{force:200,webs:10,angle:30,diameter:10},
  vulture:{mass:64,diameter:7,cd:1.5,height:1000},
  laser:{area:.55491,thickness:92,duration:2.87,melting:1100},
  elevator:{mass:1500,drop:10,stretch:2,loss:0},
  shocker:{lockers:{mass:64,speed:8,stop:.12},blast:{mass:64,speed:10,stop:.25},bus:{force:10,lever:1.5,angle:90},web:{mass:75,strands:2,angle:25},car:{mass:64,speed:12,radius:25}}
 },mode:'lockers',step:0,phase:0,playing:false,lastTime:0,raf:0,sourceOpen:false,clips:{},showVideo:false};

const $=id=>document.getElementById(id);
const round=(x,n=1)=>Number.isFinite(x)?x.toLocaleString('en-US',{maximumFractionDigits:n,minimumFractionDigits:n}):'—';
const fmt=x=>Number.isFinite(x)?Number(x.toFixed(5)).toString():'—';
const rad=x=>x*PI/180;
const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
const htmlEscape=str=>String(str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const tag=(x)=>`<span class="pill">${htmlEscape(x)}</span>`;
const metric=(label,num,unit,note='')=>({label,num,unit,note});

function calcFerry(v){
 const F=v.force*1000,angle=rad(v.angle),n=v.webs,d=v.diameter/1000,area=PI*d*d/4,E=8e9,limit=932e6;
 const T=F/(n*Math.cos(angle)),stress=T/area,extension=T*15/(E*area),k=E*area/15,energy=.5*T*extension,total=2*n*energy;
 const critical=Math.sqrt(4*T/(PI*limit))*1000;
 return {
  metrics:[metric('Tension / web',round(T/1000,1),'kN','opposes separation'),metric('Web stress',round(stress/1e6,0),'MPa','force per area'),metric('Web extension',round(extension,2),'m','linear-elastic model'),metric('Stored energy',round(total/1000,1),'kJ','all strands')],
  status:stress>limit?'fail':'safe',statusName:stress>limit?'ABOVE STRENGTH LIMIT':'BELOW STRENGTH LIMIT',
  statusText:`Minimum effective diameter: ${round(critical,2)} mm. Model limit: 932 MPa.`,
  steps:[
   {title:'Resolve the horizontal pull',math:'Fₓ = T cos(θ)',desc:'Only the component along the ferry separation direction resists the outward load.'},
   {title:'Find the tension per strand',math:`T = ${round(F,0)} / (${n} × cos ${fmt(v.angle)}°)`,desc:`T = ${round(T,0)} N, assuming equal load sharing.`},
   {title:'Cross-section and stress',math:`σ = T / [π(${round(d/2,4)} m)²]`,desc:`Applied stress = ${round(stress/1e6,1)} MPa.`},
   {title:'University physics: Young’s modulus',math:'ε = σ / E ; ΔL = εL₀',desc:`E = 8.0 GPa; ΔL = ${round(extension,3)} m.`},
   {title:'Elastic energy in the web system',math:'Eₑ = ½ k(ΔL)² ; k = EA / L₀',desc:`Total for ${2*n} webs = ${round(total/1000,1)} kJ.`}
  ],T,stress,extension,k,energy,total,critical,angle:rad(v.angle),angleDeg:v.angle,diameter:v.diameter
 };
}
function logCosh(x){return Math.abs(x)+Math.log1p(Math.exp(-2*Math.abs(x)))-Math.log(2)}
function fallDistanceAt(t,vterm,k,m){return m/k*logCosh(g*t/vterm)}
function calcVulture(v){
 const rho=1.225,area=PI*Math.pow(v.diameter/2,2),k=.5*rho*v.cd*area,vt=Math.sqrt(v.mass*g/k);
 let hi=Math.max(1,v.height/vt+10),lo=0;
 for(let i=0;i<75;i++){let m=(lo+hi)/2;if(fallDistanceAt(m,vt,k,v.mass)<v.height)lo=m;else hi=m;}
 const t=(lo+hi)/2,vi=g*2.5,impulse=v.mass*Math.abs(vi-vt),forceNet=impulse/.44;
 return {metrics:[metric('Terminal speed',round(vt,2),'m/s','fully open canopy'),metric('Descent time',round(t,1),'s','from rest, chute open'),metric('Drag at terminal',round(v.mass*g,1),'N','balances weight'),metric('Opening impulse',round(impulse,0),'N·s','2.5 s free fall assumed')],
  status:'neutral',statusName:'TWO DIFFERENT MODELS',statusText:'Descent time assumes the chute starts open; the impulse estimate uses 2.5 s before opening.',
  steps:[{title:'Calculate parachute area',math:'A = π(d/2)²',desc:`Area = ${round(area,2)} m² for a ${fmt(v.diameter)} m canopy.`},
   {title:'Quadratic drag coefficient',math:'k = ½ρCᴅA',desc:`k = ${round(k,2)} kg/m; Fᴅ = kv².`},
   {title:'Find terminal velocity',math:'vₜ = √(mg/k)',desc:`vₜ = ${round(vt,2)} m/s, where drag balances weight.`},
   {title:'University physics: descent with drag',math:'v(t) = vₜ tanh(gt/vₜ)',desc:`Solving the position model to ${round(v.height,0)} m gives ${round(t,1)} s.`},
   {title:'Separate opening-impulse estimate',math:'J = m(vf − vi)',desc:`With vi = 24.5 m/s and vf ≈ ${round(vt,2)} m/s, |J| ≈ ${round(impulse,0)} N·s. Average net force over 0.44 s ≈ ${round(forceNet,0)} N.`}],
  area,k,vt,t,impulse,forceNet};
}
function calcLaser(v){
 const density=1920,c=840,Lf=250000,initial=25;
 const volume=v.area*v.thickness/1000,mass=volume*density,delta=v.melting-initial,heat=mass*c*delta,melt=mass*Lf,total=heat+melt,power=total/v.duration;
 return {metrics:[metric('Material mass',round(mass,2),'kg','cut volume × density'),metric('Heat required',round(heat/1e6,1),'MJ','raise temperature'),metric('Fusion energy',round(melt/1e6,1),'MJ','illustrative melting'),metric('Beam power',round(power/1e6,2),'MW','total / duration')],
 status:'neutral',statusName:'IDEALIZED HEAT BUDGET',statusText:'No heat lost to surroundings; material heating and melting are assumed.',
 steps:[{title:'Calculate the removed volume',math:'V = A × thickness',desc:`V = ${round(volume,5)} m³.`},
 {title:'Estimate the brick mass',math:'m = ρV',desc:`m = ${round(mass,2)} kg, using 1,920 kg/m³.`},
 {title:'Heat the material',math:'Q₁ = mc(Tₘ − Tᵢ)',desc:`Q₁ = ${round(heat/1e6,2)} MJ from ${fmt(initial)}°C to ${fmt(v.melting)}°C.`},
 {title:'Add latent heat',math:'Q₂ = mLᶠ',desc:`Q₂ = ${round(melt/1e6,2)} MJ, with 250 kJ/kg assumed.`},
 {title:'Calculate average beam power',math:'P = (Q₁ + Q₂) / Δt',desc:`P = ${round(power/1e6,2)} MW for ${fmt(v.duration)} s.`}],volume,mass,heat,melt,total,power,heatFrac:heat/total};
}
function calcElevator(v){
 const mass=v.mass,drop=v.drop,x=v.stretch,loss=v.loss*1000,kin=mass*g*drop,energy=Math.max(1,mass*g*(drop+x)-loss),k=2*energy/x**2,peak=k*x,acc=(peak-mass*g)/mass,vin=Math.sqrt(2*g*drop),critical=2*Math.sqrt(mass*k),Fd=critical*vin,Ploss=critical*vin*vin,weight=mass*g;
 return {metrics:[metric('Incoming speed',round(vin,2),'m/s','after free fall'),metric('Stored web energy',round(energy/1000,1),'kJ','at first stop'),metric('Spring stiffness',round(k/1000,1),'kN/m','effective k'),metric('Peak force',round(peak/1000,1),'kN','at maximum stretch')],
  status:'neutral',statusName:'ENERGY IS NOT COMFORT',statusText:`Peak upward acceleration = ${round(acc,1)} m/s² in the elastic model.`,
  steps:[{title:'Speed before the web catches',math:'v = √(2gh)',desc:`v = ${round(vin,2)} m/s after a ${fmt(drop)} m drop.`},
  {title:'Energy available at the first stop',math:'Eₑ = mg(h + x) − Eₗₒₛₛ',desc:`Stored energy = ${round(energy/1000,1)} kJ; loss = ${fmt(v.loss)} kJ.`},
  {title:'Calculate web stiffness',math:'k = 2Eₑ / x²',desc:`k = ${round(k,0)} N/m.`},
  {title:'Find the peak tension and acceleration',math:'Fₘₐₓ = kx ; a = (Fₘₐₓ − mg)/m',desc:`Peak tension = ${round(peak,0)} N; acceleration = ${round(acc,1)} m/s² upward.`},
  {title:'University extension: damping',math:'cᶜʳⁱᵗ = 2√(mk) ; Fᴅ = cv',desc:`Critical coefficient = ${round(critical,0)} N·s/m; initial example Fᴅ ≈ ${round(Fd/1000,1)} kN.`}],mass,drop,x,loss,kin,energy,k,peak,acc,vin,critical,Fd,Ploss,weight};
}
function calcShocker(v,mode){
 const names={lockers:'Locker impact',blast:'Shock blast',bus:'Bus rotation',web:'Web restraint',car:'Car turn'};
 if(mode==='lockers'){
  const p=v.mass*v.speed,F=p/v.stop,KE=.5*v.mass*v.speed*v.speed,a=v.speed/v.stop;
  return {metrics:[metric('Momentum change',round(p,0),'N·s','coming to rest'),metric('Average force',round(F/1000,2),'kN','lockers on Peter'),metric('Kinetic energy',round(KE/1000,2),'kJ','before impact'),metric('Deceleration',round(a,1),'m/s²','magnitude')],status:'neutral',statusName:'SHORTER STOP → LARGER FORCE',statusText:'Assumed speed and collision time; not measured from the clip.',steps:[{title:'Initial momentum',math:'pᵢ = mv',desc:`pᵢ = ${round(p,0)} kg·m/s.`},{title:'Impulse required to stop',math:'J = Δp = 0 − mv',desc:`Impulse magnitude = ${round(p,0)} N·s.`},{title:'Average collision force',math:'Fₐᵥ₉ = |Δp| / Δt',desc:`Fₐᵥ₉ = ${round(F,0)} N.`},{title:'Kinetic energy at impact',math:'KE = ½mv²',desc:`KE = ${round(KE,0)} J.`}],mode,names};
 }
 if(mode==='blast'){
  const p=v.mass*v.speed,F=p/v.stop,KE=.5*v.mass*v.speed*v.speed;
  return {metrics:[metric('Blast impulse',round(p,0),'N·s','from rest'),metric('Average net force',round(F/1000,2),'kN','during blast'),metric('Energy gained',round(KE/1000,2),'kJ','kinetic'),metric('Acceleration',round(v.speed/v.stop,1),'m/s²','average')],status:'neutral',statusName:'IMPULSE CHANGES MOMENTUM',statusText:'The Shocker experiences an opposing reaction force, possibly transferred to his support.',steps:[{title:'Start from rest',math:'vᵢ = 0 ; vᶠ = selected speed',desc:'The model only describes the push during the blast.'},{title:'Momentum transfer',math:'J = m(vᶠ − vᵢ)',desc:`J = ${round(p,0)} N·s.`},{title:'Average force',math:'Fₐᵥ₉ = J / Δt',desc:`Fₐᵥ₉ = ${round(F,0)} N.`},{title:'Energy change',math:'ΔKE = ½mv²',desc:`The blast transfers ${round(KE,0)} J of kinetic energy.`}],mode,names};
 }
 if(mode==='bus'){
  const F=v.force*1000,tau=F*v.lever*Math.sin(rad(v.angle));
  return {metrics:[metric('Torque',round(tau/1000,2),'kN·m','turning tendency'),metric('Applied force',round(F/1000,1),'kN','illustrative'),metric('Lever arm',round(v.lever,2),'m','from rotation axis'),metric('Angle factor',round(Math.sin(rad(v.angle)),2),'','sin θ')],status:'neutral',statusName:'OFF-CENTER FORCE CREATES TORQUE',statusText:'A torque value alone cannot predict bus rotation without its moment of inertia.',steps:[{title:'Identify the moment arm',math:'r = distance to the rotation axis',desc:`Chosen lever arm = ${round(v.lever,2)} m.`},{title:'Resolve the perpendicular force',math:'F⊥ = F sin(θ)',desc:`F⊥ = ${round(F*Math.sin(rad(v.angle))/1000,2)} kN.`},{title:'Compute the torque',math:'τ = rF sin(θ)',desc:`τ = ${round(tau,0)} N·m.`},{title:'University extension',math:'τ = Iα',desc:'Angular acceleration requires the bus moment of inertia I, which this report does not specify.'}],mode,names};
 }
 if(mode==='web'){
  const weight=v.mass*g,T=weight/(v.strands*Math.cos(rad(v.angle)));
  return {metrics:[metric('Weight',round(weight,0),'N','assumed mass'),metric('Tension / strand',round(T,0),'N','symmetric support'),metric('Vertical sum',round(v.strands*T*Math.cos(rad(v.angle)),0),'N','balances weight'),metric('Web angle',round(v.angle,0),'°','from vertical')],status:'neutral',statusName:'IDEAL STATIC EQUILIBRIUM',statusText:'This assumes the strands support the person vertically; moving restraints can require much larger impulse forces.',steps:[{title:'Weight acting downward',math:'Fg = mg',desc:`Fg = ${round(weight,0)} N.`},{title:'Support from angled webs',math:'ΣFᵧ = nT cos(θ) − mg = 0',desc:'Horizontal components are assumed to cancel.'},{title:'Solve for tension',math:'T = mg / [n cos(θ)]',desc:`T = ${round(T,0)} N per strand.`}],mode,names};
 }
 const ac=v.speed*v.speed/v.radius,F=v.mass*ac,mu=ac/g;
 return {metrics:[metric('Centripetal accel.',round(ac,2),'m/s²','during turn'),metric('Sideways force',round(F,0),'N','on Peter'),metric('Minimum friction μ',round(mu,2),'','ideal level surface'),metric('Turn radius',round(v.radius,0),'m','assumed')],status:'neutral',statusName:'FRICTION MUST SUPPLY THE TURN',statusText:'If the available grip is below the required friction coefficient, Peter would slide.',steps:[{title:'Set the turning path',math:'a꜀ = v² / r',desc:`Centripetal acceleration = ${round(ac,2)} m/s².`},{title:'Force needed on Peter',math:'F꜀ = mv² / r',desc:`Required lateral force = ${round(F,0)} N.`},{title:'Check available friction',math:'μₘᵢₙ = v² / (rg)',desc:`Minimum friction coefficient ≈ ${round(mu,2)} for a level surface.`}],mode:'car',names};
}
function compute(){return state.active==='shocker'?calcShocker(state.values.shocker[state.mode],state.mode):({ferry:calcFerry,vulture:calcVulture,laser:calcLaser,elevator:calcElevator})[state.active](state.values[state.active]);}
function currentControls(){return state.active==='shocker'?shockerModes[state.mode].controls:controlSets[state.active];}
function currentValues(){return state.active==='shocker'?state.values.shocker[state.mode]:state.values[state.active];}

function sceneDiagram(type,result,phase=0,small=false){
 const scene=byId[type],color=scene.color;
 const defs=`<defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#24506a"/><stop offset="1" stop-color="#091927"/></linearGradient><linearGradient id="hull" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#657889"/><stop offset="1" stop-color="#233747"/></linearGradient><linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#9739ed"/><stop offset=".5" stop-color="#f5d5ff"/><stop offset="1" stop-color="#fc7ffc"/></linearGradient><marker id="arrowRed" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 6,3 0,6" fill="#ff6775"/></marker><marker id="arrowBlue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 6,3 0,6" fill="#67dee4"/></marker><filter id="glow"><feGaussianBlur stdDeviation="6"/></filter></defs>`;
 const base=type==='ferry'?drawFerry(result,phase):type==='vulture'?drawVulture(result,phase):type==='laser'?drawLaser(result,phase):type==='elevator'?drawElevator(result,phase):drawShocker(result,phase);
 return `<svg viewBox="0 0 900 500" aria-label="Interactive schematic for ${htmlEscape(scene.title)}" role="img" preserveAspectRatio="xMidYMid meet">${defs}<g opacity=".28"><path d="M32 38h55M32 38v55M868 38h-55M868 38v55M32 462h55M32 462v-55M868 462h-55M868 462v-55" stroke="#7290a8" stroke-width="2" fill="none"/></g>${base}</svg>`;
}
function drawFerry(r,p){
 const fail=r.status==='fail',sep=(fail?40:10)*p;
 const left=-(sep),right=sep, webColor=fail?'#ff6477':'#9fcdd9';
 const fan = 9 + r.angleDeg*.38;
 let strands='';for(let i=0;i<5;i++){const y=252+(i-2)*fan;strands+=`<line x1="${397+left}" y1="${y}" x2="445" y2="252" stroke="${webColor}" stroke-width="${Math.max(1.2,Math.min(5.5,r.diameter/3))}" ${fail?'stroke-dasharray="8 5"':''} opacity=".92"/><line x1="455" y1="252" x2="${503+right}" y2="${y}" stroke="${webColor}" stroke-width="${Math.max(1.2,Math.min(5.5,r.diameter/3))}" ${fail?'stroke-dasharray="8 5"':''} opacity=".92"/>`}
 return `<rect x="0" y="356" width="900" height="144" fill="url(#sea)"/><g opacity=".3" stroke="#6fcbdc" fill="none"><path d="M0 378Q40 362 80 378t80 0t80 0t80 0t80 0t80 0t80 0t80 0t80 0t80 0t80 0"/><path d="M0 419Q45 403 90 419t90 0t90 0t90 0t90 0t90 0t90 0t90 0"/></g>
 <g transform="translate(${left} 0)"><path d="M100 175L340 175L397 200L397 316L340 344L100 344L76 308L76 212Z" fill="url(#hull)" stroke="#8daabb" stroke-width="3"/><path d="M97 208h290M90 304h298" stroke="#a6bac4" stroke-width="3"/><rect x="142" y="136" width="151" height="38" rx="5" fill="#263e52" stroke="#8ea7b4" stroke-width="2"/>${[125,186,247,307].map(x=>`<rect x="${x}" y="229" width="31" height="25" rx="3" fill="#9fc5cf" opacity=".58"/>`).join('')}</g>
 <g transform="translate(${right} 0)"><path d="M503 200L560 175L800 175L824 212L824 308L800 344L560 344L503 316Z" fill="url(#hull)" stroke="#8daabb" stroke-width="3"/><path d="M510 208h290M510 304h300" stroke="#a6bac4" stroke-width="3"/><rect x="608" y="136" width="151" height="38" rx="5" fill="#263e52" stroke="#8ea7b4" stroke-width="2"/>${[542,603,664,725].map(x=>`<rect x="${x}" y="229" width="31" height="25" rx="3" fill="#9fc5cf" opacity=".58"/>`).join('')}</g>
 ${strands}<circle cx="450" cy="243" r="11" fill="#ec4c57"/><path d="M450 253v25m0-19l-20 11m20-11l20 11m-20 8l-17 24m17-24l17 24" stroke="#ec4c57" stroke-width="9" stroke-linecap="round" fill="none"/>
 <path d="M115 274h-73M785 274h73" stroke="#ff6775" stroke-width="5" marker-end="url(#arrowRed)"/><path d="M397 193h47M503 193h-47" stroke="#67dee4" stroke-width="4" marker-end="url(#arrowBlue)"/>
 <text x="71" y="251" fill="#ff929a" font-size="16" font-family="monospace">Fsep</text><text x="785" y="251" fill="#ff929a" font-size="16" font-family="monospace">Fsep</text><text x="450" y="106" fill="#adc4d4" font-size="14" font-family="monospace" text-anchor="middle">TENSION VS. SEPARATION</text>
 <text x="450" y="392" fill="${fail?'#ff8393':'#8ce4bb'}" font-size="15" font-family="monospace" text-anchor="middle">${fail?'STRESS LIMIT EXCEEDED':'WITHIN SELECTED MATERIAL LIMIT'}</text>`;
}
function drawVulture(r,p){
 const y=140+235*p,canopy=65+r.area*1.0,x=450,wing=180;
 return `<g opacity=".23" stroke="#8bc4d7" fill="none"><path d="M58 110q75-39 149 0t150 0t150 0t150 0t150 0"/><path d="M60 380q95-30 190 0t190 0t190 0t190 0"/></g><g transform="translate(445 72)" fill="none" stroke="#7c95a8" stroke-width="7"><path d="M-15 0q-105-62-175 2l155 10M15 0q105-62 175 2L35 12"/><path d="M-35 0h70l-13 21h-44z" fill="#263c4d"/></g>
 <path d="M450 109V415" stroke="#50798f" stroke-width="2" stroke-dasharray="8 12"/><g transform="translate(0 ${y-140})"><path d="M${x-canopy} 124 Q${x} ${35-Math.min(24,r.area/3)} ${x+canopy} 124" fill="rgba(236,76,87,.44)" stroke="#ff7f8a" stroke-width="6"/><path d="M${x-canopy} 124L${x-10} 202M${x+canopy} 124L${x+10} 202M450 100L450 201" stroke="#bdd3dd" stroke-width="2"/><circle cx="450" cy="213" r="12" fill="#f26370"/><path d="M450 225v35m0-24l-25 15m25-15l25 15m-25 9l-17 28m17-28l17 28" stroke="#f26370" stroke-width="9" stroke-linecap="round"/></g>
 <path d="M686 160v150" stroke="#67dee4" stroke-width="4" marker-end="url(#arrowBlue)"/><text x="705" y="236" font-size="15" font-family="monospace" fill="#b4e6e8">v = ${round(r.vt,2)} m/s</text><path d="M218 326v-130" stroke="#ff6775" stroke-width="4" marker-end="url(#arrowRed)"/><text x="169" y="263" fill="#ff9aa3" font-family="monospace" font-size="15">DRAG</text><text x="450" y="447" font-family="monospace" text-anchor="middle" font-size="16" fill="#a6bdce">TERMINAL VELOCITY MODEL</text>`;
}
function drawLaser(r,p){
 let bricks='';for(let row=0;row<6;row++)for(let col=0;col<8;col++){const x=505+col*45+(row%2?-22:0),y=117+row*47;bricks+=`<rect x="${x}" y="${y}" width="42" height="44" rx="1" fill="${(row+col)%2?'#7b6675':'#946c7a'}" stroke="#413d50" stroke-width="1.4"/>`}
 const xx=520+240*p,cut=`M${xx} 164L${xx+42} 247L${xx} 330`;
 return `<rect x="499" y="94" width="401" height="308" fill="#3c3748"/>${bricks}<path d="M510 103v295" stroke="#e6a4c7" opacity=".35"/><path d="M135 244L${xx+35} 247" stroke="#b66dfd" stroke-width="24" opacity=".35" filter="url(#glow)"/><path d="M135 244L${xx+35} 247" stroke="url(#beam)" stroke-width="9"/><path d="${cut}" stroke="#f6b5fa" stroke-width="${3+7*p}" fill="none" opacity="${.35+.65*p}"/><circle cx="137" cy="244" r="23" fill="#282b4c" stroke="#df8ffa" stroke-width="4"/><path d="M45 280l80-30 0-23-80-26z" fill="#4a3d63" stroke="#b689d9" stroke-width="3"/><circle cx="${xx+35}" cy="247" r="15" fill="#f9e5ff" opacity=".85"/><circle cx="${xx+35}" cy="247" r="31" fill="#df6aff" opacity=".25"/>
 <text x="120" y="139" fill="#dcb7fd" font-family="monospace" font-size="16">BEAM DURATION</text><text x="120" y="160" fill="#f3e3fe" font-family="monospace" font-size="24">${round(r.power/1e6,1)} MW</text>
 <text x="110" y="412" fill="#8fabc2" font-family="monospace" font-size="13">HEATING</text><rect x="110" y="426" width="285" height="11" rx="3" fill="#354459"/><rect x="110" y="426" width="${285*r.heatFrac}" height="11" rx="3" fill="#bb78e9"/><rect x="${110+285*r.heatFrac}" y="426" width="${285*(1-r.heatFrac)}" height="11" rx="3" fill="#e99877"/><text x="395" y="453" text-anchor="end" fill="#a8b9c9" font-size="12" font-family="monospace">+ FUSION</text>`;
}
function drawElevator(r,p){
 const y=70+210*p,extend=25+150*p;
 return `<rect x="288" y="30" width="320" height="432" rx="5" fill="#111e2b" stroke="#446077" stroke-width="5"/><path d="M309 30v430M587 30v430" stroke="#58748b" stroke-width="6"/><path d="M365 35v395M530 35v395" stroke="#2c4255" stroke-width="2" stroke-dasharray="15 12"/>
 <g transform="translate(0 ${y})"><rect x="345" y="0" width="208" height="116" rx="7" fill="#3f5c72" stroke="#a5c2d4" stroke-width="4"/><rect x="370" y="19" width="162" height="58" rx="3" fill="#142d3e"/><path d="M451 20v55" stroke="#89a3af" stroke-width="3"/><path d="M385 89h126" stroke="#8fa8bb" stroke-width="3"/></g>
 <path d="M450 32L450 ${y-extend/4}" stroke="#b7d9e5" stroke-width="4" stroke-dasharray="9 6"/><path d="M450 ${y+122}v35" stroke="#ff7480" stroke-width="4" marker-end="url(#arrowRed)"/><path d="M450 ${Math.max(45,y-30)}v-25" stroke="#67dee4" stroke-width="4" marker-end="url(#arrowBlue)"/><text x="619" y="195" fill="#a8bbc9" font-family="monospace" font-size="15">m = ${round(r.mass,0)} kg</text><text x="619" y="219" fill="#a8bbc9" font-family="monospace" font-size="15">h = ${fmt(r.drop)} m</text><text x="619" y="243" fill="#a8bbc9" font-family="monospace" font-size="15">x = ${fmt(r.x)} m</text>
 <text x="280" y="220" fill="#83e1e0" font-family="monospace" font-size="15" text-anchor="end">WEB FORCE ↑</text><text x="280" y="254" fill="#ff939b" font-family="monospace" font-size="15" text-anchor="end">WEIGHT ↓</text><path d="M332 413h235" stroke="#789bb1" stroke-width="3" stroke-dasharray="8 8"/><text x="450" y="486" fill="#a6bdd0" font-family="monospace" font-size="14" text-anchor="middle">SPRING-ENERGY STOPPING MODEL</text>`;
}
function drawShocker(r,p){
 const mode=r.mode,orange='#f4a34b';
 if(mode==='bus')return `<rect x="170" y="165" width="560" height="185" rx="15" fill="#3d5972" stroke="#8faec5" stroke-width="5"/><rect x="214" y="189" width="480" height="77" rx="4" fill="#15293a"/><path d="M450 154v202" stroke="#9bb8c6" stroke-dasharray="8 8"/><path d="M605 92v96" stroke="#ff6775" stroke-width="5" marker-end="url(#arrowRed)"/><path d="M450 132h155" stroke="#67dee4" stroke-width="4" marker-end="url(#arrowBlue)"/><text x="515" y="121" fill="#b5e1e7" font-size="16" font-family="monospace">r</text><text x="621" y="139" fill="#ffacb5" font-size="16" font-family="monospace">F</text><text x="450" y="407" fill="#b9d0de" font-size="20" font-family="monospace" text-anchor="middle">τ = rF sin(θ)</text>`;
 if(mode==='car')return `<path d="M70 383H833" stroke="#90a7b7" stroke-width="4"/><rect x="277" y="240" width="340" height="109" rx="12" fill="#3e637c" stroke="#91b3ca" stroke-width="4"/><circle cx="345" cy="351" r="29" fill="#182534" stroke="#809aab" stroke-width="5"/><circle cx="560" cy="351" r="29" fill="#182534" stroke="#809aab" stroke-width="5"/><circle cx="450" cy="217" r="15" fill="${orange}"/><path d="M450 233v24m0-12l-22 7m22-7l22 7" stroke="${orange}" stroke-width="11" stroke-linecap="round"/><path d="M642 325Q780 320 780 179" fill="none" stroke="#67dee4" stroke-width="5" stroke-dasharray="10 9" marker-end="url(#arrowBlue)"/><path d="M450 191v-67" stroke="#ff6775" stroke-width="4" marker-end="url(#arrowRed)"/><text x="483" y="137" fill="#ff9cab" font-size="16" font-family="monospace">INERTIA</text><text x="684" y="386" fill="#a8c4d5" font-size="15" font-family="monospace">v² / r</text>`;
 if(mode==='web')return `<rect x="225" y="150" width="95" height="225" rx="10" fill="#53677a" stroke="#9fb7c8" stroke-width="4"/><rect x="576" y="150" width="95" height="225" rx="10" fill="#53677a" stroke="#9fb7c8" stroke-width="4"/><circle cx="450" cy="212" r="22" fill="${orange}"/><path d="M450 233v85m0-45l-54 18m54-18l54 18m-54 27l-35 51m35-51l35 51" stroke="${orange}" stroke-width="17" stroke-linecap="round"/><path d="M420 260L272 181M480 260L623 181" stroke="#bfe3e9" stroke-width="5"/><path d="M452 258v110" stroke="#ff6775" stroke-width="5" marker-end="url(#arrowRed)"/><text x="450" y="410" text-anchor="middle" fill="#c5d6e0" font-size="17" font-family="monospace">ΣFy = 0</text>`;
 const contact=mode==='lockers'?(530-40*p):650;
 return `<path d="M90 389H813" stroke="#869eae" stroke-width="4"/>${mode==='lockers'?`<rect x="570" y="126" width="170" height="261" fill="#3b536a" stroke="#88a3b6" stroke-width="4"/>${[0,1,2,3].map(i=>`<rect x="${582+i*39}" y="143" width="31" height="222" fill="#4e697b" stroke="#91b1c2"/><path d="M${590+i*39} 218h13" stroke="#a4bbc9"/>`).join('')}`:`<rect x="167" y="177" width="115" height="200" rx="9" fill="#3e5164" stroke="#8aa9bf" stroke-width="4"/><path d="M297 273h210" stroke="#9e73e7" stroke-width="12"/><path d="M295 273h215" stroke="#c1a6fa" stroke-width="5" stroke-dasharray="16 6"/>`}
 <g transform="translate(${mode==='lockers'?300+120*p:585+60*p} 0)"><circle cx="0" cy="265" r="23" fill="${orange}"/><path d="M0 287v53m0-30l-30 12m30-12l30 12m-30 17l-26 40m26-40l26 40" stroke="${orange}" stroke-width="17" stroke-linecap="round"/></g>
 <path d="M${mode==='lockers'?350+120*p:460} 225h70" stroke="#ff6775" stroke-width="5" marker-end="url(#arrowRed)"/><text x="450" y="124" fill="#b9d1df" font-size="19" font-family="monospace" text-anchor="middle">${mode==='lockers'?'IMPULSE · LOCKERS':'SHOCKER · IMPULSE'}</text>`;
}

function homeOrbit(){
 return `<svg viewBox="0 0 570 540" aria-label="Five connected physics cases" role="img"><defs><radialGradient id="core"><stop stop-color="#38566e"/><stop offset="1" stop-color="#0d1b2a"/></radialGradient></defs><circle cx="285" cy="260" r="200" fill="none" stroke="#3a647c" stroke-width="1" stroke-dasharray="8 11" opacity=".65"/><circle cx="285" cy="260" r="147" fill="url(#core)" stroke="#36566c" stroke-width="1.5"/><circle cx="285" cy="260" r="98" fill="none" stroke="#5c7c8e" opacity=".28"/><g stroke="#63899e" opacity=".38" fill="none"><path d="M285 58L480 205L416 418L153 425L90 205Z" stroke-width="1.7"/><path d="M285 58L416 418L90 205L480 205L153 425Z"/></g><path d="M285 58L480 205L416 418L153 425L90 205Z" stroke="#ec4c57" stroke-width="2" fill="none" opacity=".82"/>
 ${[[285,58,'01'],[480,205,'02'],[416,418,'03'],[153,425,'04'],[90,205,'05']].map(([x,y,n])=>`<circle cx="${x}" cy="${y}" r="22" fill="#192a3b" stroke="#eb6d79" stroke-width="2"/><text x="${x}" y="${y+5}" fill="#fff" font-size="15" font-family="monospace" text-anchor="middle">${n}</text>`).join('')}
 <circle cx="285" cy="260" r="56" fill="#ec4c57" opacity=".13"/><circle cx="285" cy="260" r="35" fill="#ed5260"/><text x="285" y="270" fill="#fff" text-anchor="middle" font-family="Arial Black,Arial" font-size="31" font-weight="900">5</text><text x="285" y="322" fill="#bfd3e0" text-anchor="middle" font-size="10" letter-spacing="2.6">CONNECTED CASES</text><text x="285" y="503" fill="#69889d" text-anchor="middle" font-size="12" font-family="monospace">SCENE / EQUATION / EXPERIMENT</text></svg>`;
}
function renderHome(){
 return `<div class="home-wrap"><section class="home-hero"><div class="hero-copy"><div class="kicker">SPH4U INTERACTIVE FILM STUDY</div><h1>EVERY<br>ACTION<br><span class="cut">HAS A REACTION.</span></h1><p>Five moments from <strong style="color:#f1f5f8">Spider-Man: Homecoming</strong>, reimagined as hands-on physics experiments. Change the variables. Test the scene. See what the equations predict.</p><div class="hero-actions"><button class="btn btn-primary" data-route="ferry">START EXPLORING <span>↗</span></button><button class="btn btn-secondary" data-route="cases">VIEW ALL FIVE CASES <span>↓</span></button></div><div class="hero-meta"><div><strong>05</strong>GROUP SCENES</div><div><strong>05</strong>LIVE SIMULATORS</div><div><strong>100%</strong>ENGLISH · OFFLINE</div></div></div><div class="hero-visual"><div class="hero-orbit"></div><div class="hero-corner">PROJECT // 2026</div>${homeOrbit()}<div class="hero-coord">SPH4U / MODEL ACTIVE</div></div></section>
 <section id="caseGrid"><div class="section-label"><div><div class="kicker">THE INVESTIGATIONS</div><h2>CHOOSE YOUR EXPERIMENT.</h2></div><p>Only the five scenes selected and analyzed by the group. Every number can be questioned.</p></div><div class="case-grid">${scenes.map(s=>`<button type="button" class="case-card" data-route="${s.id}" style="--accent:${s.color}"><div class="card-art"><span class="card-num">CASE ${s.no}</span>${sceneDiagram(s.id,s.id==='shocker'?calcShocker(state.values.shocker.blast,'blast'):s.id==='ferry'?calcFerry(state.values.ferry):s.id==='vulture'?calcVulture(state.values.vulture):s.id==='laser'?calcLaser(state.values.laser):calcElevator(state.values.elevator),.3,true)}</div><div class="card-content"><h3>${s.short}</h3><p>${s.subtitle}</p><div class="pill-row">${s.topics.slice(0,2).map(tag).join('')}</div><div class="card-open">OPEN LAB <span aria-hidden="true">↗</span></div></div></button>`).join('')}</div></section>
 <div class="home-bottom"><div class="bottom-panel"><h3>How it works</h3><div class="steps-row"><div class="tiny-step"><span>01 / OBSERVE</span><strong>See the scene</strong><p>Open one of the five team-selected film moments.</p></div><div class="tiny-step"><span>02 / EXPERIMENT</span><strong>Move the sliders</strong><p>Change assumptions and watch the physics update.</p></div><div class="tiny-step"><span>03 / EXPLAIN</span><strong>Show the math</strong><p>Reveal a short calculation, then judge the result.</p></div></div></div><div class="bottom-panel note"><div class="note-flag">A NOTE ABOUT THE NUMBERS</div><h3>Film ≠ laboratory.</h3><p>These are teaching models built from the group’s reports. Some parameters come from research; others are stated assumptions. The experiments show how predictions change—not secret measurements from the movie.</p><span class="mono muted" style="font-size:11px">NO DATABASE · NO UPLOADS · NO EXTERNAL LIBRARIES</span></div></div></div>`;
}
function renderScene(){
 const s=byId[state.active],r=compute(),vs=currentValues(),cs=currentControls();
 return `<div class="case-wrap"><div class="breadcrumb"><button class="back-btn" data-route="cases">← BACK TO FIVE CASES</button><div class="case-pagination" aria-label="Select a scene">${scenes.map(x=>`<button type="button" class="${x.id===s.id?'active':''}" data-route="${x.id}" title="${x.title}" aria-label="Open ${x.title}" ${x.id===s.id?'aria-current="page"':''}>${x.no}</button>`).join('')}</div></div>
 <div class="scene-top"><div><div class="scene-index">CASE FILE ${s.no} / FIVE SELECTED SCENES</div><h1 class="scene-title">${s.title}</h1><p class="scene-deck">${s.subtitle}</p></div><div class="scene-topic"><em>PHYSICS FOCUS</em>${s.tag}</div></div>
 <div class="lab-grid"><div class="visual-card"><div class="visual-top"><strong>SCENE EXPERIMENT / LIVE SCHEMATIC</strong><div class="live-status">MODEL ONLINE</div></div><div class="stage" id="stage"><div class="stage-corner">SCENE ${s.no} // SIMULATION</div><div id="diagram-host">${sceneDiagram(s.id,r,0)}</div><div class="stage-bottom"><span>ILLUSTRATION · NOT MOVIE FOOTAGE</span><span id="stageLabel">ASSUMED MODEL</span></div></div><div class="visual-tools"><div class="visual-tools-left"><button type="button" id="playBtn" class="btn btn-primary btn-small" data-action="play">▶ PLAY MODEL</button><button type="button" class="btn btn-quiet btn-small" data-action="reset">↺ RESET</button><button type="button" class="btn btn-secondary btn-small" data-action="clip">＋ LOCAL CLIP</button></div><div class="stage-progress"><div id="stageBar" style="width:0%"></div></div><span class="stage-clock" id="stageClock">00:00 / 00:05</span></div></div>
 <div class="controls-card"><div class="kicker">EXPERIMENT SETTINGS</div><h3 id="controlTitle">${s.id==='shocker'?shockerModes[state.mode].label:'Change the variables'}</h3><p class="panel-description" id="controlSub">${s.id==='shocker'?shockerModes[state.mode].sub:'Move a slider to recalculate the model instantly.'}</p>${s.id==='shocker'?`<div class="mode-row">${Object.entries(shockerModes).map(([id,m])=>`<button type="button" class="mode-btn ${id===state.mode?'active':''}" data-mode="${id}">${m.label}</button>`).join('')}</div>`:''}<div class="control-list" id="controlList">${controlUI(cs,vs)}</div><div class="controls-footer"><span class="flag">⚑</span><span id="controlFoot">MODEL INPUTS — Some values are assumptions, not values measured in the film.</span></div></div></div>
 <div class="readout-head"><h3>LIVE RESULTS <span style="color:var(--red)">↗</span></h3><span>UPDATED AS YOU EXPERIMENT</span></div><div class="readouts" id="readouts">${readoutUI(r)}</div><div id="verdict">${verdictUI(r)}</div>
 <div class="below-grid"><div class="steps-card"><div class="minor-heading"><h3>Calculation walkthrough</h3><span class="counter" id="stepCount">01 / ${String(r.steps.length).padStart(2,'0')}</span></div><div class="step-main" id="stepBody">${stepUI(r)}</div><div class="step-actions"><div class="step-dots" id="stepDots">${dotUI(r)}</div><div style="display:flex;gap:7px"><button class="btn btn-quiet btn-small" data-action="prev">← BACK</button><button class="btn btn-secondary btn-small" data-action="next">NEXT STEP →</button></div></div></div>
 <div class="truth-card"><div class="minor-heading"><h3>Reality check</h3><span class="counter">MODEL VS. MOVIE</span></div><div class="quote">“${s.quote}”</div><p class="truth-body">${s.limit}</p><button class="source-toggle" data-action="sources" type="button" aria-expanded="false">VIEW INPUTS & SOURCES +</button><div id="sourceList" class="sources-list">${s.source.map(t=>`<div class="source-text">• ${htmlEscape(t)}</div>`).join('')}${s.links.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">↗ ${htmlEscape(label)}</a>`).join('')}</div></div></div>
 <div class="next-strip"><div><p>NEXT INVESTIGATION</p><h3>${scenes[(scenes.findIndex(x=>x.id===s.id)+1)%5].title}</h3></div><button class="btn btn-secondary" data-route="${scenes[(scenes.findIndex(x=>x.id===s.id)+1)%5].id}">OPEN NEXT CASE →</button></div></div>`;
}
function controlUI(cs,vs){return cs.map(c=>`<div class="control-row"><div class="control-header"><label for="control-${c.key}">${c.label}</label><span class="control-value num" data-value="${c.key}">${fmt(vs[c.key])} ${c.unit}</span></div><input id="control-${c.key}" class="range" type="range" data-control="${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${vs[c.key]}" aria-label="${c.label}"><div class="range-limits"><span>${c.min}${c.unit}</span><span>${c.max}${c.unit}</span></div></div>`).join('')}
function readoutUI(r){return r.metrics.map(m=>`<div class="readout"><div class="readout-label">${m.label}</div><div class="readout-number num">${m.num} <small>${m.unit}</small></div><div class="readout-note">${m.note}</div></div>`).join('')}
function verdictUI(r){return `<div class="verdict"><div class="verdict-left"><div class="verdict-icon">${r.status==='fail'?'⚠':r.status==='safe'?'✓':'◈'}</div><div><strong>${r.statusName}</strong><p>${r.statusText}</p></div></div><div class="verdict-tag ${r.status}">${r.status==='fail'?'LIMIT EXCEEDED':r.status==='safe'?'MATERIAL CHECK':'MODEL NOTE'}</div></div>`}
function stepUI(r){const st=r.steps[clamp(state.step,0,r.steps.length-1)];return `<span class="step-eyebrow">STEP ${String(state.step+1).padStart(2,'0')} / PHYSICS</span><div class="step-title">${st.title}</div><div class="step-math">${st.math}</div><div class="step-desc">${st.desc}</div>`}
function dotUI(r){return r.steps.map((_,i)=>`<span class="step-dot ${i===state.step?'active':''}"></span>`).join('')}

function halt(){state.playing=false;cancelAnimationFrame(state.raf);state.raf=0;state.lastTime=0;}
function navigate(id){const route=byId[id]?id:(id==='cases'?'cases':'home');if(location.hash!==`#${route}`)location.hash=route;else{render();if(route==='cases')$('caseGrid')?.scrollIntoView({behavior:'smooth'});}}
function render(){
 halt();state.phase=0;state.step=0;state.sourceOpen=false;state.showVideo=false;
 const route=decodeURIComponent(location.hash.slice(1)||'home');state.active=byId[route]?route:'home';
 $('app').innerHTML=state.active==='home'?renderHome():renderScene();
 document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.route===(route==='home'||!route?'home':'cases')));
 document.title=(state.active==='home'?'Behind the Web':byId[state.active].title+' | Behind the Web')+' — SPH4U';
 if(route==='cases')requestAnimationFrame(()=>$('caseGrid')?.scrollIntoView({behavior:'smooth'}));
 window.scrollTo({top:route==='cases'?window.scrollY:0,behavior:'instant'});
}
function updateLive(){if(state.active==='home')return;const r=compute();$('readouts').innerHTML=readoutUI(r);$('verdict').innerHTML=verdictUI(r);state.step=clamp(state.step,0,r.steps.length-1);$('stepBody').innerHTML=stepUI(r);$('stepDots').innerHTML=dotUI(r);$('stepCount').textContent=`${String(state.step+1).padStart(2,'0')} / ${String(r.steps.length).padStart(2,'0')}`;updateStage(r);}
function updateStage(r){const host=$('diagram-host');if(!host||state.showVideo)return;host.innerHTML=sceneDiagram(state.active,r,state.phase);$('stageBar').style.width=(state.phase*100).toFixed(1)+'%';const cur=Math.floor(state.phase*5),total=5;$('stageClock').textContent=`00:${String(cur).padStart(2,'0')} / 00:${String(total).padStart(2,'0')}`;}
function animationFrame(now){if(!state.playing||state.active==='home')return;const dt=state.lastTime?Math.min(100,now-state.lastTime):16;state.lastTime=now;state.phase=clamp(state.phase+dt/5000,0,1);updateStage(compute());if(state.phase>=1){halt();$('playBtn').textContent='▶ REPLAY MODEL';}else state.raf=requestAnimationFrame(animationFrame);}
function startModel(){if(state.showVideo){state.showVideo=false;renderStageMode();}if(state.playing){halt();$('playBtn').textContent='▶ RESUME MODEL';return;}if(state.phase>=1)state.phase=0;state.playing=true;state.lastTime=0;$('playBtn').textContent='Ⅱ PAUSE';state.raf=requestAnimationFrame(animationFrame);}
function renderStageMode(){const st=$('stage');if(!st)return;st.querySelector('#diagram-host')?.remove();st.querySelector('video')?.remove();const node=document.createElement('div');node.id='diagram-host';st.insertBefore(node,st.querySelector('.stage-bottom'));state.showVideo=false;updateStage(compute());$('stageLabel').textContent='ASSUMED MODEL';}
function showClip(){const file=state.clips[state.active];if(!file){$('clipInput').click();return;}halt();state.showVideo=true;const st=$('stage');st.querySelector('#diagram-host')?.remove();st.querySelector('video')?.remove();const video=document.createElement('video');video.controls=true;video.autoplay=false;video.src=file.url;video.setAttribute('aria-label','Your selected local movie clip');st.insertBefore(video,st.querySelector('.stage-bottom'));$('stageLabel').textContent='YOUR LOCAL VIDEO';$('playBtn').textContent='▶ PLAY MODEL';}
let toastTimer=0;function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3100);}

document.addEventListener('click',e=>{
 const route=e.target.closest('[data-route]');if(route){navigate(route.dataset.route);return;}
 const mode=e.target.closest('[data-mode]');if(mode){state.mode=mode.dataset.mode;halt();state.phase=0;state.step=0;state.showVideo=false;state.sourceOpen=false;render();return;}
 const action=e.target.closest('[data-action]');if(!action)return;
 switch(action.dataset.action){
  case 'play':startModel();break;
  case 'reset':halt();state.phase=0;if(state.showVideo)renderStageMode();else updateStage(compute());$('playBtn').textContent='▶ PLAY MODEL';break;
  case 'next':state.step=(state.step+1)%compute().steps.length;updateLive();break;
  case 'prev':state.step=(state.step+compute().steps.length-1)%compute().steps.length;updateLive();break;
  case 'sources':state.sourceOpen=!state.sourceOpen;$('sourceList').classList.toggle('open',state.sourceOpen);action.textContent=state.sourceOpen?'HIDE INPUTS & SOURCES −':'VIEW INPUTS & SOURCES +';action.setAttribute('aria-expanded',String(state.sourceOpen));break;
  case 'clip':if(state.showVideo){renderStageMode();$('playBtn').textContent='▶ PLAY MODEL';action.textContent='＋ LOCAL CLIP';}else if(state.clips[state.active]){showClip();action.textContent='◈ SHOW MODEL';}else $('clipInput').click();break;
 }
});
document.addEventListener('input',e=>{
 const el=e.target.closest('[data-control]');if(!el)return;
 const key=el.dataset.control,config=currentControls().find(c=>c.key===key);if(!config)return;
 const val=clamp(Number(el.value),config.min,config.max);currentValues()[key]=val;
 const label=document.querySelector(`[data-value="${key}"]`);if(label)label.textContent=`${fmt(val)} ${config.unit}`;
 updateLive();
});
$('clipInput').addEventListener('change',e=>{
 const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('video/')){toast('Choose a video file.');return;}
 const old=state.clips[state.active];if(old)URL.revokeObjectURL(old.url);
 state.clips[state.active]={url:URL.createObjectURL(f),name:f.name};showClip();const clipButton=document.querySelector('[data-action="clip"]');if(clipButton)clipButton.textContent='◈ SHOW MODEL';toast('Local video loaded. It stays on this device.');e.target.value='';
});
window.addEventListener('hashchange',render);
$('presentBtn').addEventListener('click',()=>{document.body.classList.toggle('focus');$('presentBtn').setAttribute('aria-pressed',String(document.body.classList.contains('focus')));toast(document.body.classList.contains('focus')?'Focus mode on. Press P to exit.':'Focus mode off.');});
document.addEventListener('keydown',e=>{
 if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;
 if(e.key.toLowerCase()==='p'){document.body.classList.toggle('focus');$('presentBtn').setAttribute('aria-pressed',String(document.body.classList.contains('focus')));}
 else if(e.key==='Escape'&&document.body.classList.contains('focus')){document.body.classList.remove('focus');$('presentBtn').setAttribute('aria-pressed','false');}
 else if(state.active!=='home'&&(e.key==='ArrowRight'||e.key==='ArrowLeft')&&!e.altKey){const ix=scenes.findIndex(s=>s.id===state.active);navigate(scenes[(ix+(e.key==='ArrowRight'?1:4))%5].id);}
});
render();
