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
		var data = canvas.toDataURL('image/jpeg')
		context.drawImage(video, 0, 0, v.width(), v.height());
		
		// UPLOAD
		$.post({
			url: "/remove",
			imgBase64: data,
			success: function(data, result, xhr) {
				console.log("HOORAH");
			},
			error: function(data, result, xhr) {
				console.log("ERRROR");
			}
		});
	}
}

function setEventListeners() {
	// Take Snapshots
	$("#snapshot").on("click", function(e){
		takeSnapshot();
	});
}
