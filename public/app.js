var fps = 0.25;
var interval = 1000 / fps;
var queryInterval = 1000 / 2;

// Actions
var meeting = false;
var send = false;
var getContent = false;

// Drawing bounding box & Video
var video, vw, vh;
var dragging = false;
var currImg = undefined;
var coordSrc, coordEnd;
var canvas, ctx;
var bg;

$(document).ready(function() {
	updateMedia();
	canvas.width = $(video).width();
	canvas.height = $(video).height()

	navigator.mediaDevices.getUserMedia({video: true}).then(handleSuccess).catch(handleError);
	setEventListeners();
});

function updateMedia() {
	video = $("#video-src")[0];
	vw = $(video).width();
	vh = $(video).height();

	canvas = $("#meeting-canvas")[0];
	ctx = canvas.getContext("2d");
}

function handleSuccess(stream) {
	window.stream = stream;
	video.src = window.URL.createObjectURL(stream);
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}

function takeSnapshot() {
	if (window.stream) {
		ctx = canvas.getContext("2d");
		ctx.drawImage(video, 0, 0, $(video).width(), $(video).height());
		var data = canvas.toDataURL();
		var fn = "IMG_" + Date.now() + ".png";
		$("#sent-image").attr("src", data);
		// UPLOAD
		$.post({
			url: "/remove",
			data: {
				img: data,
				filename: fn
			},
			success: function(data, result, xhr) {
				console.log("HOORAH SENT AND SAVED");

			},
			error: function(data, result, xhr) {
				console.log("ERRROR COULD NOT SAVE IMG");
			}
		});
	}
}

function beginSnapshot() {
	if (send) {
		setTimeout(function() {
			takeSnapshot();
			beginSnapshot();
		}, 1000);
	}
}


function setDrawBounds() {
	$("#draw-bounds").on("click", function(e) {
		specifyWhiteboardBounds();

		// Set
		$(this).off("click");
		$(this).html("Save bounds");
		$(this).on("click", function(e) {
			// Send coordinates
			if (coordSrc != undefined && coordEnd != undefined) {
				$(this).off("click");
				$.post({
					url: "/send_box",
					data: {
						x: coordSrc.x,
						y: coordSrc.y,
						width: coordEnd.x,
						height: coordEnd.y
					},
					success: function(data, result, xhr) {
						console.log("HOORAH, Bounding Box Saved");
					},
					error: function(data, result, xhr) {
						console.error("Error saving bounding box");
					}
				});

				// turn off event listeners
				$(canvas).off("mousedown");
				$(canvas).off("mouseup");
				$(canvas).off("mouseover");
				$(canvas).off("mouseout");


				$(this).html("Set bounding box");
				setDrawBounds();
			} else {
				console.error("Attempted to set non-existing bounds");
			}

		});
	});
}

function setEventListeners() {
	// Start Meeting
	setDrawBounds();

	// Take Snapshots
	$("#start-meeting").on("click", function(e){
		send = true;
		getContent = true;
		// takeSnapshot();
		beginSnapshot();
		beginQuery();
	});

	// Stop Meeting
	$("#stop-meeting").on("click", function(e) {
		getContent = false;
		meeting = false;
		send = false;
	});
}

function beginQuery() {
	$.get({
		url: "/get_content",
		success: function(data, result, xhr) {
			console.log("Should get something...");
			if (currImg == undefined || currImg != data.img) {
				currImg = data.img
				$("#server-image").attr("src", currImg);
			}
		},
		error: function(data, result, xhr) {
			console.error("Could not query");
		}
	});

	if (getContent) {
		setTimeout(function() {
			beginQuery();
		}, queryInterval);
	}
}

function specifyWhiteboardBounds() {
	if (window.stream) {
		ctx.drawImage(video, 0, 0, vw, vh);
		bg = new Image;
		bg.src = canvas.toDataURL()

		// Draw bounding box if it exists
		if (coordSrc != undefined || coordEnd != undefined) {
			updateCanvas();
		}

		// Events to draw the region
		$(canvas).mousedown(function(e) {
			coordSrc = getCanvasPos({ x: e.pageX, y: e.pageY }, this);
			dragging = true;
		});

		$(canvas).mouseup(function(e) {
			coordEnd = getCanvasPos({x: e.pageX, y: e.pageY}, this);
			dragging = false;
		});

		$(canvas).mousemove(function(e) {
			if(dragging) {
				coordEnd = getCanvasPos({x: e.pageX, y: e.pageY}, this);
				updateCanvas();
			}
		});

		$(canvas).mouseout(function(e) {
			if (dragging) {
				if (e.pageX > this.width + this.offsetLeft) {
					coordEnd = getCanvasPos({x: this.width, y: e.pageY}, this);
				}

				if (e.pageY > this.height + this.offsetTop) {
					coordEnd = getCanvasPos({x: e.pageX, y: this.height}, this);
				}

				updateCanvas();
			}
		});
	} else {
		console.error("Stream is null");
	}
}

// Animates drawing rectangle
function updateCanvas() {
	ctx.drawImage(bg, 0, 0);
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 5;
	ctx.strokeRect(coordSrc.x, coordSrc.y, coordEnd.x - coordSrc.x, coordEnd.y - coordSrc.y);
}

// Change of coordinate system from World -> NDC -> Canvas
// Returns the coordinates for the canvas
function getCanvasPos(world, canvas) {
	var canvasPoint = {};
	canvasPoint.x = 0;
	canvasPoint.y = 0;

	// World Coordinates
	canvasPoint.x = world.x - canvas.offsetLeft;
	canvasPoint.y = world.y - canvas.offsetTop;

	// NDC
	canvasPoint.x /= $(canvas).width();
	canvasPoint.y /= $(canvas).height();

	// Canvas Land
	canvasPoint.x *= canvas.width;
	canvasPoint.y *= canvas.height;

	return canvasPoint;
}
