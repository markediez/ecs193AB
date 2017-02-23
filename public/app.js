var video, canvas, width, height;

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

//	video.setAttribute('width', width);
//	video.setAttribute('height', height);
//	canvas.setAttribute('width', width);
//	canvas.setAttribute('height', height);
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
		document.querySelector('img').src = canvas.toDataURL('image/webp');
	}
}

function setEventListeners() {
	// Take Snapshots
	$("#snapshot").on("click", function(e){
		takeSnapshot();
	});
}
