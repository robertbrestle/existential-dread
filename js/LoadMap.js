LoadMapJS = {
	loadTextFile:function(path, callback) {   
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open("GET", path, true);
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);  
	}//loadTextFile
	,
	loadEditorFile:function() {
		document.getElementById("editor-messages").textContent = '';
		try {
			LoadMapJS.loadMap(document.getElementById("editor-text").value);
		}catch(e) {
			document.getElementById("editor-messages").textContent = "ERROR: " + e;
			console.log(e);
		}
	}//loadEditorFile
	,
	load32Map:function(path) {
		if(typeof path === "undefined" || path === '') {
			return;
		}
		
		LoadMapJS.loadTextFile(path, function(text) {
			LoadMapJS.loadMap(text);
		});
	}// loadMap
	,
	loadMap:function(text) {
		let tileMap = {};
		let tileList = [];
		let keyMap = {};
		let darkList = [];
		let activateList = [];
	
		let txtMap = text.replace(/\r/g, '').split('\n');
		let parseMap = false;
		let mapStartH = 0;
		
		for(var h = 0; h < txtMap.length; h++) {
			if(!parseMap) {
				if(txtMap[h] === '') {
					continue;
				}else if(txtMap[h] === "START") {
					parseMap = true;
					mapStartH = h + 1;
				}else if(txtMap[h].startsWith("DARKNESS")) {
					let dinst = txtMap[h].split('=');
					//darkList.push(Object.assign({}, JSON.parse(dinst[1].toString())));
					darkList.push(JSON.parse(dinst[1].toString()));
				}else {
					let key = txtMap[h].split('=');
					if(txtMap[h].startsWith("MAP")) {
						keyMap[key[0].toString()] = JSON.parse(key[1].toString());
					}else {
						keyMap[key[0].toString()] = JSON.parse(key[1].toString());
						
						let t = JSON.parse(key[1].toString());
						if(typeof t.sizeX === "undefined" || t.sizeX === "") {
							t.sizeX = tileRef.sizeX;
						}else {
							t.sizeX = Number(t.sizeX);
						}
						if(typeof t.sizeY === "undefined" || t.sizeY === "") {
							t.sizeY = tileRef.sizeY;
						}else {
							t.sizeY = Number(t.sizeY);
						}
						if(typeof t.isSolid === "undefined") {
							t.isSolid = tileRef.isSolid;
						}
						if(typeof t.type === "undefined") {
							t.type = tileRef.type;
						}
						if(typeof t.target === "undefined") {
							t.target = tileRef.target;
						}else {
							t.target = t.target;
						}
						if(typeof t.offsetX === "undefined") {
							t.offsetX = tileRef.offsetX;
						}else {
							t.offsetX = Number(t.offsetX);
						}
						if(typeof t.offsetY === "undefined") {
							t.offsetY = tileRef.offsetY;
						}else {
							t.offsetY = Number(t.offsetY);
						}
						if(typeof t.hasGlow === "undefined") {
							t.hasGlow = tileRef.hasGlow;
						}else {
							t.hasGlow = Boolean(t.hasGlow);
						}

						tileMap[key[0].toString()] = t;
					}
				}
			}else {
				// set level boundaries
				let width = keyMap["MAP"].width;
				//let height = keyMap["MAP"].height;
				map.floorX = keyMap["MAP"].width * tileRef.sizeX;
				map.floorY = keyMap["MAP"].height * tileRef.sizeY;

				for(var w = 0; w < width; w++) {
					let mapChar = txtMap[h].charAt(w).toString();
					if(mapChar === ' ') {
						continue;
					}else if(typeof tileMap[mapChar] !== "undefined") {
						let tmpTile = {
							"type": mapChar
						};
						if(typeof tileMap[mapChar].offsetX !== "undefined") {
							tmpTile.x = w * tileRef.sizeX + tileMap[mapChar].offsetX;
						}else {
							tmpTile.x = w * tileRef.sizeX;
						}
						if(typeof tileMap[mapChar].offsetY !== "undefined") {
							tmpTile.y = ((h - mapStartH) * tileRef.sizeY) + tileMap[mapChar].offsetY;
						}else {
							tmpTile.y = (h - mapStartH) * tileRef.sizeY;
						}

						switch(tileMap[mapChar].type) {
							case "activate":
								activateList.push(tmpTile);
								break;
							default:
								tileList.push(tmpTile);
								break;
						}
					}else if(mapChar === 'S') {
						// set spawn location
						player.x = w * player.sizeX;
						player.y = (h - mapStartH) * player.sizeY;
						// set camera offset
						map.x = Math.floor(player.x - map.screenX/2);
						if(map.x < 0) {
							map.x = 0;
						}else if(map.floorX - map.x < map.screenX) {
							map.x = map.floorX - map.screenX;
						}
						map.y = Math.floor(player.y - map.screenY/2) + player.sizeY;
						if(map.y < 0){
							map.y = 0;
						}else if(map.floorY - map.y < map.screenY) {
							map.y = map.floorY - map.screenY;
						}
					}else {
						continue;
					}
				}
			}
		}
		
		// optional camera override
		if(typeof keyMap["MAP"].cameraX !== "undefined" && keyMap["MAP"].cameraX !== "") {
			map.x = Number(keyMap["MAP"].cameraX);
		}
		if(typeof keyMap["MAP"].cameraY !== "undefined" && keyMap["MAP"].cameraY !== "") {
			map.y = Number(keyMap["MAP"].cameraY);
		}

		if(typeof keyMap["MAP"].bgImg !== "undefined" && keyMap["MAP"].bgImg != "") {
			map.background = loadImage(keyMap["MAP"].bgImg, keyMap["MAP"].bgImgWidth, keyMap["MAP"].bgImgHeight);
		}else {
			map.background = null;
		}

		if(typeof keyMap["MAP"].bgColor !== "undefined") {
			map.backgroundColor = keyMap["MAP"].bgColor;
		}else {
			map.backgroundColor = null;
		}
		
		map.nextMap = keyMap["MAP"].nextMap;
		map.tiles = tileList;
		map.tileMap = tileMap;
		map.activateList = activateList;
		map.totalMS += map.passedMS;
		map.passedMS = 0;
		map.condType = keyMap["MAP"].condType;
		map.cond = keyMap["MAP"].cond;
		if(typeof keyMap["MAP"].batteryDrain !== "undefined") {
			map.batteryDrain = keyMap["MAP"].batteryDrain;
		}else {
			map.batteryDrain = 1;
		}

		// overlay
		if(typeof keyMap["MAP"].overlayColor !== "undefined" && keyMap["MAP"].overlayColor != "") {
			map.overlayColor = keyMap["MAP"].overlayColor;
		}else {
			map.overlayColor = map.overlayAlphaReset;
		}
		if(typeof keyMap["MAP"].overlayAlpha !== "undefined" && keyMap["MAP"].overlayAlpha != "") {
			map.overlayAlpha = keyMap["MAP"].overlayAlpha;
		}else {
			map.overlayAlpha = map.overlayAlphaReset;
		}
		ctx.globalAlpha = 1;
		map.alpha = 1;

		if(debug) {
			player.laternParts = 5;
			player.batteryCharge = 1000;
		}
	
		wasd = [false, false, false, false];
		player.vertSpeed = 0;
		player.inDarkness = false;
		player.lanternOn = false;
		
		darknesses.instructions = [];
		darknesses.darkness = [];
		darknesses.instructions = darkList.reverse();
		
		if(isSoundEnabled && keyMap["MAP"].music !== "none") {
			loopMusic(music_tracks[keyMap["MAP"].music]);
		}else {
			stopMusic();
		}
		
		frame = requestAnimationFrame(main);
	}//loadMap
};