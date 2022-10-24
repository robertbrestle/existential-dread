var debug = false;
var debugTiles = false;

// level editor
var isEditorTesting = false;

// ensure only a single animation frame is in use
var frame;

var canvas = {};
var ctx = {};

var isGameOver = false;
var isGameSuccessful = false;
var isStarted = false;
var isPaused = false;
var isSoundEnabled = true;
var isLoadNextMap = false;

var wasd = [false, false, false, false];

var tileRef = {
	x: 0,
	y: 0,
	sizeX: 32,
	sizeY: 32,
	offsetX: 0,
	offsetY: 0,
	isSolid: true,
	//isStatic: true,
	type: "",
	target: "",
	img: "",
	imgSwitch: "",
	hasGlow: false
};

function loadImage(path, x, y) {
	let img = new Image(x, y);
	img.src = path;
	return img;
}

var player_spritesheet = loadImage("img/player/original_spritesheet.png", 256, 384);
var player_imgs = {
	"idleleft": { x: 0, y: 0 },
	"idleright": { x: 128, y: 0 },
	"idlelightleft": { x: 0, y: 32 },
	"idlelightright": { x: 128, y: 32 },
	"runleft": { x: 0, y: 64 },
	"runright": { x: 128, y: 64 },
	"runlightleft": { x: 0, y: 96 },
	"runlightright": { x: 128, y: 96 },
	"exhaustedleft": { x: 0, y: 128 },
	"exhaustedright": { x: 128, y: 128 },
	"crouchleft": { x: 0, y: 160 },
	"crouchright": { x: 128, y: 160 },
	"jumpleft": { x: 0, y: 192 },
	"jumpright": { x: 128, y: 192 },
	"light": { x: 0, y: 224, sizeX: 160, sizeY: 160 }
};


var tile_spritesheet = loadImage("img/tiles/tile_spritesheet.png", 224, 128);
var tile_imgs = {
	"clear": { x: 0, y: 0 },
	"city_border": { x: 32, y: 0 },
	"city_border_half": { x: 32, y: 0, sizeY: 16 },
	"city_block": { x: 64, y: 0 },
	"city_block_half": { x: 64, y: 0, sizeY: 16},
	"factory_border": { x: 96, y: 0 },
	"factory_border_half": { x: 96, y: 0, sizeY: 16 },
	"factory_floor": { x: 128, y: 0 },
	"factory_floor_half": { x: 128, y: 0, sizeY: 16 },
	"subway_border": { x: 160, y: 0 },
	"subway_border_half": { x: 160, y: 0, sizeY: 16 },
	"subway_border_cracked": { x: 192, y: 64 },
	"subway_block": { x: 192, y: 0 },
	"subway_block_half": { x: 192, y: 0, sizeY: 16 },
	"red_door": { x: 32, y: 32 },
	"blue_door": { x: 64, y: 32 },
	"green_door": { x: 96, y: 32 },
	"original_door": { x: 0, y: 32 },
	"battery": { x: 0, y: 64 },
	"lantern_1": { x: 32, y: 64 },
	"lantern_2": { x: 64, y: 64 },
	"lantern_3": { x: 96, y: 64 },
	"lantern_4": { x: 128, y: 64 },
	"lantern_5": { x: 160, y: 64 },
	"trampoline": { x: 128, y: 48, sizeY: 16 },
	"grandma_wallpaper": { x: 160, y: 32 },
	"grandma_wallpaper_half": { x: 160, y: 48, sizeY: 16 },
	"button_off": { x: 0, y: 95, sizeY: 16 },
	"button_on": { x: 0, y: 112, sizeY: 16 },
	"glow_small": { x: 192, y: 32, sizeX: 32, sizeY: 32 },
	"glow": { x: 64, y: 96, sizeX: 160, sizeY: 160 }
};
// add default sizes if missing
Object.keys(tile_imgs).forEach(function(key) {
	if(typeof tile_imgs[key].sizeX === "undefined") {
		tile_imgs[key].sizeX = tileRef.sizeX;
	}
	if(typeof tile_imgs[key].sizeY === "undefined") {
		tile_imgs[key].sizeY = tileRef.sizeY;
	}
});

var title_imgs = {
	"splash": loadImage("img/titles/HurrrrDeerStudios2.png", 640, 480),
	"title": loadImage("img/titles/title.png", 640, 480),
	"instructions": loadImage("img/titles/instructions.png", 640, 480),
	"story": loadImage("img/titles/story.png", 640, 480),
	"credits": loadImage("img/titles/credits.png", 640, 480),
	"gameover": loadImage("img/titles/game_over.png", 640, 480),
	"victory": loadImage("img/titles/victory.png", 640, 480)
};

var music_tracks = {
	"none": "",
	"title": "audio/music/existential_dread_0.mp3",
	"hopeless": "audio/music/hopeless_1.mp3",
	"fear_rising": "audio/music/fear_rising_2.mp3",
	"fear_rising_reversed": "audio/music/fear_rising_reversed.mp3",
	"dreams_into_darkness": "audio/music/dreams_into_darkness_3.mp3"
};

var map = {
	x: 0,
	y: 0,
	floorX: 1024,
	floorY: 1024,
	screenX: 640,
	screenY: 480,
	collisionThresholdX: 10,
	clippingX: 1.01,
	gravityOn: true,
	gravitySpeed: 15,
	background: null,
	backgroundColor: null,
	tickMS: 100,
	passedMS: 0,
	totalMS: 0,
	alpha: 1,
	fadeImg: "",
	firstMapOriginal: "maps/original/map1.txt",
	firstMapPhase2: "maps/phase2/pacer.txt",
	firstMapTutorial: "maps/tutorial.txt",
	nextMap: "",
	condType: "",
	cond: "",
	tiles: [],
	tileMap: {},
	batteries: [],
	glowList: [],
	glowLightSize: 128,
	glowLightRender: 224,
	level: 0,
	overlayAlpha: 0.3,
	overlayAlphaReset: 0.3,
	overlayColor: "#000",
	overlayColorReset: "#000",
	batteryDrain: 1
};

var player = {
	img: "idleleft",
	imgTick: 0,//0-3
	imgTickMax: 3,
	isLeft: true,
	x: 64,
	y: 64,
	sizeX: 32,
	sizeY: 32,
	speed: 0,
	defaultSpeed: 5,
	defaultSprintSpeed: 7,
	defaultSprintJumpSpeed: -20,
	isSprinting: false,
	isJumping: false,
	lastX: 0,
	lastY: 0,
	vertSpeed: 0,
	statMax: 1000,
	health: 1000,
	stamina: 1000,
	sprintJumpStaminaCost: 200,
	isExhausted: false,
	exhaustedTicks: 6,
	exhaustedTicksMax: 6,
	lanternParts: 0,
	maxLanternParts: 5,
	batteryCharge: 250,
	batteryRefill: 250,
	lanternOn: false,
	inDarkness: false,
	inSafeZone: false,
	lanternLightSize: 96
};

var darkness = {
	id: 0,
	x1: 0,//left
	y1: 0,//top
	x2: 0,//right
	y2: 0,//bottom
	dir: "up", //up, down, left, right
	condType: "time", //lantern
	cond: "30", // 3
	speed: 1,
	damage: 1,
	condPosition: {
		x: 0,
		y: 0,
		handoff: true
	},
	condActivate: {
		x: 0,
		y: 0,
		type: "a",
		activate: true
	}
};

var darknesses = {
	instructions: [], // list of darkness objects loaded with the map
	darkness: [] // active darkness objects
};


function playSound(path) {
	if(isSoundEnabled && !debug) {
		sfx.pause();
		sfx.currentTime = 0;
		sfx.src = path;
		sfx.play();
	}
}
function loopSound(path) {
	if(isSoundEnabled && !debug) {
		sfx.loop = true;
		sfx.currentTime = 0;
		sfx.src = path;
		sfx.play();
	}
}
function stopSound() {
	sfx.pause();
	sfx.currentTime = 0;
}
function loopMusic(path) {
	if(isSoundEnabled && !debug) {
		music.pause();
		music.currentTime = 0;
		music.src = path;
		music.loop = true;
		music.play();
	}
}
function stopMusic() {
	music.pause();
	music.currentTime = 0;
}
function startMusic() {
	if(isSoundEnabled && !debug) {
		music.play();
		music.currentTime = 0;
	}
}
function toggleSounds() {
	isSoundEnabled = !isSoundEnabled;
	if(isSoundEnabled) {
		document.getElementById("togglesound").className = "green";
		startMusic();
	}else {
		document.getElementById("togglesound").className = "red";
		stopMusic();
	}
}

function formatRuntime(runTime) {
	let total = (runTime/1000);
	let result = "";
	if(total > 60) {
		runTimeMinutes = total / 60;
		runTimeSeconds = (runTimeMinutes % 1) * 60;
		result = ("" + Math.floor(runTimeMinutes)).padStart(2, "0") + ":" + ("" + Math.floor(runTimeSeconds)).padStart(2, "0") + (runTimeSeconds % 1).toFixed(2).substring(1);
	}else {
		result = "00:" + ("" + Math.floor(total)).padStart(2, "0") + (total % 1).toFixed(2).substring(1);
	}
	return result;
}

// sfx
var sfx = new Audio();
// TODO: fix clank.mp3 distortion
var gong = "audio/sfx/clank.wav";
var hurrrr = "audio/sfx/hurrrr.mp3";

// music
var music = new Audio();

// 100ms tick
var ctick = 0;
var ctock = 0;

// regular game tick
var tick = 60;
var tickRate = 1000/tick;
var aStartTime = 0;
var aCurrentTick = 0, aLastTick = 0, aDeltaTick = 0;
