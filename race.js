/*
*** TITLE SCREEN: listen to Arabian Nights; will be nothing but text; marquee balls or something of the likes in the background ***
*** MODES: Career, Time Attack (item 0 available every 5 seconds), Build!
* use fade transitions between screens, if possible
* full speed is maxSpeed
* items: (1) boost (enables player to travel at full speed), (2) 3x boost, (2) 3x ice (fires each time mouse is released; obey's physics)
     * activates instantly or upon mouse release
     * pickup array will contain pos of pick up boxes; random

* json:
*/

function newVars(){
     mobile = false; // speed up system if FPS is below 30
     click = false;
     touch = false;
     maxSpeed = 15; // setting
     difficulty = 0.4; // higher = more harder
     ticks = 0; // used to calculate frame rate
     loop = 1;
     interval = new Date().getTime()/1000; // interval for ticks
     radius = 18;
     rot = 0; // temp
     quantity = 3; // item quantity; for 3x stuff
     stamp = new Date().getTime()/1000;
     start = new Date().getTime()/1000;
     item = null; // possessed item; temp???
     guiCache = [true, stamp];
     hover = [true, 0]; // [increasing?, value]; for 3D-ish looking effect; used for boostPos and pickups
     pos = [0, 0]; // temp???
     vel = [1, 1]; // temp???
     rVector = [0, 0]; // mouse release vector
     trail = []; // temp???
     tTrack = []; // ignore
     track = [[0, 0], [0, 3000], [250, 3400], [500, 3500], [750, 3400], [1000, 3000], [1000, 0], [750, -400], [500, -500], [250, -400]]; // temp
     itemPos = [[0, [150, 1500]], [0, [-150, 1500]], [0, [1150, 1500]], [0, [850, 1500]]]; // temp???, syntax: [stamp, [posX, posY]]
     boostPos = [[0, 1500], [1000, 1500], [850, 1500], [1150, 1500]]; // temp; syntax: [posX, posY]
     others = []; // syntax: [itemValue, [posX, posY], [velX, velY], [targetX, targetY]]
     colors = ["red", "orange", "yellow", "green", "blue", "cyan", "magenta", "purple", "brown", "pink", "black"]; // adjust to player size
     arrang = [[-6, 4], [-2, 4], [2, 4], [6, 4], [-6, 8], [-2, 8], [2, 8], [6, 8], [-6, 12], [-2, 12], [2, 12], [6, 12]]; // multiply by radius; SET NUMBER OF PLAYERS HERE
     info = []; // racers' info; syntax: [lap, checkpoints, checkpoint id, finish time]
     aim = []; // unit vectors for AIs; syntax: [pos, unitVector]
     reflect = []; // unit vectors that corresponds to the walls in objects
     guis = [["itemGUI_", "Item"], ["posGUI_", "Position"], ["timeGUI_", "00:00:00"], ["speedGUI_", "Speed"]]; // syntax: [id, value]
     itemName = ["+/Boost", "+++/Boost", "***/Ice Cannon", "#/Music Mine", "$/Piggy Bank?"];
     entity = []; // stuff that hurts other players; everything is 32 pixels wide; syntax: [type, [posX, posY], [velX, velY], stamp]
     objects = []; // this holds all the vertices, used for SAT; item 0 is RESERVED FOR PLAYER
     edgeP = []; // ignore
     lWall = []; // ignore
     rWall = []; // ignore
     scenery = []; // temp???; syntax: [itemValue, [posX, posY]]
     canvas = document.getElementById("canvas");
     ctx = canvas.getContext("2d");
     animation = null;
}

function inScreen(points, cx, cy, width){ // lag-reducing function; syntax: points (only works for two of them), (optional) centerX, centerY, radius
     // var canvas = {width: 200, height: 200}; // DEBUG
     // return true; // DEBUG
     width = width || 0;
     cx = cx || 0;
     cy = cy || 0;
     if (points != null){
          for (var i = 0; i < points.length; i++){for (var x = 0; x < points.length; x++){
               if (getMag(points[i][0] - points[x][0], points[i][1] - points[x][1]) >= width){
                    cx = (points[i][0] + points[x][0])/2;
                    cy = (points[i][1] + points[x][1])/2;
                    width = getMag(points[i][0] - points[x][0], points[i][1] - points[x][1])/2;
               }
          }}
     }
     cx = cx - pos[0];
     cy = cy - pos[1];
     var left = -canvas.width/2;
     var right = canvas.width/2;
     var top = canvas.height/2;
     var bottom = -canvas.height/2;
     return (cx <= right || cx + width <= right || cx - width <= right) && (cx >= left || cx + width >= left || cx - width >= right) && (cy <= top || cy + width <= top || cy - width <= top) && (cy >= bottom || cy + width >= bottom || cy - width >= bottom);
}

function loadMap(number){ // [0] name, [1] track layout, [2] booster positions, [3] item positions
     track = [];
     for (var i = 0; i < tracks[number][1].length; i++){track[i] = tracks[number][1][i]}
     boostPos = [];
     for (var i = 0; i < tracks[number][2].length; i++){boostPos[i] = tracks[number][2][i]}
     itemPos = [];
     for (var i = 0; i < tracks[number][3].length; i++){itemPos[i] = [0, tracks[number][3][i]]}
}

function playerAI(){
     var ai = false;
     if (check.checked == true){ai = true}
     var best = 1000; // closest radius
     var add = [0, 0];
     var closest = [0, 0];
     for (var x = 0; x < aim.length; x++){
          if (getMag(pos[0] - aim[x][0][0], pos[1] - aim[x][0][1]) < best){
               best = getMag(pos[0] - aim[x][0][0], pos[1] - aim[x][0][1]);
               add[0] = aim[x][1][0]; // /difficulty;
               add[1] = aim[x][1][1]; // /difficulty;
               closest[0] = aim[x][0][0];
               closest[1] = aim[x][0][1];
          }
     }
     if (best > radius * 21){pos[0] = closest[0]; pos[1] = closest[1]}
     if (ai == false){return}
     if (getMag(vel[0], vel[1]) < maxSpeed){
          vel[0] = vel[0]/(1.05 + Math.random()/5) + (add[0] * ((difficulty - 0.5) + Math.random()) * 4); // vel[0] + add[0];
          vel[1] = vel[1]/(1.05 + Math.random()/5) + (add[1] * ((difficulty - 0.5) + Math.random()) * 4); // vel[1] + add[1];
     }
}

function animate(image, viewport, lock, color){
     if (Math.round(viewport.width) != Math.round(getMag(image.width, image.height))){ // to ensure one-time only
          viewport.width = viewport.height = getMag(image.width, image.height);
     }
     if (lock == false){
          viewport.getContext("2d").beginPath();
          viewport.getContext("2d").fillStyle = color;
          viewport.getContext("2d").arc(image.width/2, image.height/2, image.width/2, 0, Math.PI * 2);
          viewport.getContext("2d").fill();
          viewport.getContext("2d").drawImage(image, 0, 0); // viewport.getContext("2d").drawImage(image, -image.width/2, -image.height/2);
     }
     else if (lock == true){
          viewport.width = viewport.width;
          viewport.getContext("2d").setTransform(1, 0, 0, 1, viewport.width/2, viewport.height/2);
          viewport.getContext("2d").rotate(hover[1]);
          viewport.getContext("2d").drawImage(image, -image.width/2, -image.height/2);
     }
}

function closeToPlayer(who){if (getMag(who[1][0] - pos[0], who[1][1] - pos[1]) < (radius * 15)){return true} else {return false}}

function secToDigital(seconds){
     var centi = 0;
     var sec = 0;
     var minute = 0;
     var count = seconds;
     while (count > 0){if ((count - 60) < 0){break}; count = count - 60; minute = minute + 1} // calculating minutes
     while (count > 0){if ((count - 1) < 0){break}; count = count - 1; sec = sec + 1} // calculating seconds
     while (count > 0){if ((count - 0.01) < 0){break}; count = count - 0.01; centi = centi + 1} // calculating centiseconds
     if (minute < 10){minute = "0"+minute}
     if (sec < 10){sec = "0"+sec}
     if (centi < 10){centi = "0"+centi}
     return minute+":"+sec+"."+centi;
}

function onDown(event){
     var dist = Math.sqrt(Math.pow(event.pageX - document.body.clientWidth/2, 2) + Math.pow(event.pageY - document.body.clientHeight/2, 2));
     if (dist < (radius * 3)){click = true; onMove(event)}
}

function onMove(event){
     if (event.touches != null){if (event.touches[0] != null){onDrag(event.touches[0].pageX, event.touches[0].pageY); return}};
     onDrag(event.pageX, event.pageY);
}

function onUp(event){if (click == true){onMouseUp()}; click = false}

function updateGUI(id, media, text1, text2){
     var ctx = document.getElementById(guis[id][0]).getContext("2d");
     ctx.canvas.width = ctx.canvas.width; // using setting width method for better performance // ctx.clearRect(0, 0, document.getElementById(guis[id][0]).width, document.getElementById(guis[id][0]).height);
     ctx.setTransform(1, 0, 0, 1, 0, 0);
     ctx.fillStyle = "#FFFFFF";
     ctx.beginPath();
     ctx.arc(radius, radius, radius, 0, Math.PI * 2);
     ctx.fill();
     ctx.textAlign = "left";
     ctx.font = (radius * 1.3)+"px ostrich";
     if (guiCache[0] == true && ((new Date().getTime()/1000) - guiCache[1]) < 1){
          ctx.fillText(text2.substr(0, Math.floor((1 - ((new Date().getTime()/1000) - guiCache[1])) * 16)), (radius * 2) + radius/2, radius + radius/2);
     }
     else if (guiCache[0] == false && ((new Date().getTime()/1000) - guiCache[1]) < 1){
          ctx.fillText(text2.substr(0, Math.floor(((new Date().getTime()/1000) - guiCache[1]) * 16)), (radius * 2) + radius/2, radius + radius/2);
     }
     else if (guiCache[0] == false && ((new Date().getTime()/1000) - guiCache[1]) >= 1){
          ctx.fillText(text2, (radius * 2) + radius/2, radius + radius/2);
     }
     if (media == 0){ // number
          ctx.beginPath();
          ctx.moveTo(radius, radius);
          ctx.textAlign = "center";
          ctx.fillStyle = "#000000";
          ctx.fillText(text1, radius, radius + radius/2);
     }
     else if (media == 1){ // other glyphs
          ctx.beginPath();
          ctx.moveTo(radius, radius);
          ctx.font = (radius * 1.3)+"px ostrich";
          ctx.textAlign = "center";
          ctx.fillStyle = "#000000";
          ctx.fillText(text1, radius, radius + radius/2);
     }
}

function getMag(x, y){
     if (Math.abs(x) > 1e99){x = 1e-10} // infinity check
     if (Math.abs(y) > 1e99){y = 1e-10}
     return Math.abs(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
}

function playAudio(element){
     if (mobile == true){return}
     if (element.channels == null){
          element.load();
          element.channels = [];
          element.addEventListener("canplaythrough", function(event){for (var n = 0; n < 3; n++){var channel = new Audio(element.src); if (element.id == "cheer_"){channel.volume = .1}; channel.load(); element.channels.push([0, channel])}}, false)
          return;
     }
     for (var n = 0; n < element.channels.length; n++){
          if (((new Date().getTime()/1000) - element.channels[n][0]) > element.channels[n][1].duration){
               element.channels[n][0] = new Date().getTime()/1000;
               element.channels[n][1].play();
               return;
          }
     }
}

function onMouseUp(){
     if (item != null){
          if (item == 1 || item == 2){
               var mag = getMag(rVector[0], rVector[1]);
               if (rVector[0] == 0){mag = 1}
               vel[0] = (rVector[0]/mag) * (maxSpeed + 5);
               vel[1] = (rVector[1]/mag) * (maxSpeed + 5);
               rVector = [0, 0];
               playAudio(boost_);
               playAudio(cheer_);
          }
          else if (item == 3){
               var mag = getMag(rVector[0], rVector[1]);
               if (rVector[0] == 0){mag = 1}
               entity.push([1, [pos[0] + ((rVector[0]/mag) * radius * 5), pos[1] + ((rVector[1]/mag) * radius * 5)], [0, 0], null]);
               entity.push([1, [pos[0] + ((rVector[0]/mag) * radius * 10), pos[1] + ((rVector[1]/mag) * radius * 10)], [0, 0], null]);
               entity.push([1, [pos[0] + ((rVector[0]/mag) * radius * 15), pos[1] + ((rVector[1]/mag) * radius * 15)], [0, 0], null]);
               quantity = 0;
               playAudio(pop_);
          }
          else if (item == 4){
               var mag = getMag(rVector[0], rVector[1]);
               if (rVector[0] == 0){mag = 1}
               entity.push([2, [pos[0] - ((rVector[0]/mag) * radius * 4), pos[1] - ((rVector[1]/mag) * radius * 4)], [0, 0], null]);
               playAudio(pop_);
          }
          else if (item == 5){
               var mag = getMag(rVector[0], rVector[1]);
               if (rVector[0] == 0){mag = 1}
               entity.push([3, [pos[0] + ((rVector[0]/mag) * radius * 5), pos[1] + ((rVector[1]/mag) * radius * 5)], [0, 0], null]);
               playAudio(pop_);
          }
          quantity = quantity - 1;
          if (quantity < 1){item = null}
     }
     vel[0] = vel[0] + rVector[0];
     vel[1] = vel[1] + rVector[1];
     rVector = [0, 0];
}

function onDrag(x, y){
     if (click == false){return}
     var dist = Math.sqrt(Math.pow(x - document.body.clientWidth/2, 2) + Math.pow(y - document.body.clientHeight/2, 2));
     if (dist > radius){
          var nerf = 50;
          if (touch == true){nerf = 85}
          text1.value = [(x - document.body.clientWidth/2)/nerf, (y - document.body.clientHeight/2)/nerf];
          rVector[0] = (x - document.body.clientWidth/2)/nerf;
          rVector[1] = -(y - document.body.clientHeight/2)/nerf;
     }
}

function physics(results){
     var drag = [];
     for (var i = 0; i < results.length; i++){if (results[i] == true){drag[i] = 0} else {drag[i] = .02}}
     var mag = getMag(vel[0], vel[1]);
     if (mag > maxSpeed){
          drag[0] = 0.06;
          if (mag > (maxSpeed + 5)){vel[0] = (vel[0]/mag) * (maxSpeed + 5); vel[1] = (vel[1]/mag) * (maxSpeed + 5)}
     }
     // update position
     pos[0] = pos[0] + vel[0];
     pos[1] = pos[1] + vel[1];
     if (Math.abs(vel[0]) == 0){vel[0] = 1e-10}
     if (Math.abs(vel[1]) == 0){vel[1] = 1e-10}
     // adding drag
     if (results[0] == false){
          vel[0] = (Math.abs(vel[0]) - drag[0]) * vel[0]/Math.abs(vel[0]);
          vel[1] = (Math.abs(vel[1]) - drag[0]) * vel[1]/Math.abs(vel[1]);
     }
     // other racers
     for (var i = 0; i < others.length; i++){
          var mag = getMag(others[i][2][0], others[i][2][1]);
          if (mag > maxSpeed){
               drag[i + 1] = 0.06;
               if (mag > (maxSpeed + 5)){others[i][2][0] = (others[i][2][0]/mag) * (maxSpeed + 5); others[i][2][1] = (others[i][2][1]/mag) * (maxSpeed + 5)}
          }
          // update position
          others[i][1][0] = others[i][1][0] + others[i][2][0];
          others[i][1][1] = others[i][1][1] + others[i][2][1];
          if (Math.abs(others[i][2][0]) == 0){others[i][2][0] = 1e-10}
          if (Math.abs(others[i][2][1]) == 0){others[i][2][1] = 1e-10}
          // add drag
          if (results[i + 1] == false){
               others[i][2][0] = (Math.abs(others[i][2][0]) - drag[i + 1]) * others[i][2][0]/Math.abs(others[i][2][0]);
               others[i][2][1] = (Math.abs(others[i][2][1]) - drag[i + 1]) * others[i][2][1]/Math.abs(others[i][2][1]);
          }
     }
}

function verts(a, b, c, d, e, f){ // [x, y], [x, y], [x, y]
     var width = radius * 14;
     var nVec = [c - a, d - b];
     var mag = Math.abs(Math.sqrt((nVec[0] * nVec[0]) + (nVec[1] * nVec[1])));
     var unit = [nVec[0]/mag, nVec[1]/mag];
     var pVec = [-unit[1] * width, unit[0] * width];
     var pVecB = [unit[1] * width, -unit[0] * width];
     var p1 = [c + pVec[0], d + pVec[1]]; // important
     var p2 = [c + pVecB[0], d + pVecB[1]]; // important too
     nVec = [e - c, f - d];
     mag = Math.abs(Math.sqrt((nVec[0] * nVec[0]) + (nVec[1] * nVec[1])));
     unit = [nVec[0]/mag, nVec[1]/mag];
     pVec = [-unit[1] * width, unit[0] * width];
     pVecB = [unit[1] * width, -unit[0] * width];
     var p3 = [c + pVec[0], d + pVec[1]]; // important
     var p4 = [c + pVecB[0], d + pVecB[1]]; // important too
     return [[(p1[0] + p3[0])/2, (p1[1] + p3[1])/2], [(p2[0] + p4[0])/2, (p2[1] + p4[1])/2]]; // [x, y], [x, y]
}

function bounce(vect1, vect2){
     var perpD = (vect1[0] * vect2[0] + vect1[1] * vect2[1])/getMag(vect2[0], vect2[1]);
     var parD = (vect1[0] * vect2[1] + vect1[1] * -vect2[0])/getMag(vect2[0], vect2[1]);
     var negate = -perpD;
     return [(parD * vect2[1] + negate * vect2[0]), (parD * -vect2[0] + negate * vect2[1])];
}

function ffDraw(){
     ctx.globalAlpha = 1;

     // update the entities
     if (entity.length > 0){
          var survive = [];
          for (var i = 0; i < entity.length; i++){
               var src = null;
               // pathfinding :D
               if (entity[i][0] == 3 || entity[i][0] == 1){
                    var best = 1000; // closest radius
                    var add = [0, 0];
                    var closest = [0, 0];
                    for (var x = 0; x < aim.length; x++){
                         if (getMag(entity[i][1][0] - aim[x][0][0], entity[i][1][1] - aim[x][0][1]) < best){
                              best = getMag(entity[i][1][0] - aim[x][0][0], entity[i][1][1] - aim[x][0][1]);
                              add[0] = aim[x][1][0];
                              add[1] = aim[x][1][1];
                              closest[0] = aim[x][0][0];
                              closest[1] = aim[x][0][1];
                         }
                    }
                    entity[i][2] = [add[0] * (maxSpeed * 2 * loop), add[1] * (maxSpeed * 2 * loop)];
               }
               entity[i][1][0] = entity[i][1][0] + entity[i][2][0];
               entity[i][1][1] = entity[i][1][1] + entity[i][2][1];
               if (entity[i][0] == 1){src = ice_}
               else if (entity[i][0] == 2){src = mine_}
               else if (entity[i][0] == 3){src = bank_}
               var size = 64;
               if (entity[i][3] !== null){
                    size = Math.pow(64, 1 + ((stamp - entity[i][3]) * 5));
                    if ((stamp - entity[i][3]) > 0.2){continue}
               }
               survive.push(entity[i]);
               if (inScreen(null, entity[i][1][0], entity[i][1][1], size/2) == true){
                    ctx.drawImage(src, (entity[i][1][0] - 18) - (size - 64)/2, (entity[i][1][1] - 18) - (size - 64)/2, size, size);
               }
               for (var x = 0; x < arrang.length; x++){
                    if (x == 0){
                         if (getMag(entity[i][1][0] - pos[0], entity[i][1][1] - pos[1]) < 64 && entity[i][3] == null){
                              entity[i][3] = stamp;
                              vel = [vel[0]/10, vel[1]/10];
                              if (entity[i][0] == 1){playAudio(glass3_)}
                              else if (entity[i][0] == 2){playAudio(woodbreak_)}
                              else if (entity[i][0] == 3){playAudio(glass3_); playAudio(death_)}
                         }
                    }
                    else {
                         if (getMag(entity[i][1][0] - others[x - 1][1][0], entity[i][1][1] - others[x - 1][1][1]) < 64 && entity[i][3] == null){
                              entity[i][3] = stamp;
                              others[x - 1][2] = [-(others[x - 1][2][0]/getMag(others[x - 1][2][0], others[x - 1][2][1]) * (maxSpeed + 2)), -(others[x - 1][2][1]/getMag(others[x - 1][2][0], others[x - 1][2][1]) * (maxSpeed + 2))];
                              if (closeToPlayer(others[x - 1]) == true){
                                   if (entity[i][0] == 1){playAudio(glass3_)}
                                   else if (entity[i][0] == 2){playAudio(woodbreak_)}
                                   else if (entity[i][0] == 3){playAudio(glass3_); playAudio(death_)}
                              }
                         }
                    }
               }
          }
          entity = [];
          for (var i = 0; i < survive.length; i++){entity[i] = survive[i]}
     }

     // characters
     ctx.fillStyle = "#FFFFFF";
     if (trail.length > 0){ // speed trail
          for (var i = 0; i < trail.length; i++){
               if (inScreen(null, trail[i][1][0], trail[i][1][1], radius/trail[i][0]/1.5/2) == false){continue}
               ctx.beginPath();
               ctx.arc(trail[i][1][0], trail[i][1][1], radius/trail[i][0]/1.5, 0, Math.PI * 2);
               ctx.fill();
          }
     }
     ctx.beginPath();
     ctx.arc(pos[0], pos[1], radius, 0, Math.PI * 2);
     ctx.fill();
     // item on character
     ctx.beginPath();
     ctx.moveTo(pos[0], pos[1]);
     ctx.font = (radius * 1.3)+"px ostrich";
     ctx.textAlign = "center";
     ctx.fillStyle = "#000000";
     if (item != null){ctx.fillText(itemName[item - 1].split("/")[0].substr(0, quantity), pos[0], pos[1] + radius/2)}
     // arrow
     if (click == true){
          ctx.beginPath();
          ctx.lineWidth = 20;
          if (item == 1 || item == 2){ctx.strokeStyle = "#8F00FF"} // boosts
          else if (item == 3){ctx.strokeStyle = "#ADD8E6"} // ice cannon
          else if (item == 4){ctx.strokeStyle = "#000000"} // music mine
          else if (item == 5){ctx.strokeStyle = "#FFD700"} // piggy bank
          else {ctx.strokeStyle = "#FFFFFF"}
          var range = getMag(rVector[0], rVector[1]) * 50;
          if (range == 0){ctx.lineWidth = 1}
          else if (range/20 < 20 && range > 0){ctx.lineWidth = range/20}
          ctx.arc(pos[0], pos[1], radius, 0, Math.PI * 2);
          ctx.stroke();
          if (range > 0){
               ctx.lineCap = "round";
               ctx.lineWidth = 5;
               ctx.moveTo(pos[0], pos[1]);
               ctx.lineTo(pos[0] + (rVector[0] * 50), pos[1] + (rVector[1] * 50));
               ctx.stroke();
          }
     }
     // others
     for (var i = 0; i < others.length; i++){
          if (inScreen(null, others[i][1][0], others[i][1][1], radius) == false){continue}
          ctx.beginPath();
          ctx.fillStyle = colors[i];
          ctx.arc(others[i][1][0], others[i][1][1], radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(others[i][1][0], others[i][1][1]);
          ctx.fillStyle = "#888888";
          if (others[i][0] != null){ctx.fillText(itemName[others[i][0] - 1].split("/")[0].substr(0, 1), others[i][1][0], others[i][1][1] + radius/2)}
     }
}

function bgDraw(){
     if (mobile == true){ctx.globalAlpha = .6} else {ctx.globalAlpha = 1} // motion blur for mobile devices

     var area = [pos[0] - canvas.width/2, pos[1] - canvas.height/2, canvas.width, canvas.height];

     // background
     ctx.beginPath();
     ctx.fillStyle = ctx.createPattern(bg_, "repeat");
     ctx.fillRect(area[0], area[1], area[2], area[3]);
     var decor = decor1_;
     for (var i = 0; i < scenery.length; i++){
          if (inScreen(null, scenery[i][1][0], scenery[i][1][1], decor.width) == false){continue}
          ctx.drawImage(decor, scenery[i][1][0], scenery[i][1][1]);
     }

     // track
     for (var i = 0; i < (lWall.length - 1); i++){
          if (inScreen([lWall[i], lWall[i + 1]]) == false && inScreen([rWall[i], rWall[i + 1]]) == false){continue}
          ctx.beginPath();
          ctx.moveTo(lWall[i][0], lWall[i][1]);
          ctx.lineTo(rWall[i][0], rWall[i][1]);
          ctx.lineTo(rWall[i + 1][0], rWall[i + 1][1]);
          ctx.lineTo(lWall[i + 1][0], lWall[i + 1][1]);
          ctx.closePath();
          if (i == 0){ctx.fillStyle = ctx.createPattern(start_, "repeat")}
          else {ctx.fillStyle = ctx.createPattern(tile_, "repeat")}
          ctx.fill();
     }

     // walls
     ctx.strokeStyle = "#000000";
     ctx.lineWidth = 5;
     for (var i = 0; i < objects.length; i++){
          if (inScreen(objects[i]) == false){continue}
          if (objects[i].length == 12 || objects[i].length == 0){continue}
          ctx.beginPath();
          ctx.moveTo(objects[i][0][0], objects[i][0][1]);
          ctx.lineTo(objects[i][1][0], objects[i][1][1]);
          ctx.stroke();
     }

     // booster animations
     animate(boosterIMG_, booster_, true);

     // booster draw
     if (boostPos.length > 0){
          for (var i = 0; i < boostPos.length; i++){
               if (inScreen(null, boostPos[i][0], boostPos[i][1], 40) == false){continue}
               var alter = 1; // ignore
               ctx.drawImage(booster_, boostPos[i][0] - (40 + hover[1]/4) * alter, boostPos[i][1] - (40 + hover[1]/4) * alter, (80 + hover[1]/2) * alter, (80 + hover[1]/2) * alter);
          }
     }

     // capsule draws
     if (itemPos.length > 0){
          for (var i = 0; i < itemPos.length; i++){
               if ((stamp - itemPos[i][0]) > 3 || (stamp - itemPos[i][0]) < 0.25){
                    if (inScreen(null, itemPos[i][1][0], itemPos[i][1][1], 40) == false){continue}
                    var alter = 1; // ignore
                    if ((stamp - itemPos[i][0]) < 0.25){alter = Math.pow((stamp - itemPos[i][0]), -1)/5}
                    ctx.drawImage(capsule_, itemPos[i][1][0] - (40 + hover[1]/4) * alter, itemPos[i][1][1] - (40 + hover[1]/4) * alter, (80 + hover[1]/2) * alter, (80 + hover[1]/2) * alter);
               }
          }
     }
}

function tick(countdown){
     // update the tick count
     if ((new Date().getTime()/1000 - interval) >= 1){
          var fps = Math.pow(1/ticks, -1);
          text2.value = "FPS: "+fps;
          interval = new Date().getTime()/1000;
          ticks = 0;
          mobile = false;
          loop = 1;
          if (fps <= 30){mobile = true; loop = 2}
          if (fps <= 15){mobile = true; loop = 4}
          /*if (fps <= 15){ // my first attempt at ternary :>
               (document.body.clientHeight < document.body.clientWidth) ?
               resize(document.body.clientHeight, document.body.clientHeight) : resize(document.body.clientWidth, document.body.clientWidth);
          }
          else {resize(null, null)}*/
     }
     ticks = ticks + 1;

     // update the hover interval
     if (hover[1] > 50){hover[0] = false}
     else if (hover[1] < 1){hover[0] = true}
     if (hover[0] == true){hover[1] = hover[1] + 1}
     else if (hover[0] == false){hover[1] = hover[1] - 1}

     // collision results for physics
     var results = [];
     for (var i = 0; i < arrang.length; i++){results[i] = false}

     // booster collisions
     if (boostPos.length > 0){
          for (var i = 0; i < boostPos.length; i++){
               // collision time, booster style!
               var alter = 1;
               if (getMag(boostPos[i][0] - pos[0], boostPos[i][1] - pos[1]) < 40){
                    if (getMag(vel[0], vel[1]) < ((maxSpeed + 5) - 1)){playAudio(boost_); playAudio(cheer_)}
                    vel[0] = (vel[0]/getMag(vel[0], vel[1])) * (maxSpeed + 5);
                    vel[1] = (vel[1]/getMag(vel[0], vel[1])) * (maxSpeed + 5);
               }
               for (var x = 0; x < others.length; x++){
                    if (getMag(boostPos[i][0] - others[x][1][0], boostPos[i][1] - others[x][1][1]) < 40){
                         if (getMag(others[x][2][0], others[x][2][1]) < ((maxSpeed + 5) - 1) && closeToPlayer(others[x]) == true){playAudio(boost_)}
                         others[x][2][0] = (others[x][2][0]/getMag(others[x][2][0], others[x][2][1])) * (maxSpeed + 5);
                         others[x][2][1] = (others[x][2][1]/getMag(others[x][2][0], others[x][2][1])) * (maxSpeed + 5);
                    }
               }
          }
     }

     // capsule collisions
     if (itemPos.length > 0){
          for (var i = 0; i < itemPos.length; i++){
               if (getMag(itemPos[i][1][0] - pos[0], itemPos[i][1][1] - pos[1]) < 50 && (stamp - itemPos[i][0]) > 3){
                    itemPos[i][0] = stamp;
                    item = Math.ceil(Math.random() * itemName.length);
                    if (item == 0){item = 1}
                    quantity = itemName[item - 1].split("/")[0].length;
                    if (guiCache[0] == true){guiCache = [false, stamp]}
                    playAudio(pop_);
                    setTimeout(function(){playAudio(orb_)}, 200);
                    setTimeout(function(){guiCache = [true, stamp]}, 5000);
               }
               for (var x = 0; x < others.length; x++){
                    if (getMag(itemPos[i][1][0] - others[x][1][0], itemPos[i][1][1] - others[x][1][1]) < 50 && (stamp - itemPos[i][0]) > 3){
                         itemPos[i][0] = stamp;
                         others[x][0] = Math.ceil(Math.random() * itemName.length);
                         if (others[x][0] == 0){others[x][0] = 1}
                         if (closeToPlayer(others[x]) == true){
                              playAudio(pop_);
                              setTimeout(function(){playAudio(orb_)}, 200);
                         }
                    }
               }
          }
     }

     // PHYSICS PROCESSES goes here; AVOID DRAWING
     for (var n = 0; n < loop; n++){
          // checkpoint and lap counter; incorporates a collision
          for (var i = 0; i < info.length; i++){
               var position = pos;
               if (i > 0){position = others[i - 1][1]}
               for (var x = 3; x < track.length; x++){ // have to start at #3 since the first three points are the start
                    if (getMag(position[0] - track[x][0], position[1] - track[x][1]) < (radius * 21) && info[i][2] < x){
                         info[i][1] = info[i][1] + 1;
                         info[i][2] = x;
                    }
               }
               // see if collided with the start line
               var test = false;
               var line = [[-250, 500], [250, 500]]; // the line will always be 500 pixels wide unless verts() and radius changes
               var segV = [line[1][0] - line[0][0], line[1][1] - line[0][1]];
               var ptV = [position[0] - line[0][0], position[1] - line[0][1]];
               var projS = ((ptV[0] * segV[0]) + (ptV[1] * segV[1]))/getMag(segV[0], segV[1]);
               var projV = [(segV[0]/getMag(segV[0], segV[1])) * projS, (segV[1]/getMag(segV[0], segV[1])) * projS];
               var closest = [line[0][0] + projV[0], line[0][1] + projV[1]];
               // for circles that are distant from the line
               if (projS < 0){closest = [line[0][0], line[0][1]]}
               else if (projS > getMag(segV[0], segV[1])){closest = [line[1][0], line[1][1]]}
               if (getMag(position[0] - closest[0], position[1] - closest[1]) < radius){test = true}
               if (info[i][1] > ((track.length - 3) * 0.75) && test == true){ // lap
                    info[i][0] = info[i][0] + 1;
                    info[i][1] = 0;
                    info[i][2] = 0;
                    if (info[i][0] > 4 && info[i][3] == null){info[i][3] = stamp} // change lap number here
                    if (i == 0){text3.value = "Lap "+info[i][0]+"/5"; if (info[i][0] > 4){text3.value = "Finish!"}}
               }
          }

          // speed trail
          if (trail.length > 0){
               var remain = [];
               for (var i = 0; i < trail.length; i++){trail[i][0] = trail[i][0] - 1; if (trail[i][0] > 0){remain.push(trail[i])}}
               trail = [];
               if (remain.length > 0){for (var i = 0; i < remain.length; i++){trail[i] = remain[i]}}
          }

          // AI item use
          if (ticks == 1){
               for (var i = 0; i < others.length; i++){
                    if (others[i][0] == null || Math.random() > 0.2){continue}
                    var uVector = [others[i][2][0]/getMag(others[i][2][0], others[i][2][1]), others[i][2][1]/getMag(others[i][2][0], others[i][2][1])];
                    var mag = getMag(others[i][2][0], others[i][2][1]);
                    if (others[i][0] == 1 || others[i][0] == 2){
                         others[i][2][0] = uVector[0] * (maxSpeed + 5);
                         others[i][2][1] = uVector[1] * (maxSpeed + 5);
                         if (closeToPlayer(others[i]) == true){playAudio(boost_)}
                    }
                    else if (others[i][0] == 3){
                         if (uVector[0] == 0){mag = 1}
                         entity.push([1, [others[i][1][0] + (uVector[0] * radius * 5), others[i][1][1] + (uVector[1] * radius * 5)], [0, 0], null]);
                         if (closeToPlayer(others[i]) == true){playAudio(pop_)}
                    }
                    else if (others[i][0] == 4){
                         if (uVector[0] == 0){mag = 1}
                         entity.push([2, [others[i][1][0] - (uVector[0] * radius * 4), others[i][1][1] - (uVector[1] * radius * 4)], [0, 0], null]);
                         if (closeToPlayer(others[i]) == true){playAudio(pop_)}
                    }
                    else if (others[i][0] == 5){
                         if (uVector[0] == 0){mag = 1}
                         entity.push([3, [others[i][1][0] + (uVector[0] * radius * 5), others[i][1][1] + (uVector[1] * radius * 5)], [0, 0], null]);
                         if (closeToPlayer(others[i]) == true){playAudio(pop_)}
                    }
                    others[i][0] = null;
               }
          }

          // AI pathfinding - the best of the best :D
          for (var i = 0; i < others.length; i++){
               var best = 1000; // closest radius
               var add = [0, 0];
               var closest = [0, 0];
               for (var x = 0; x < aim.length; x++){
                    if (getMag(others[i][1][0] - aim[x][0][0], others[i][1][1] - aim[x][0][1]) < best){
                         best = getMag(others[i][1][0] - aim[x][0][0], others[i][1][1] - aim[x][0][1]);
                         add[0] = aim[x][1][0];
                         add[1] = aim[x][1][1];
                         closest[0] = aim[x][0][0];
                         closest[1] = aim[x][0][1];
                    }
               }
               if (best > radius * 21){others[i][1][0] = closest[0]; others[i][1][1] = closest[1]}
               if (getMag(others[i][2][0], others[i][2][1]) < maxSpeed){
                    others[i][2][0] = others[i][2][0]/(1.05 + Math.random()/5) + (add[0] * ((difficulty - 0.5) + Math.random()) * 4); // others[i][2][0] + add[0];
                    others[i][2][1] = others[i][2][1]/(1.05 + Math.random()/5) + (add[1] * ((difficulty - 0.5) + Math.random()) * 4); // others[i][2][1] + add[1];
               }
          }

          // player pathfinding
          playerAI();

          // player control
          if (getMag(vel[0], vel[1]) < maxSpeed){vel[0] = vel[0] + rVector[0]/50; vel[1] = vel[1] + rVector[1]/50}

          // collision time >:D
          for (var i = 0; i < objects.length; i++){ // only balls (#0 - #[arrang.length - 1]) should be detected
               // this SAT is exclusive to balls and walls only
               if (objects[i].length == 2){continue} // er-hem, walls....
               for (var x = 0; x < objects.length; x++){
                    if (i == x){continue}
                    if (objects[x].length == 12 || objects[x].length == 0){ // ball to ball
                         var posI = posX = pos;
                         if (i > 0){posI = [others[i - 1][1][0], others[i - 1][1][1]]}
                         if (x > 0){posX = [others[x - 1][1][0], others[x - 1][1][1]]}
                         var push = [(posX[0] - posI[0])/getMag(posX[0] - posI[0], posX[1] - posI[1]), (posX[1] - posI[1])/getMag(posX[0] - posI[0], posX[1] - posI[1])];
                         if (getMag(posX[0] - posI[0], posX[1] - posI[1]) < (radius * 2)){
                              if (i == 0){
                                   // pos = [pos[0] - push[0], pos[1] - push[1]];
                                   // vel = [-push[0] * getMag(posX[0], posX[1]), -push[1] * getMag(posX[0], posX[1])];
                              }
                              else if (i > 0){
                                   // others[i - 1][1] = [others[i - 1][1][0] - push[0], others[i - 1][1][1] - push[1]];
                                   // others[i - 1][2] = [-push[0], -push[1]];
                              }
                         }
                         continue;
                    }
                    var test = false;
                    var cx = null;
                    var cy = null;
                    if (i == 0){cx = pos[0]; cy = pos[1]}
                    else {cx = others[i - 1][1][0]; cy = others[i - 1][1][1]}
                    var segV = [objects[x][1][0] - objects[x][0][0], objects[x][1][1] - objects[x][0][1]];
                    var ptV = [cx - objects[x][0][0], cy - objects[x][0][1]];
                    var projS = ((ptV[0] * segV[0]) + (ptV[1] * segV[1]))/getMag(segV[0], segV[1]);
                    var projV = [(segV[0]/getMag(segV[0], segV[1])) * projS, (segV[1]/getMag(segV[0], segV[1])) * projS];
                    var closest = [objects[x][0][0] + projV[0], objects[x][0][1] + projV[1]];
                    // for circles that are distant from the walls
                    if (projS < 0){closest = [objects[x][0][0], objects[x][0][1]]}
                    else if (projS > getMag(segV[0], segV[1])){closest = [objects[x][1][0], objects[x][1][1]]}
                    if (getMag(cx - closest[0], cy - closest[1]) < radius){test = true}
                    if (test == true){
                         var response = {overlapN: {x: reflect[x][0], y: reflect[x][1]}};
                         if (i == 0){
                              var magn = getMag(vel[0], vel[1]);
                              var nVector = bounce([vel[0]/magn, vel[1]/magn], [response.overlapN.x, response.overlapN.y]);
                              vel[0] = nVector[0] * magn;
                              vel[1] = nVector[1] * magn;
                              pos[0] = (pos[0] + response.overlapN.x) + vel[0];
                              pos[1] = (pos[1] + response.overlapN.y) + vel[1];
                              results[0] = true;
                              playAudio(thud_);
                         }
                         else {
                              var magn = getMag(others[i - 1][2][0], others[i - 1][2][1]);
                              var nVector = bounce([others[i - 1][2][0]/magn, others[i - 1][2][1]/magn], [response.overlapN.x, response.overlapN.y]);
                              others[i - 1][2][0] = nVector[0] * magn;
                              others[i - 1][2][1] = nVector[1] * magn;
                              others[i - 1][1][0] = (others[i - 1][1][0] + response.overlapN.x) + others[i - 1][2][0];
                              others[i - 1][1][1] = (others[i - 1][1][1] + response.overlapN.y) + others[i - 1][2][1];
                              results[i] = true;
                              if (closeToPlayer(others[i - 1]) == true){playAudio(thud_)}
                         }
                         break;
                    }
               }
          }

          // RIP old collision detection system

          if (isNaN(pos[0]) == true){pos = [0, 0]}
          if (isNaN(vel[0]) == true){vel = [1e-10, 1e-10]}
          physics(results);
     }

     // trail
     trail.push([8, [pos[0], pos[1]]]);
     for (var i = 0; i < others.length; i++){trail.push([8, [others[i][1][0], others[i][1][1]]])}

     // ui update
     var rank = 999;
     var order = []; // points.id (e.g. 10011.1 or 10011.10)
     for (var i = 0; i < info.length; i++){
          var position = pos;
          if (i > 0){position = others[i - 1][1]}
          order[i] = new Number((info[i][0] * 1e6) + (info[i][1] * 1e4) + Math.round(getMag(tTrack[info[i][2] + 1][0] - position[0], tTrack[info[i][2] + 1][1] - position[1]))).toString()+"."+(i + 1);
     }
     order.sort(function(a, b){return b - a});
     for (var i = 0; i < order.length; i++){if (parseInt(order[i].split(".")[1]) == 1){rank = i + 1}}
     if (item !== null){updateGUI(0, 1, itemName[item - 1].split("/")[0].substr(0, quantity), itemName[item - 1].split("/")[1])}
     else {updateGUI(0, 0, "", "")}
     updateGUI(1, 0, rank, "Position");
     updateGUI(2, 0, Math.floor((new Date().getTime()/1000) - start), secToDigital((new Date().getTime()/1000) - start));
     updateGUI(3, 0, Math.round(getMag(vel[0], vel[1]) * 10), "Speed");

     // piggyback!
     var center = [-pos[0], pos[1]]; // can be changed to others
     var mag = getMag(center[0], center[1]);
     var cUnit = [center[0]/mag, center[1]/mag];
     center = [(cUnit[0] * Math.cos(-rot)) - (cUnit[1] * Math.sin(-rot)), (cUnit[0] * Math.sin(-rot)) + (cUnit[1] * Math.cos(-rot))];
     center = [center[0] * mag, center[1] * mag];
     ctx.setTransform(1, 0, 0, -1, center[0] + canvas.width/2, (center[1] - canvas.height/2) + canvas.height);

     // draw
     bgDraw();
     ffDraw();

     stamp = new Date().getTime()/1000;

     if (countdown == true){
          text3.value = "3";
          setTimeout(function(){text3.value = "2"}, 1000)
          setTimeout(function(){text3.value = "1"}, 2000)
          setTimeout(function(){text3.value = "Go!"; stamp = interval = new Date().getTime()/1000; ticks = 0; animation = window.requestAnimFrame(function(){tick(false)})}, 3000)
     }
     else {animation = window.requestAnimFrame(function(){tick(false)})}
}

function resize(x, y){
     var resizeX = document.body.clientWidth;
     var resizeY = document.body.clientHeight;
     if (x != null && y != null){resizeX = x; resizeY = y}
     if (canvas.width != resizeX){
          canvas.width = resizeX;
          canvas.style.marginLeft = ((document.body.clientWidth - resizeX)/2)+"px";
     }
     if (canvas.height != resizeY){
          canvas.height = resizeY;
          canvas.style.marginTop = ((document.body.clientHeight - resizeY)/2)+"px";
     }
}

function initialize(){ // don't draw here!
     newVars();

     resize(null, null);

     // load the map here
     loadMap(0);

     for (var i = 0; i < arrang.length; i++){info[i] = [0, 0, 0, null]}

     objects[0] = [];
     reflect[0] = null; // not a wall
     for (var i = 0; i < (arrang.length - 1); i++){
          others[i] = [null, [arrang[i + 1][0] * radius, arrang[i + 1][1] * radius], [1e-10, 1e-10], [0, 0]];
          objects[i + 1] = []; // drawCir(others[i][1]);
          reflect[i + 1] = null; // not a wall
     }
     pos = [arrang[0][0] * radius, arrang[0][1] * radius];

     // need more than 2 points to work; add a reminder to the players
     tTrack = [];
     for (var i = 0; i < track.length; i++){tTrack.push(track[i])}
     tTrack.push(track[0]);
     tTrack.push(track[1]);
     for (var i = 0; i < (tTrack.length - 2); i++){
          edgeP.push(verts(tTrack[i][0], tTrack[i][1], tTrack[i + 1][0], tTrack[i + 1][1], tTrack[i + 2][0], tTrack[i + 2][1]));
     }
     for (var i = 0; i < edgeP.length; i++){if (edgeP[i].length == 2){lWall.push(edgeP[i][0]); rWall.push(edgeP[i][1])}}
     lWall.push(lWall[0]);
     rWall.push(rWall[0]);
     // adding the walls to objects
     for (var i = 0; i < (lWall.length - 1); i++){
          // wow. such maths. moar error
          var midT = [(tTrack[i][0] + tTrack[i + 1][0])/2, (tTrack[i][1] + tTrack[i + 1][1])/2]; // midpoint of track
          // left wall
          var midL = [(lWall[i][0] + lWall[i + 1][0])/2, (lWall[i][1] + lWall[i + 1][1])/2]; // midpoint of line
          var norm1 = [-(lWall[i + 1][1] - lWall[i][1])/getMag((lWall[i + 1][0] - lWall[i][0]), (lWall[i + 1][1] - lWall[i][1])), (lWall[i + 1][0] - lWall[i][0])/getMag((lWall[i + 1][0] - lWall[i][0]), (lWall[i + 1][1] - lWall[i][1]))]; // unit vector
          var norm2 = [(lWall[i + 1][1] - lWall[i][1])/getMag((lWall[i + 1][0] - lWall[i][0]), (lWall[i + 1][1] - lWall[i][1])), -(lWall[i + 1][0] - lWall[i][0])/getMag((lWall[i + 1][0] - lWall[i][0]), (lWall[i + 1][1] - lWall[i][1]))]; // unit vector
          if (getMag(midT[0] - (midL[0] + norm1[0]), midT[1] - (midL[1] + norm1[1])) < getMag(midT[0] - (midL[0] + norm2[0]), midT[1] - (midL[1] + norm2[1]))){reflect.push(norm1)} // reflect correspondence
          else if (getMag(midT[0] - (midL[0] + norm2[0]), midT[1] - (midL[1] + norm2[1])) < getMag(midT[0] - (midL[0] + norm1[0]), midT[1] - (midL[1] + norm1[1]))){reflect.push(norm2)} // reflect correspondence
          objects.push([lWall[i], lWall[i + 1]]);
          // right wall
          midL = [(rWall[i][0] + rWall[i + 1][0])/2, (rWall[i][1] + rWall[i + 1][1])/2]; // midpoint of line
          norm1 = [-(rWall[i + 1][1] - rWall[i][1])/getMag((rWall[i + 1][0] - rWall[i][0]), (rWall[i + 1][1] - rWall[i][1])), (rWall[i + 1][0] - rWall[i][0])/getMag((rWall[i + 1][0] - rWall[i][0]), (rWall[i + 1][1] - rWall[i][1]))]; // unit vector
          norm2 = [(rWall[i + 1][1] - rWall[i][1])/getMag((rWall[i + 1][0] - rWall[i][0]), (rWall[i + 1][1] - rWall[i][1])), -(rWall[i + 1][0] - rWall[i][0])/getMag((rWall[i + 1][0] - rWall[i][0]), (rWall[i + 1][1] - rWall[i][1]))]; // unit vector
          if (getMag(midT[0] - (midL[0] + norm1[0]), midT[1] - (midL[1] + norm1[1])) < getMag(midT[0] - (midL[0] + norm2[0]), midT[1] - (midL[1] + norm2[1]))){reflect.push(norm1)} // reflect correspondence
          else if (getMag(midT[0] - (midL[0] + norm2[0]), midT[1] - (midL[1] + norm2[1])) < getMag(midT[0] - (midL[0] + norm1[0]), midT[1] - (midL[1] + norm1[1]))){reflect.push(norm2)} // reflect correspondence
          objects.push([rWall[i], rWall[i + 1]]);
     }

     // setting the aim for the AIs
     for (var i = 0; i < (tTrack.length - 2); i++){
          var dist = getMag(tTrack[i + 1][0] - tTrack[i][0], tTrack[i + 1][1] - tTrack[i][1]);
          var skip = Math.ceil(dist/(radius * 10));
          var unit = [(tTrack[i + 1][0] - tTrack[i][0])/dist, (tTrack[i + 1][1] - tTrack[i][1])/dist];
          if (skip > 0){for (var x = 0; x < skip; x++){aim.push([[tTrack[i][0] + (unit[0] * (radius * 10 * x)), tTrack[i][1] + (unit[1] * (radius * 10 * x))], unit])}}
     }

     // scenery
     scenery = [];
     for (var i = 12; i < reflect.length; i++){
          var place = [objects[i][0][0] - (reflect[i][1] * 100), objects[i][0][1] - (reflect[i][0] * 100)];
          scenery.push([0, place]);
     }

     // transfer the images to their respective canvases
     animate(iceIMG_, ice_, false, "#FFFFFF");
     animate(mineIMG_, mine_, false, "#000000");
     animate(bankIMG_, bank_, false, "#FFD700");

     // audio doesn't play on the first call for some reason
     playAudio(thud_);
     playAudio(boost_);
     playAudio(cheer_);
     playAudio(pop_);
     playAudio(orb_);
     playAudio(woodbreak_);
     playAudio(glass3_);
     playAudio(death_);
     // bgm1_.play();
     cheer_.volume = 0.1;

     tick(true)
}

newVars();
window.requestAnimFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.cancelAnimFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
$(window).resize(function(){resize(null, null)})