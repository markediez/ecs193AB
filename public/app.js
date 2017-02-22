$(document).ready(function() {
	console.log("Hello World");

	var options = {
		video: true,
		audio: true
	}

	navigator.mediaDevices.getUserMedia(options).then(handleSuccess).catch(handleError);
});

function handleSuccess(stream) {
	var video = document.querySelector('video');
	window.stream = stream;
	video.src = window.URL.createObjectURL(stream);
}

function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}
