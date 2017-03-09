var video, canvas, width, height, sentCanvas;
var meeting = false;
var drawBounds = false;
var send = false;
var currImg = undefined;
var fps = 0.25;
var interval = 1000 / fps;

$(document).ready(function() {
	width = $("video").width();
	height = $("video").height();
	video = document.querySelector('video');
	canvas = document.querySelector("#meeting_canvas");
	sentCanvas = document.querySelector("#sent_canvas");
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

function setEventListeners() {
	// Start Meeting
	$("#draw-bounds").on("click", function(e) {
		drawBounds = true;
		streamVideoToCanvas();
	});
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

function streamVideoToCanvas() {
	var v = $("video");
	var context = canvas.getContext('2d');

	console.log(v.width() + " " + v.height());
	if (window.stream) {
		canvas.width = v.width();
		canvas.height = v.height();
		context.canvas.height = v.height();
		context.canvas.width = v.width();
		context.drawImage(video, 0, 0, v.width(), v.height());
	}

	if (drawBounds) {
		setTimeout(function(e) { 
			streamVideoToCanvas(); 
		}, 1000/60);
	}
}
