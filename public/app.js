var video, width, height;
var meeting = false;
var drawBounds = false;
var send = false;
var currImg = undefined;
var fps = 0.25;
var interval = 1000 / fps;

// Drawing bounding box
var dragging = false;
var coordSrc, coordEnd;
var canvas, ctx;
var bg;

$(document).ready(function() {
	width = $("video").width();
	height = $("video").height();
	video = document.querySelector('video');
	canvas = document.querySelector("#meeting_canvas");
	ctx = canvas.getContext("2d");

	var options = {
		video: {
			width: 1200,
			height: 1200
		}
	}

	canvas.width = width;
	canvas.height = height;

	navigator.mediaDevices.getUserMedia(options).then(handleSuccess).catch(handleError);
	setEventListeners();
});

function handleSuccess(stream) {
	window.stream = stream;
	video.src = window.URL.createObjectURL(stream);
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}

function takeSnapshot() {
	if (window.stream) {
		var data = canvas.toDataURL();
		var fn = "IMG_" + Date.now() + ".png";
		$("#sent_image").attr("src", data);
		// UPLOAD
		$.post({
			url: "/remove",
			data: {
				img: data,
				filename: fn
			},
			success: function(data, result, xhr) {
				console.log("HOORAH");
				if (currImg == undefined || currImg != data.img) {
					currImg = data.img
					$("#server-image").attr("src", currImg);
				}
			},
			error: function(data, result, xhr) {
				console.log("ERRROR");
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
		// $("video").hide();
		// $("#meeting_canvas").show();
		specifyWhiteboardBounds();
		
		// Set 
		$(this).off("click");
		$(this).html("Save bounds");
		$(this).on("click", function(e) {
			$(this).off("click");
			// Send coordinates
			// $.post({
			// 	url: "/sendBox",
			// 	data: {
			// 		x: coordSrc.x,
			//		y: coordSrc.y,
			//		width: coordEnd.x,
			//		height: coordEnd.y
			// 	},
			// 	success: function(data, result, xhr) {
			// 		console.log("HOORAH, Bounding Box Saved");
			// 	},
			// 	error: function(data, result, xhr) {
			// 		console.error("Error saving bounding box");
			// 	}
			// });
			// $("#meeting_canvas").hide();
			// $("video").show();

			// turn off event listeners
			$(canvas).off("mousedown");
			$(canvas).off("mouseup");
			$(canvas).off("mouseover");
			$(canvas).off("mouseout");


			$(this).html("Set bounding box");
			setDrawBounds();
		});
	});
}

function setEventListeners() {
	// Start Meeting
	setDrawBounds();
	
	// Take Snapshots
	$("#start-meeting").on("click", function(e){
		send = true;
		// takeSnapshot();
		beginSnapshot();
	});

	// Stop Meeting
	$("#stop-meeting").on("click", function(e) {
		meeting = false;
		send = false;
		drawBounds = false;
	});
}

function specifyWhiteboardBounds() {
	var v = $("video");
	var context = canvas.getContext('2d');
	ctx = canvas.getContext("2d");

	// console.log(v.width() + " " + v.height());
	if (window.stream) {
		canvas.width = v.width();
		canvas.height = v.height();
		context.canvas.height = v.height();
		context.canvas.width = v.width();

		context.drawImage(video, 0, 0, v.width(), v.height());
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
			}
			updateCanvas();
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
	canvasPoint.x *= this.width;
	canvasPoint.y *= this.height;

	return canvasPoint;
}
