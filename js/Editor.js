EditorJS = {
    init:function() {

        document.getElementById("editor-add-tile").addEventListener("click", function() {
            let template = document.getElementById("editor-tile-template").lastElementChild.cloneNode(true);
            document.getElementById("editor-tiles").appendChild(template);
        }, false);

        document.getElementById("editor-add-darkness").addEventListener("click", function() {
            let template = document.getElementById("editor-darkness-template").lastElementChild.cloneNode(true);
            document.getElementById("editor-darknesses").appendChild(template);
        }, false);

        document.querySelector("#editor-tiles").addEventListener("change", function(e) {
            if (e.target.dataset.id === "img") {
                let selectedTile = tile_imgs[e.target.value];
                let bp = selectedTile.x * -1 + "px " + selectedTile.y * -1 + "px";
                e.target.parentNode.parentNode.querySelector(".tile-preview").style.backgroundPosition = bp;
                e.target.parentNode.parentNode.querySelector(".tile-preview").style.width = selectedTile.sizeX + "px";
                e.target.parentNode.parentNode.querySelector(".tile-preview").style.height = selectedTile.sizeY + "px";
            }
        });

        /*
        document.getElementById("editor-upload").addEventListener("change", function() {
            EditorJS.readInputFile(this.files, function(text) {
                document.getElementById("editor-text").value = text;
                //TODO fill form
            });
        }, false);

        document.getElementById("editor-download").addEventListener("click", function(e) {
            e.preventDefault();
            if(e.currentTarget.href[e.currentTarget.href.length - 1] != "#") {
                e.currentTarget.href = "#";
                e.currentTarget.textContent = "Generate";
            }else {
                EditorJS.generateDownload();
                e.currentTarget.textContent = "Download";
                document.body.appendChild(e.currentTarget);
                e.currentTarget.click();
            }
        }, false);
        */

        document.getElementById("editor-advanced-toggle").addEventListener("click", function(e) {
            let enabled = e.currentTarget.dataset.enabled;
            if(enabled == "true") {
                document.getElementById("editor-text").className = "hidden";
                document.getElementById("editor-advanced-toggle").dataset.enabled = "false";
                document.getElementById("editor-advanced-toggle").className = "red";

                document.getElementById("editor-form").className = "container block";
                document.getElementById("editor-map-object").className = "container block";
                document.getElementById("editor-tile-map").className = "container block";
                document.getElementById("editor-darkness-instructions").className = "container block";
            }else {
                document.getElementById("editor-text").className = "";
                document.getElementById("editor-advanced-toggle").dataset.enabled = "true";
                document.getElementById("editor-advanced-toggle").className = "green";

                document.getElementById("editor-form").className = "hidden";
                document.getElementById("editor-map-object").className = "hidden";
                document.getElementById("editor-tile-map").className = "hidden";
                document.getElementById("editor-darkness-instructions").className = "hidden";
            }
            
        }, false);


        // populate template image dropdown
        Object.keys(tile_imgs).forEach(function(img) {
            let option = document.createElement("option");
            option.value = img;
            option.textContent = img;
            document.getElementById("editor-tile-template").querySelector(".tile-image").appendChild(option);
        });

        // populate music dropdown
        Object.keys(music_tracks).forEach(function(track) {
            let option = document.createElement("option");
            option.value = track;
            option.textContent = track;
            document.getElementById("editor-music-dropdown").appendChild(option);
        });
    }//init
    ,
    levelEditor:function(cmd) {
        switch(cmd) {
            case "render":
                document.getElementById("title").className = "hidden";
                document.getElementById("back").className = "hidden";
                document.getElementById("gameover").className = "hidden";
                document.getElementById("editor").className = '';
                break;
            case "test":
                cancelAnimationFrame(frame);

                if(document.getElementById("editor-advanced-toggle").dataset.enabled == "false") {
                    try {
                        EditorJS.compileMap();
                    }catch(e) {
                        document.getElementById("editor-messages").textContent = "ERROR: " + e;
                        return;
                    }
                }
                document.getElementById("title").className = "hidden";
                document.getElementById("back").className = "hidden";
                document.getElementById("gameover").className = "hidden";

                resetMapPlayer();
    
                if(document.getElementById("editor-toggle-flashlight").checked) {
                    player.lanternParts = 5;
                    player.batteryCharge = 1000;
                }
    
                isEditorTesting = true;
                isLoadNextMap = false;
                isGameOver = false;
                isPaused = false;

                ctick = 0;
                ctock = 0;

                LoadMapJS.loadEditorFile();

                isStarted = true;
    
                break;
            case "clear":
                document.getElementById("editor-text").value = '';
                break;
            case "exit":
                isGameOver = true;
                isEditorTesting = false;
                renderMainTitle();
                document.getElementById("editor").className = "hidden";
                break;
        }
    }//levelEditor
    ,
    removeTile:function(element) {
        document.getElementById("editor-tiles").removeChild(element.parentNode);
    }//removeTile
    ,
    removeDarkness:function(element) {
        document.getElementById("editor-darknesses").removeChild(element.parentNode);
    }//removeDarkness
    ,
    compileMap:function() {
        let savedMap = "";
        let tiles = document.getElementById("editor-tiles").children;
        for(let i = 0; i < tiles.length; i++) {
            let row = tiles[i].children;
            let symbol = '';
            let tile = {};
            for(let j = 0; j < row.length; j++) {
                for(let k = 0; k < row[j].children.length; k++) {
                    let child = row[j].children[k];
                    if(child.nodeName === "INPUT" || child.nodeName === "SELECT") {
                        switch(child.dataset.id) {
                            case "symbol":
                                symbol = child.value;
                                break;
                            case "isSolid":
                                tile["isSolid"] = child.checked;
                                break;
                            case "sizeX":
                            case "sizeY":
                            case "offsetX":
                            case "offsetY":
                                tile[child.dataset.id] = Number(child.value);
                                break;
                            default:
                                tile[child.dataset.id] = child.value;
                                break;
                        }
                    }
                }
            }
            savedMap += symbol + "=" + JSON.stringify(tile) + "\n";
        }//for tiles

        let map = document.getElementById("editor-map-object").children;
        let mapObj = {};
        for(let i = 0; i < map.length; i++) {
            if(map[i].nodeName === "DIV") {
                let row = map[i].children;
                for(let j = 0; j < row.length; j++) {
                    if(row[j].nodeName === "INPUT" || row[j].nodeName === "SELECT") {
                        switch(row[j].dataset.id) {
                            case "width":
                            case "height":
                            case "offsetX":
                            case "offsetY":
                            case "bgImgWidth":
                            case "bgImgHeight":
                            case "batteryDrain":
                                mapObj[row[j].dataset.id] = Number(row[j].value);
                                break;
                            default:
                                mapObj[row[j].dataset.id] = row[j].value;
                                break;
                        }
                    }
                }
            }
        }//for map object        
        savedMap += "MAP=" + JSON.stringify(mapObj) + "\n";
        savedMap += "START\n"
        savedMap += document.getElementById("editor-map").value;

        document.getElementById("editor-text").value = savedMap;
    }//compileMap
    ,
    generateDownload:function() {
        let text = document.getElementById("editor-text").value;
        document.getElementById("editor-download").href = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
    }//generateDownload
    ,
	readInputFile:function(fileList, callback) {
		if(typeof fileList === "undefined" || fileList.length !== 1) {
			callback("");
		}

		var fileReader = new FileReader();
		fileReader.onload = function(e) {
			callback(e.target.result);
		}
		fileReader.readAsText(fileList[0]);
	}
};