var wavelet = [
    [ 111.406,      0, 20.625, -20.625,   77.5,      0,      0,  -77.5 ],
    [ -8.28125,      0, 19.0625, -19.0625,    -20,    -85,     85,     20 ],
    [ 23.125, 23.125, 30.625, -30.625,    -50,  18.75, -18.75,     50 ],
    [ -9.0625, -9.0625, -29.6875, 29.6875,   77.5,     -5,      5,  -77.5 ],
    [     25,    -25,    -25,     25,    -25,      0,      0,     25 ],
    [      0,   12.5,  -12.5,      0,      0,  -12.5,  -12.5,      0 ],
    [      0,  68.75,  68.75,      0,      0, -28.75,  28.75,      0 ],
    [    -25,     30,     30,    -25,     25,     -5,      5,    -25 ]
];

// 8x8 grid of pixels
var pixels = [
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ]
];

// 8x8 grid of divs, corresponds to the pixels above
var pixelDivs = [];
var waveletDivs = [];

(function() {
    var mouseIsDown = false;
    document.addEventListener('mousedown', function() { mouseIsDown = true; });
    document.addEventListener('mouseup', function() { mouseIsDown = false; });
    
    // initialize pixelDivs
    for(var y = 0; y < 8; y++) {
        pixelDivs.push([]);
        waveletDivs.push([]);

        for(var x = 0; x < 8; x++) {
            // eg.:
            // #pixels > .pixel16
            var pixelDiv = document.querySelector('#pixels > .pixel' + y + x);
            pixelDivs[y].push(pixelDiv);
            pixelDiv.style.opacity = 0.1;
            
            // change pixel-values when clicking on pixel block
            pixelDiv.addEventListener('mousemove', function(e) {
                if(mouseIsDown) {
                    triggerMousePixelEvent(e);
                }
            });

            pixelDiv.addEventListener('click', function(e) {
                triggerMousePixelEvent(e);
            });
            
            // wavelet grid
            var waveletDiv = document.querySelector('#wavelets > .pixel' + y + x);
            waveletDivs[y].push(waveletDiv);
            
            // change wavelet-values when clicking on wavelet block
            waveletDiv.addEventListener('mousemove', function(e) {
                if(mouseIsDown) {
                    triggerMouseWaveletEvent(e);
                }
            });

            waveletDiv.addEventListener('click', function(e) {
                triggerMouseWaveletEvent(e);
            });
        }
    }

    waveletToPixels();
    updateBlocks();
})();

function triggerMousePixelEvent(e) {
    var rect = e.target.getBoundingClientRect();
    var y = e.clientY - rect.top;  //y position within the element.

    // pixel32
    // charAt(5) == 3
    // charAt(6) == 2
    var wY = e.target.classList[0].charAt(5) - '0';
    var wX = e.target.classList[0].charAt(6) - '0';
    pixels[wY][wX] = (1 - (y / e.target.getBoundingClientRect().height)) * 256;
    console.log(pixels[wY][wX]);

    if(pixels[wY][wX] > 256)
        pixels[wY][wX] = 256;
    else if(pixels[wY][wX] < 0)
        pixels[wY][wX] = 0;
    
    pixelsToWavelet();
    updateBlocks();
}

function triggerMouseWaveletEvent(e) {
    var rect = e.target.getBoundingClientRect();
    var y = e.clientY - rect.top;  //y position within the element.

    // pixel32
    // charAt(5) == 3
    // charAt(6) == 2
    var wY = e.target.classList[0].charAt(5) - '0';
    var wX = e.target.classList[0].charAt(6) - '0';
    wavelet[wY][wX] = -1 * ((y / e.target.getBoundingClientRect().height) * 256 - 128);
    if(wavelet[wY][wX] > 128)
        wavelet[wY][wX] = 128;
    else if(wavelet[wY][wX] < -128)
        wavelet[wY][wX] = -128;
    
    waveletToPixels();
    updateBlocks();
}

function updateBlocks() {

    for(var y = 0; y < 8; y++) {
        for(var x = 0; x < 8; x++) {
            pixelDivs[y][x].style.opacity = pixels[y][x] / 255;

            var height = (100 - ((wavelet[y][x] + 128) * 100 / 256)) + '%';
            var back = 'linear-gradient(to bottom, #1e5799 0%,#1e5799 ' + height + ',#7db9e8 ' + height + ',#7db9e8 100%)'
            waveletDivs[y][x].style.background = back;
            waveletDivs[y][x].innerHTML = Math.round(wavelet[y][x]);
        }
    }
}

// wavelet -> pixels transformation
function waveletToPixels()
{
    var tmp = [
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ];

    for(var y = 0; y < 8; y++) {
        for(var x = 0; x < 8; x++) {
            pixels[y][x] = wavelet[y][x];
        }
    }

    function iwave(size) {
        var hsize = size/2;

        // vertical
        for(var y = 0; y < hsize; y++) {
            for(var x = 0; x < size; x++) {
                tmp[y*2][x] = pixels[y][x] + pixels[y+hsize][x];
                tmp[y*2+1][x] = pixels[y][x] - pixels[y+hsize][x];
            }
        }

        // horizontal
        for(var y = 0; y < size; y++) {
            for(var x = 0; x < hsize; x++) {
                pixels[y][x*2] = tmp[y][x] + tmp[y][x+hsize];
                pixels[y][x*2+1] = tmp[y][x] - tmp[y][x+hsize];
            }
        }
    }

    iwave(2);
    iwave(4);
    iwave(8);
}

// pixels -> wavelet transformation
function pixelsToWavelet() {
    var tmp = [
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ];

    for(var y = 0; y < 8; y++) {
        for(var x = 0; x < 8; x++) {
            wavelet[y][x] = pixels[y][x] - 128;
        }
    }

    function wave(size) {
        var hsize = size/2;

        // horizontal
        for(var y = 0; y < size; y++) {
            for(var x = 0; x < hsize; x++) {
                var i = x*2;
                tmp[y][x] = (wavelet[y][i] + wavelet[y][i+1]) / 2;
                tmp[y][x+hsize] = (wavelet[y][i] - wavelet[y][i+1]) / 2;
            }
        }

        // vertical
        for(var y = 0; y < hsize; y++) {
            for(var x = 0; x < size; x++) {
                var i = y*2;
                wavelet[y][x] = (tmp[i][x] + tmp[i+1][x]) / 2;
                wavelet[y+hsize][x] = (tmp[i][x] - tmp[i+1][x]) / 2;
            }
        }
    }

    wave(8);
    wave(4);
    wave(2);            
}