var video, canvas, width, height;
var meeting = false;
var currImg = undefined;

$(document).ready(function() {
	width = $("video").width();
	height = $("video").height();
	video = document.querySelector('video');
	canvas = document.querySelector('canvas');
	var options = {
		video: {
			width: 1200,
			height: 1200
		},
		audio: true
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
	var v = $("video");
	var context = canvas.getContext('2d');

	console.log(v.width() + " " + v.height());
	if (window.stream) {
		context.canvas.height = v.height();
		context.canvas.width = v.width();
		context.drawImage(video, 0, 0, v.width(), v.height());
		var data = $("canvas")[0].toDataURL();
		var fn = "IMG_" + Date.now() + ".png";
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
	if (meeting) {
		setTimeout(function() {
			takeSnapshot();
			beginSnapshot();
		}, 250);
	}
}

function setEventListeners() {
	// Take Snapshots
	$("#snapshot").on("click", function(e){
		// takeSnapshot();
		meeting = true;
		beginSnapshot();
	});

	// Stop Meeting
	$("#stop-meeting").on("click", function(e) {
		meeting = false;
	});
}
