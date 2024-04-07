window.onload = function () {
    var canvas1 = document.getElementById("myCanvas1");
    var context1 = canvas1.getContext("2d");

    var canvas2 = document.getElementById("myCanvas2");
    var context2 = canvas2.getContext("2d");

    var video = document.getElementById("myVideo");
    var slider = document.getElementById("intensity");
    var button = document.getElementById("myButton");

    var threshold = 300;

    // Thêm sự kiện cho input để tải lên video mới
    var videoInput = document.getElementById("videoInput");
    videoInput.addEventListener("change", function (event) {
        var file = event.target.files[0];
        var url = URL.createObjectURL(file);
        video.src = url;
    });

    // Các sự kiện xử lý như trước

    button.onclick = function () {
        if (video.paused) {
            video.play();
            button.innerHTML = "Pause";
        } else {
            video.pause();
            button.innerHTML = "Play";
        }
    };

    slider.oninput = function () {
        threshold = 500 - parseInt(slider.value);
    };

    video.oncanplay = function () {
        var vid = this;
        canvas1.width = canvas2.width = vid.videoWidth;
        canvas1.height = canvas2.height = vid.videoHeight;
        button.disabled = false;
    };

    video.onplay = function () {
        var vid = this;
        (function loop() {
            if (!vid.paused && !vid.ended) {
                context1.drawImage(vid, 0, 0);
                var frameData = context1.getImageData(0, 0, vid.videoWidth, vid.videoHeight);
                var frameEdge = sobel(frameData, threshold);
                context2.putImageData(frameEdge, 0, 0);
                setTimeout(loop, 1000 / 30);
            }
        })();
    };

    video.onended = function () {
        button.innerHTML = "Play";
    };
};


function sobel(imgData, th) {

    //Some image information
    var row = imgData.height;
    var col = imgData.width;

    var rowStep = col * 4;
    var colStep = 4;

    var data = imgData.data;

    var newImgData = new ImageData(col, row);

    //Loop for each pixel
    for (var i = 1; i < row - 1; i += 1)
        for (var j = 1; j < col - 1; j += 1) {

            //Current position
            var center = i * rowStep + j * colStep;

            //Get value of 8 neighbor pixels (green channel)
            var topLeft = data[center - rowStep - colStep + 1];
            var top = data[center - rowStep + 1];
            var topRight = data[center - rowStep + colStep + 1];
            var left = data[center - colStep + 1];
            var right = data[center + colStep + 1];
            var bottomLeft = data[center + rowStep - colStep + 1];
            var bottom = data[center + rowStep + 1];
            var bottomRight = data[center + rowStep + colStep + 1];

            //Calculate the gradient
            var dx = (topRight - topLeft) + 2 * (right - left) + (bottomRight - bottomLeft);
            var dy = (bottomLeft - topLeft) + 2 * (bottom - top) + (bottomRight - topRight);
            var grad = Math.sqrt(dx * dx + dy * dy);

            //Thresholding
            if (grad >= th)
                newImgData.data[center] = newImgData.data[center + 1] = newImgData.data[center + 2] = 255;
            else
                newImgData.data[center] = newImgData.data[center + 1] = newImgData.data[center + 2] = 0;

            newImgData.data[center + 3] = 255;
        }

    return newImgData;
}


particlesJS.load('particles-js', 'particlesjs-config.json', function() {
    console.log('particles.js loaded');
});