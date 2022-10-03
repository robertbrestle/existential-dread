function init() {
	
	document.getElementById("start").className = "hidden";
	
	document.addEventListener("keydown", function(e) {
		switch(e.key) {
			case 'W':
			case 'w':
			case "ArrowUp":
			case ' ':
				if(e.target.nodeName === "BODY") {
					e.preventDefault();
				}
				wasd[0] = true;
				if(map.gravityOn && !player.isJumping && !player.isExhausted) {
					player.isJumping = true;
					player.lastX = player.x;
					player.lastY = player.y;
					if(player.isSprinting) {
						player.stamina -= player.sprintJump;
						player.vertSpeed = player.defaultSprintJumpSpeed;
					}else {
						player.vertSpeed = map.gravitySpeed * -1;
					}
				}
				break;
			case 'A':
			case 'a':
			case "ArrowLeft":
				wasd[1] = true;
				player.isLeft = true;
				break;
			case 'S':
			case 's':
			case "ArrowDown":
				wasd[2] = true;
				break;
			case 'D':
			case 'd':
			case "ArrowRight":
				wasd[3] = true;
				player.isLeft = false;
				break;
			case "Shift":
				if(!player.isExhausted && player.stamina > 0) {
					player.isSprinting = true;
				}
				break;
			case 'F': // lantern
			case 'f':
				if(player.lanternParts >= player.maxLanternParts && player.batteryCharge > 0) {
					player.lanternOn = !player.lanternOn;
				}
				break;
			case 'q': // Q
				if(debug) {
					isGameOver = true;
				}
				break;
			case 'P': // pause
			case 'p':
				if(isStarted) {
					isPaused = !isPaused;
					// if unpaused, restart main()
					if(!isPaused) {
						frame = requestAnimationFrame(main);
					}else {
						cancelAnimationFrame(frame);
						if(!debug) {
							renderPause();
						}
					}
				}
				break;
			default:
				if(debug) {
					//console.log(e.key);
				}
				break;
		}
	}, false);
	
	document.addEventListener("keyup", function(e) {
		switch(e.key) {
			case 'W':
			case 'w':
			case "ArrowUp":
			case ' ':
				wasd[0] = false;
				break;
			case 'A':
			case 'a':
			case "ArrowLeft":
				wasd[1] = false;
				break;
			case 'S':
			case 's':
			case "ArrowDown":
				wasd[2] = false;
				break;
			case 'D':
			case 'd':
			case "ArrowRight":
				wasd[3] = false;
				break;
			case "Shift":
				player.isSprinting = false;
				break;
			default:
				break;
		}
	}, false);

	
	isGameOver = false;
	isStarted = false;
	isPaused = false;
	
	// init canvas and context
	canvas = document.getElementById("canvas");
	// check if canvas is supported
	if(!canvas.getContext) {
		alert("Your browser does not support HTML5 Canvas :(");
		return;
	}
	ctx = canvas.getContext("2d");
	
	canvas.background = new Image();
	
	isLoadNextMap = true;
	
	if(!debug) {
		setTimeout(function(){
			renderTitle("splash");
			setTimeout(function(){ playSound(hurrrr); }, 1000);
			
			setTimeout(function() {
				renderMainTitle();
			}, 4000);
		}, 1000);
	}else {
		renderMainTitle();
	}

	//EditorJS.init();
}
function resetMapPlayer(mapFile) {
	wasd = [false, false, false, false];
	player.health = player.statMax;
	player.stamina = player.statMax;
	player.vertSpeed = 0;
	player.isJumping = false;
	player.isSprinting = false;
	player.inDarkness = false;
	player.isExhausted = false;
	player.inSafeZone = false;
	player.imgTick = 0;
	player.img = "idleleft";
	player.isLeft = true;
	player.lanternOn = false;
	player.lanternParts = 0;
	player.batteryCharge = player.batteryRefill;
	
	map.nextMap = mapFile;
	map.level = 0;
	map.overlayAlpha = map.overlayAlphaReset;
	map.passedMS = 0;
	map.totalMS = 0;
	isLoadNextMap = true;
}
function resetGame(mapFile) {
	isGameOver = false;

	document.getElementById("title").className = "hidden";
	document.getElementById("back").className = "hidden";
	document.getElementById("gameover").className = "hidden";

	resetMapPlayer(mapFile);
	
	ctick = 0;
	ctock = 0;
	
	isStarted = true;
	renderLoadNextMap();
}
function main(time) {

	aCurrentTick = Math.round((time - aStartTime) / tickRate);
	aDeltaTick = (aCurrentTick - aLastTick) * tickRate;
	aLastTick = aCurrentTick;

	//~16.667ms ticks
	if(aDeltaTick > 0) {
		updatePlayer();
		collision();
		updateDarkness();
		if(!isGameOver) {
			draw();
		}

		// 100ms ticks
		ctock = (new Date()).getTime();
		if(ctock - ctick > map.tickMS) {
			ctick = ctock;
			map.passedMS += map.tickMS;

			if(updateSlowTicks()) {
				return;
			}
		}//ctock
	}//aDeltaTick

	frame = requestAnimationFrame(main);
}


function updatePlayer() {
	if (player.x - map.x >= (map.screenX / 2) - (player.sizeX * 2) && map.x < map.floorX - map.screenX) {
		map.x += player.speed;
	}
	if ((player.x - map.x <= (map.screenX / 2) + player.sizeX && map.x > 0) || (map.x > map.floorX - map.screenX)) {
		map.x -= player.speed;
	}
	if (player.y - map.y >= (map.screenY / 4) && map.y < map.floorY) {
		if(player.vertSpeed !== 0 && player.vertSpeed > player.speed) {
			map.y += player.vertSpeed;
		}else {
			map.y += player.speed;
		}
	}
	if ((player.y - map.y + player.sizeY <= (map.screenY / 2) && map.y > 0)){// || (map.y > map.floorY - map.screenY)) {
		if(player.vertSpeed < 0 && Math.abs(player.vertSpeed) > player.speed) {
			map.y += player.vertSpeed;
		} else {
			map.y -= player.speed;
		}
	}
	
	// camera corrections
	if(map.x < 0) {
		map.x = 0;
	}
	if(map.y < 0) {
		map.y = 0;
	} else if(map.floorY > map.screenY && map.y > map.floorY - map.screenY) {
		map.y = map.floorY - map.screenY;
	}
	
	// direction increment || boundary enforcement
	// reset player speed modifiers
	player.speed = player.defaultSpeed;
	
	if(!player.isExhausted) {
		if(wasd[3] || player.x < 0) {
			if (player.isSprinting) {// && (player.getStam() > 0)) {
				player.speed = player.defaultSprintSpeed;
			}
			player.x += player.speed;
		}
		if(wasd[1] || player.x > map.floorX) {
			if (player.isSprinting) {// && (player.getStam() > 0)) {
				player.speed = player.defaultSprintSpeed;
			}
			player.x -= player.speed;
		}
		if(!map.gravityOn) {
			if(wasd[2] || player.y < 0) {
				player.y += player.speed;
			}
		}
		if(!map.gravityOn && (wasd[0] || player.y > map.floorY)) {
			player.y -= player.speed;
		}
		if(player.y > map.floorY) {
			player.y = map.floorY - player.sizeY;
		}
	}
		
	if(map.gravityOn) {
		if(player.y < map.floorY) {
			player.vertSpeed++;
			if(player.vertSpeed > map.gravitySpeed) {
				player.vertSpeed = map.gravitySpeed;
			}
		}else if(player.y >= map.floorY) {
			player.vertSpeed = 0;
			player.isJumping = false;
		}
		player.y = player.y + player.vertSpeed;
	}
	
	// animATION
	if(player.isExhausted) {
		if(player.isLeft) {
			player.img = "exhaustedleft";
		}else {
			player.img = "exhaustedright";
		}
	}else {
		if(wasd[0] || player.isJumping) {
			if(player.isLeft) {
				player.img = "jumpleft";
			}else {
				player.img = "jumpright";
			}
		}else if(wasd[1]) {
			if(player.lanternOn) {
				player.img = "runlightleft";
			}else {
				player.img = "runleft";
			}
		}else if(wasd[2]) {
			if(player.isLeft) {
				player.img = "crouchleft";
			}else {
				player.img = "crouchright";
			}
		}else if(wasd[3]) {
			if(player.lanternOn) {
				player.img = "runlightright";
			}else {
				player.img = "runright";
			}
		}
		
		if((!player.isJumping && !wasd[1] && !wasd[2] && !wasd[3]) || (wasd[1] && wasd[3])) {
			if(player.lanternOn) {
				if(player.isLeft) {
					player.img = "idlelightleft";
				}else {
					player.img = "idlelightright";
				}
			}else {
				if(player.isLeft) {
					player.img = "idleleft";
				}else {
					player.img = "idleright";
				}
			}
		}
	}
	
	
	// STATS
	if(player.stamina < 0) {
		player.stamina = 0;
		player.isExhausted = true;
		player.isSprinting = false;
	}else if(player.stamina > player.statMax) {
		player.stamina = player.statMax;
	}
	if(player.isSprinting && (wasd[1] || wasd[3])) {
		player.stamina -= 5;
	}else if(player.stamina < player.statMax) {
		player.stamina += 2;
	}
	// lantern
	if(player.batteryCharge < 0) {
		player.batteryCharge = 0;
		player.lanternOn = false;
	}/*else if(player.batteryCharge > player.statMax) {
		player.batteryCharge = player.statMax;
	}*/
	if(player.lanternOn) {
		player.batteryCharge -= map.batteryDrain;
	}
	// hp
	if(player.health <= 0) {
		isGameOver = true;
	}
}//updatePlayer

function collision() {
	let shoves = 0;
	player.inSafeZone = false;

	// tiles
	for(let i = 0; i < map.tiles.length; i++) {
		//if(map.tiles[i].x - map.x < map.screenX && map.tiles[i].y - map.y < map.screenY) {
		if(map.tiles[i].x - map.x + player.sizeX * 2 > player.x - map.x &&
		   map.tiles[i].x - map.x - player.sizeX * 2 < player.x - map.x &&
		   map.tiles[i].y - map.y + player.sizeY * 2 > player.y - map.y &&
		   map.tiles[i].y - map.y - player.sizeY * 2 < player.y - map.y) {
			shoves += checkTileCollision(map.tiles[i], i);
		}
	}

	if(shoves > 1) {
		player.x = player.lastX;
		player.y = player.lastY;
	}
	
	// check if player is in the darkness
	player.inDarkness = false;
	if(!player.inSafeZone) {
		// TODO: change to "for" for performance increase
		darknesses.darkness.forEach(function(e) {
			// TODO: limit check if darkness visible
			// TODO: fix bug where opposite coordinate is NOT checked (ie "up" needs to reference the e.x* coords)
			// TODO: this doesn't support independent darkness "zones" (darkness not based on a direction/side)
			if((player.y + player.sizeY > e.y1 && e.dir === "up") ||
			   (player.x + player.sizeX > e.x1 && e.dir === "left") ||
			   (player.y < e.y2 && e.dir === "down") ||
			   (player.x < e.x2 && e.dir === "right")) {
				player.inDarkness = true;
				if(!player.lanternOn) {
					player.health -= e.damage;
					// increase darkness overlay with lower health
						if(player.health < (player.statMax/4)) {
							map.overlayAlpha = (map.overlayAlphaReset + 0.2);
						}else if(player.health < (player.statMax/2)) {
							map.overlayAlpha = (map.overlayAlphaReset + 0.1);
						}
				}
			}
		});
	}
}//collision

function checkTileCollision(tile, i) {
	let shoves = 0;
	if(map.tileMap[tile.type].isSolid) {
		// top of object
		if((player.x + player.sizeX > tile.x) &&
		   (player.x < tile.x + map.tileMap[tile.type].sizeX) &&
		   (player.y + player.sizeY > tile.y - player.speed) &&
		   (player.y + player.sizeY < tile.y + (map.tileMap[tile.type].sizeY/4) + player.speed)) {
				if(player.vertSpeed > 0) {
					player.vertSpeed = 0;
					player.isJumping = false;
					player.y = tile.y - player.sizeY;
				}else if(!map.gravityOn) {
					player.y = tile.y - player.sizeY;
				}
			}
		// bottom of object
		if((player.x + player.sizeX - map.collisionThresholdX > tile.x) &&
		   (player.x < tile.x + map.tileMap[tile.type].sizeX - map.collisionThresholdX) &&
		   (player.y > tile.y) &&
		   (player.y < tile.y + map.tileMap[tile.type].sizeY)) {
			   // PROBLEM ???
				if(player.vertSpeed < 0) {
					if(debug) {
						ctx.strokeStyle = "#00FF00";
						ctx.strokeRect(tile.x - map.x, tile.y - map.y, map.tileMap[tile.type].sizeX, map.tileMap[tile.type].sizeY);
					}
					player.vertSpeed = 0;
					player.y = tile.y + map.tileMap[tile.type].sizeY;
				}else if(!map.gravityOn) {
					player.y = tile.y + map.tileMap[tile.type].sizeY;
				}
			}
		// bottom of object clipping
		//shove player to side from bottom if clipping
		// DEBUG WHITE SQUARE
		if((player.x + player.sizeX > tile.x) &&
		(player.x < tile.x + map.tileMap[tile.type].sizeX) &&
		(player.y > tile.y) &&
		(player.y < tile.y + map.tileMap[tile.type].sizeY)) {
			if(player.x + player.sizeX - map.collisionThresholdX > tile.x) {
				player.x = tile.x + map.tileMap[tile.type].sizeX;
				shoves++;
			}else if(player.x < tile.x + map.tileMap[tile.type].sizeX - map.collisionThresholdX) {
				player.x = tile.x - player.sizeX; //map.clippingX
				shoves++;
			}
		}
		// xy movement collision
		if((player.x + player.sizeX > tile.x) &&
		   (player.x < tile.x + map.tileMap[tile.type].sizeX) &&
		   (player.y + player.sizeY > tile.y) &&
		   (player.y < tile.y + map.tileMap[tile.type].sizeY)) {
			   // static objects - no movement
			   if(wasd[1]) {
				   player.x += player.speed;
				   player.x = tile.x + map.tileMap[tile.type].sizeX;
			   }else if (wasd[3]) {
				   player.x -= player.speed;
				   player.x = tile.x - player.sizeX;
			   }
			}
	// non-solids - items
	}else if(!map.tileMap[tile.type].isSolid) {
		if(map.tileMap[tile.type].type !== '') {
			if((player.x < tile.x + map.tileMap[tile.type].sizeX) &&
			   (player.x + player.sizeX > tile.x) &&
			   (player.y < tile.y + map.tileMap[tile.type].sizeY) &&
			   (player.y + player.sizeY - 1 > tile.y)) {
					if(map.tileMap[tile.type].type === "jump") {
					  if(!player.isJumping) {
							player.y = tile.y - map.tileMap[tile.type].sizeY;
							player.isJumping = true;
							player.vertSpeed = player.defaultSprintJumpSpeed;
						}
					}else {
						switch(map.tileMap[tile.type].type) {
							case "battery":
								player.batteryCharge += player.batteryRefill;
								map.tiles.splice(i,1);
								break;
							case "lantern":
								player.lanternParts++;
								map.tiles.splice(i,1);
								break;
							case "remove":
								map.tileMap[map.tileMap[tile.type].target].isSolid = false;
								map.tileMap[map.tileMap[tile.type].target].img = "clear";
								// if exists, switch image; else remove tile
								if(map.tileMap[tile.type].imgSwitch !== "undefined") {
									map.tileMap[tile.type].img = map.tileMap[tile.type].imgSwitch;
									// disable button
									map.tileMap[tile.type].type = "";
								}else {
									map.tiles.splice(i,1);
								}
								break;
							case "door":
								if(isEditorTesting) {
									isGameOver = true;
								}else if(map.nextMap != "") {
									isLoadNextMap = true;
								}else {
									// TODO: refactor this
									isGameOver = true;
								}
								return;
							default:
								return;
						}
						if(isSoundEnabled) {
							playSound(gong);
						}
					}
			   }
		}
	}//else non-solid

	if(map.tileMap[tile.type].type == "glow") {
		if(tile.x - map.x + map.glowLightSize > player.x - map.x &&
			tile.x - map.x - map.glowLightSize < player.x - map.x &&
			tile.y - map.y + map.glowLightSize > player.y - map.y &&
			tile.y - map.y - map.glowLightSize < player.y - map.y) {
				player.inSafeZone = true;
			}
	}//player in safe zone

	return shoves;
}//checkTileCollision

function updateDarkness() {
	if(darknesses.instructions.length > 0) {
		let peek = darknesses.instructions[darknesses.instructions.length - 1];
		if((peek.condType === "time" && map.passedMS > Number(peek.cond)) ||
		   (peek.condType === "lantern" && player.lanternParts >= Number(peek.cond)) ||
		   (peek.condType === "position" && Math.floor(player.x / player.sizeX) === peek.condPosition.x && Math.floor(player.y / player.sizeY) === peek.condPosition.y)
		   ) {
			let darkIndex = darknesses.darkness.findIndex(function(e) {
				return peek.id === e.id;
			});
			if(darkIndex < 0) {
				darknesses.darkness.push(Object.assign({}, peek));
			}else {
				let keys = Object.keys(peek);
				// save darkness position for "position"
				let oldPos = {
					x1: darknesses.darkness[darkIndex].x1,
					y1: darknesses.darkness[darkIndex].y1,
					x2: darknesses.darkness[darkIndex].x2,
					y2: darknesses.darkness[darkIndex].y2
				};
				keys.forEach(function(k) {
					darknesses.darkness[darkIndex][k] = peek[k];
				});
				
				if(peek.condType === "position" && peek.condPosition.handoff) {
					let keys = Object.keys(oldPos);
					keys.forEach(function(k) {
						darknesses.darkness[darkIndex][k] = oldPos[k];
					});
				}
			}
			darknesses.instructions.pop();
		}
	}
	for(let i = 0; i < darknesses.darkness.length; i++) {
		let dark = darknesses.darkness[i];
		if(dark.speed === 0) {
			continue;
		}
		switch(dark.dir) {
			case "up":
				if(dark.y1 >= 0 && dark.y1 <= map.floorY) {
					darknesses.darkness[i]["y1"] -= dark.speed;
				}
				break;
			case "left":
				if(dark.x1 >= 0 && dark.x1 <= map.floorX) {
					darknesses.darkness[i]["x1"] -= dark.speed;
				}
				break;
			case "down":
				if(dark.y2 <= map.floorY && dark.y2 >= 0) {
					darknesses.darkness[i]["y2"] += dark.speed;
				}
				break;
			case "right":
				if(dark.x2 <= map.floorX && dark.x2 >= 0) {
					darknesses.darkness[i]["x2"] += dark.speed;
				}
				break;
			default:
				break;
		}
	}
}//updateDarkness

function renderLoadNextMap() {
	stopMusic();
	try {
		let data = canvas.toDataURL();
		let img = document.createElement("img");
		img.src = data;
		map.fadeImg = img;
	}catch(e) {
		map.fadeImg = null;
	}
	renderLevelFade();
	isLoadNextMap = false;
}

// updates every 100ms
// returns true if it"s time to stop the game loop
function updateSlowTicks() {

	if(isGameOver) {
		map.totalMS += map.passedMS;
		renderTitle("gameover", false);
		stopMusic();
		document.getElementById("back").className = "hidden";
		document.getElementById("gameover").className = '';
		isStarted = false;

		return true;
	}else if(isLoadNextMap) {
		renderLoadNextMap();
		return true;
	}

	player.imgTick++;
	if(player.imgTick > player.imgTickMax) {
		player.imgTick = 0;
		if(player.isExhausted) {
			player.exhaustedTicks--;
			if(player.exhaustedTicks < 0) {
				player.exhaustedTicks = player.exhaustedTicksMax;
				player.isExhausted = false;
			}
		}
	}

	// TODO: refactor this to allow multiple countdown levels
	// TODO: move this
	if(map.condType === "countdown" && (typeof map.nextMap === "undefined" || map.nextMap === "")) {
		if(Number(map.cond) - map.passedMS < 0) {
			map.totalMS += map.passedMS;
			renderTitle("victory", true);
			stopMusic();
			document.getElementById("back").className = "hidden";
			document.getElementById("gameover").className = '';
			isStarted = false;
			return true;
		}
	}

	if(debug) {
		//document.getElementById("player").textContent = JSON.stringify(player);
		//document.getElementById("map").textContent = JSON.stringify(map);
		document.getElementById("player").textContent = map.passedMS;
	}

	return false;
}//updateSlowTicks

function draw() {
	if(ctx.globalAlpha < 1) {
		return;
	}
	
	// pre-rendering
	var p_cvs = document.createElement("canvas");
	p_cvs.width = canvas.width;
	p_cvs.height = canvas.height;
	var p_ctx = p_cvs.getContext("2d");
	
	// draw background
	if(map.background != null) {
		p_ctx.drawImage(map.background, (map.x * -1), (map.y * -1), map.floorX, map.floorY);
	}else if(map.backgroundColor != null) {
		p_ctx.fillStyle = map.backgroundColor;
		p_ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	if(debugTiles) {
		p_ctx.strokeStyle = "#FF0000";
	}
	
	// test if screen is completely dark
	let inCompleteDarkness = false;
	for(let i = 0; i < darknesses.darkness.length; i++) {
		if((darknesses.darkness[i].x1 <= 0 && darknesses.darkness[i].x2 - map.x >= map.screenX) && (darknesses.darkness[i].y1 <= 0 && darknesses.darkness[i].y2 - map.y >= map.screenY)) {
			inCompleteDarkness = true;
			break;
		}
	}
	// draw tiles
	if(!inCompleteDarkness) {
		for(let i = 0; i < map.tiles.length; i++) {
			let tile = map.tiles[i];
			if(tile.x - map.x < map.screenX && tile.y - map.y < map.screenY && !map.tileMap[tile.type].hasGlow) {
				p_ctx.drawImage(tile_spritesheet,
								tile_imgs[map.tileMap[tile.type].img].x,
								tile_imgs[map.tileMap[tile.type].img].y,
								tile_imgs[map.tileMap[tile.type].img].sizeX,
								tile_imgs[map.tileMap[tile.type].img].sizeY,
								tile.x - map.x,
								tile.y - map.y,
								map.tileMap[tile.type].sizeX,
								map.tileMap[tile.type].sizeY);
				if(debugTiles) {
					p_ctx.strokeRect(tile.x - map.x, tile.y - map.y, map.tileMap[tile.type].sizeX, map.tileMap[tile.type].sizeY);
					p_ctx.strokeText('['+i+']', tile.x - map.x, tile.y - map.y + map.tileMap[tile.type].sizeY/2);
				}
			}
		}
	}
	
	// darkness
	p_ctx.fillStyle = "#000";
	for(let i = 0; i < darknesses.darkness.length; i++) {
		// darkness pulsing
		//p_ctx.globalAlpha = Math.random() * (1 - 0.95) + 0.95;
		p_ctx.fillRect(darknesses.darkness[i]["x1"] - map.x,
					   darknesses.darkness[i]["y1"] - map.y,
					   darknesses.darkness[i]["x2"],
					   darknesses.darkness[i]["y2"]);
	}
	//p_ctx.globalAlpha = 1;
	
	//make health bar flash
	if(player.inDarkness && player.lanternOn) {
		// draw flashlight background
		p_ctx.drawImage(player_spritesheet, player_imgs["light"].x, player_imgs["light"].y, player_imgs["light"].sizeX, player_imgs["light"].sizeY, player.x - map.x - (player.sizeX * 2), player.y - map.y - (player.sizeY * 2), player_imgs["light"].sizeX, player_imgs["light"].sizeY);
		// redraw blocks
		for(let i = 0; i < map.tiles.length; i++) {
			let tile = map.tiles[i];
			if(tile.x - map.x + player.lanternLightSize > player.x - map.x &&
				tile.x - map.x - player.lanternLightSize < player.x - map.x &&
				tile.y - map.y + player.lanternLightSize > player.y - map.y &&
				tile.y - map.y - player.lanternLightSize < player.y - map.y) {
				 p_ctx.drawImage(tile_spritesheet, tile_imgs[map.tileMap[tile.type].img].x, tile_imgs[map.tileMap[tile.type].img].y, tile_imgs[map.tileMap[tile.type].img].sizeX, tile_imgs[map.tileMap[tile.type].img].sizeY, tile.x - map.x, tile.y - map.y, map.tileMap[tile.type].sizeX, map.tileMap[tile.type].sizeY);
				 if(debugTiles) {
					 p_ctx.strokeRect(tile.x - map.x, tile.y - map.y, map.tileMap[tile.type].sizeX, map.tileMap[tile.type].sizeY);
					 p_ctx.strokeText('['+i+']', tile.x - map.x, tile.y - map.y + map.tileMap[tile.type].sizeY/2);
				 }
			 }
		}
	}

	// render things that glow in the dark
	for(let i = 0; i < map.tiles.length; i++) {
		let tile = map.tiles[i];
		if(map.tileMap[tile.type].hasGlow) {
			// render glow
			p_ctx.drawImage(tile_spritesheet,tile_imgs["glow_small"].x,tile_imgs["glow_small"].y,tile_imgs["glow_small"].sizeX,tile_imgs["glow_small"].sizeY,tile.x - map.x,tile.y - map.y,map.tileMap[tile.type].sizeX,map.tileMap[tile.type].sizeY);
			// render tile
			p_ctx.drawImage(tile_spritesheet, tile_imgs[map.tileMap[tile.type].img].x, tile_imgs[map.tileMap[tile.type].img].y, tile_imgs[map.tileMap[tile.type].img].sizeX, tile_imgs[map.tileMap[tile.type].img].sizeY, tile.x - map.x, tile.y - map.y, map.tileMap[tile.type].sizeX, map.tileMap[tile.type].sizeY);
		}
	}
	
	// draw player
	p_ctx.drawImage(player_spritesheet, player_imgs[player.img].x + player.imgTick * player.sizeX, player_imgs[player.img].y, player.sizeX, player.sizeY, player.x - map.x, player.y - map.y, player.sizeX, player.sizeY);
	if(debugTiles) {
		p_ctx.strokeStyle = "#FF0000";
		p_ctx.strokeRect(player.x - map.x, player.y - map.y, player.sizeX, player.sizeY);
	}

	// fade overlay
	if(map.overlayAlpha > 0) {
		p_ctx.globalAlpha = map.overlayAlpha;
		p_ctx.fillStyle = map.overlayColor;
		p_ctx.fillRect(0,0,canvas.width,canvas.height);
		p_ctx.globalAlpha = 1;
	}
	
	// render UI
	p_ctx.fillStyle = "#AA0000";
	p_ctx.fillRect(417,10,200,12);
	p_ctx.fillStyle = "#FF0000";
	p_ctx.fillRect(420,7,(player.health * 2)/10,12);
	p_ctx.fillStyle = "#00AA00";
	p_ctx.fillRect(417,27,200,12);
	p_ctx.fillStyle = "#00FF00";
	p_ctx.fillRect(420,24,(player.stamina * 2)/10,12);
	if(player.lanternParts === player.maxLanternParts) {
		p_ctx.fillStyle = "#AAAA00";
		p_ctx.fillRect(417,44,200,12);
		p_ctx.fillStyle = "#FFFF00";
		if(player.batteryCharge > player.statMax) {
			p_ctx.fillRect(420,41,(player.statMax * 2)/10,12);
		}else {
			p_ctx.fillRect(420,41,(player.batteryCharge * 2)/10,12);
		}
	}

	// render special text
	if(typeof map.condType !== "undefined" && map.condType !== "") {
		p_ctx.fillStyle = "#000000";
		p_ctx.fillRect(417,61,125,15);
		p_ctx.fillStyle = "#D3D3D3";
		p_ctx.font = "12px Verdana";
		if(map.condType === "lantern") {
			p_ctx.fillText("Lantern Parts: " + player.lanternParts + "/" + player.maxLanternParts,420,73);
		}else if(map.condType === "countdown") {
			p_ctx.fillText("Time remaining: " + Math.trunc((map.cond - map.passedMS) / 1000),420,73);
		}
	}
	
	// render pre-rendered canvas
	ctx.drawImage(p_cvs, 0, 0, canvas.width, canvas.height);
}//draw

function renderPause() {
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#FF0000";
	ctx.font = "64px Verdana";
	ctx.textAlign = "center";
	ctx.fillText("PAUSED", canvas.width/2, canvas.height/2);
	ctx.font = "16px Verdana";
	ctx.fillText("PRESS P TO RESUME", canvas.width/2, canvas.height/2 + 32);
}//renderPause

function renderLevelFade() {
	/// increase alpha with delta value
	map.alpha -= 0.01;
	
	//// if delta <=0 or >=1 then reverse
	if (map.alpha <= 0) {
		map.alpha = 0;
	}
	
	/// clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	/// set global alpha
	ctx.globalAlpha = map.alpha;
	
	if(map.alpha <= 0 || map.fadeImg == null) {
		LoadMapJS.load32Map(map.nextMap);
		map.level++;
		return;
	}else {
		/// re-draw image
		ctx.drawImage(map.fadeImg, 0, 0);
	}
	
	/// loop using rAF
	frame = requestAnimationFrame(renderLevelFade);
}//renderLevelFade

function renderTitle(img, isWin) {
	ctx.drawImage(title_imgs[img], 0, 0, 640, 480);
	if(img === "title") {
		if(!isEditorTesting) {
			document.getElementById("title").className = '';
		}
		document.getElementById("back").className = "hidden";
		document.getElementById("gameover").className = "hidden";
	}else if (typeof isWin !== "undefined") {
		ctx.fillStyle = "#FFF";
		ctx.font = "14px Verdana";
		ctx.fillText((isWin || isEditorTesting ? "Completed" : "Failed") + " in " + formatRuntime(map.totalMS), 400, 455);
		ctx.fillText("Player health: " + player.health + "/" + player.statMax, 400, 470);
	}else if(img !== "splash") {
		document.getElementById("title").className = "hidden";
		document.getElementById("back").className = '';
	}
}//renderTitle

function renderMainTitle() {
	renderTitle("title");
	loopMusic(music_tracks["title"]);
}