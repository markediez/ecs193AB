var video, canvas;

$(document).ready(function() {
	video = document.querySelector('video');
	canvas = document.querySelector('canvas');
	var options = {
		video: true,
		audio: true
	}

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
	var context = canvas.getContext('2d');
	if (window.stream) {
		context.drawImage(video, 0, 0);
		document.querySelector('img').src = canvas.toDataURL('image/webp');
	}
}

function setEventListeners() {
	// Take Snapshots
	$("#snapshot").on("click", function(e){
		takeSnapshot();
	});
}
