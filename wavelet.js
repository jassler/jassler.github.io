var wavelet = [
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    [ 0, 0, 0, 0, 0, 0, 0, 0 ]
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

function triggerMousePixelEvent(e) {
    var rect = e.target.getBoundingClientRect();
    var y = e.clientY - rect.top;  //y position within the element.

    // pixel32
    // charAt(5) == 3
    // charAt(6) == 2
    var wY = e.target.classList[0].charAt(5) - '0';
    var wX = e.target.classList[0].charAt(6) - '0';
    pixels[wY][wX] = (1 - (y / e.target.getBoundingClientRect().height)) * 256;

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

    for(var y = 0; y < 8; y++) {
        for(var x = 0; x < 8; x++) {
            pixels[y][x] += 128;
        }
    }
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


// register mouse events, save all visible pixel blocks in our pixel array
(function() {
    var mouseIsDown = false;
    document.addEventListener('mousedown', function() { mouseIsDown = true; });
    document.addEventListener('mouseup', function() { mouseIsDown = false; });

    var presetElement = document.querySelector('#presetSelection');
    var newSet = presets[presetElement.value];
    if(newSet != null) {
        pixels = presets[presetElement.value];
    }
    
    // initialize pixelDivs
    for(var y = 0; y < 8; y++) {
        pixelDivs.push([]);
        waveletDivs.push([]);

        for(var x = 0; x < 8; x++) {
            // eg.:
            // #pixels > .pixel16
            var pixelDiv = document.querySelector('#pixels > .pixel' + y + x);
            pixelDivs[y].push(pixelDiv);
            
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

    pixelsToWavelet();
    updateBlocks();

    presetElement.addEventListener('change', function() {
        mouseIsDown = false;
        var newSet = presets[presetElement.value];
        if(newSet != null) {
            pixels = newSet;
            pixelsToWavelet();
            updateBlocks();
        }
    });
})();