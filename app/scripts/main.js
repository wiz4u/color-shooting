'use strict';

var video = $('#viewfinder')[0];
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var localMediaStream = null;

// { colorName, R, G, B }
var colors = [
  { name : 'blue',   R : 0,    G : 0,    B : 0xff },
  { name : 'red' ,   R : 0xff, G : 0,    B : 0 },
  { name : 'yellow', R : 0xff, G : 0xff, B : 0 },
  { name : 'orange', R : 0xff, G : 0xa5, B : 0 },
  { name : 'green',  R : 0,    G : 0x80, B : 0 }
];

var currentIndex = 0;

var question = $('#question')[0];
var questionContext = question.getContext('2d');
var updateQuestion = function() {
    var color = colors[currentIndex];

    questionContext.beginPath();
    questionContext.fillStyle = 'rgb(' + color.R + ',' + color.G + ',' + color.B + ')';
    questionContext.arc(50, 50, 10, 0, Math.PI*2, false);
    questionContext.fill();

    currentIndex = (currentIndex + 1) % colors.length;
};

var hasGetUserMedia = function() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
};

var onGetUserMedia = function(stream) {
    video.src = window.URL.createObjectURL(stream);
    localMediaStream = stream;
};

var onFailSoHard = function(e) {
    console.log('エラー!', e);
};

var calcColorDist = function(col1, col2) {
    // 2乗和のルートで距離を出す
    var diffR = col1[0] - col2[0];
    var diffG = col1[1] - col2[1];
    var diffB = col1[2] - col2[2];

    return Math.sqrt((diffR * diffR) + (diffG * diffG) + (diffB * diffB));
};

var judge = function(colorDist) {

    var threshold = 50;

    var result = $('#judgement')[0];
    if (colorDist <= threshold) {
        result.textContent = 'OK';
    } else {
        result.textContent = 'NG';
    }

    // Debug
    $('#colordump')[0].textContent = colorDist;
};

var snapshot = function() {
    if (localMediaStream) {
        var videoWidth = video.videoWidth;
        var videoHeight = video.videoHeight;

        // Viewfinderの中心1ピクセルを取ってくる
        // (取ってきてとりあえず表示してみる)
        ctx.drawImage(video,
            videoWidth/2, videoHeight/2, 1, 1,
            0, 0, 640, 480);

        document.querySelector('img').src = canvas.toDataURL('image/webp');

        // 撮影したものの中心のピクセルの色情報
        var capturedColor = ctx.getImageData(0, 0, 1, 1).data;

        // 問題の色情報
        var questionColor = questionContext.getImageData(50, 50, 1, 1).data;

        var dist = calcColorDist(capturedColor, questionColor);
        judge(dist);
        updateQuestion();
    }
};

if (!hasGetUserMedia()) {
    window.alert('未対応ブラウザです');
}

window.URL = window.URL || window.webkitURL;
navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia || navigator.msGetUserMedia;

navigator.getUserMedia({video: true}, onGetUserMedia, onFailSoHard);

updateQuestion();

$('#capture').click(function() {
    snapshot();
});
