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

// evt -> mouse event that was triggered. Need it for y position inside pixel / wavelet block
// min -> min value that can appear in block (eg. pixel should start at 0, wavelet at -128)
// max -> max value that can appear in block (eg. pixel shouldn't be more than 255)
// matrix -> 8x8 matrix that is affected, either pixel or wavelet
// transformFunc -> transformation function, either wavelet to pixels or vice versa
function triggerMouseEvent(evt, min, max, matrix, transformFunc) {
    var rect = evt.target.getBoundingClientRect();
    
    // relative y-position to element
    // 0 -> very top
    // 1 -> very bottom
    var y = (evt.clientY - rect.top) / rect.height;

    var range = max - min;

    // y- and x-position of pixel can be determined through the class name
    // eg. if class name is "pixel32"
    // charAt(5) == 3
    // charAt(6) == 2
    var wY = evt.target.classList[0].charAt(5) - '0';
    var wX = evt.target.classList[0].charAt(6) - '0';
    matrix[wY][wX] = (1 - y) * range + min;

    if(matrix[wY][wX] > max)
        matrix[wY][wX] = max;
    else if(matrix[wY][wX] < min)
        matrix[wY][wX] = min;
    
    transformFunc();
    updateBlocks();
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

// deep copy 8x8 matrix
function deepCopy(from, to) {
    if(from == null || to == null)
        return;

    for(var y = 0; y < 8; y++) {
        for(var x = 0; x < 8; x++) {
            to[y][x] = from[y][x];
        }
    }
}

function updateBlocks() {		

    for(var y = 0; y < 8; y++) {
        for(var x = 0; x < 8; x++) {
            pixelDivs[y][x].style.opacity = pixels[y][x] / 255;

            var height = (100 - ((wavelet[y][x] + 128) * 100 / 256)) + '%';
            var back = 'linear-gradient(to bottom, #1e5799 0%,#1e5799 ' + height + ',#7db9e8 ' + height + ',#7db9e8 100%)';
            waveletDivs[y][x].style.background = back;
            waveletDivs[y][x].innerHTML = Math.round(wavelet[y][x]);
        }
    }
}


// register mouse events, save all visible pixel blocks in our pixel array
(function() {
    var mouseIsDown = false;
    document.addEventListener('mousedown', function() { mouseIsDown = true; });
    document.addEventListener('mouseup', function() { mouseIsDown = false; });

    // option selection from dropdown list
    // usually starts with smiley face
    var presetElement = document.querySelector('#presetSelection');
    deepCopy(presets[presetElement.value], pixels);
    
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
                    triggerMouseEvent(e, 0, 255, pixels, pixelsToWavelet);
                }
            });

            pixelDiv.addEventListener('click', function(e) {
                triggerMouseEvent(e, 0, 255, pixels, pixelsToWavelet);
            });
            
            // wavelet grid
            var waveletDiv = document.querySelector('#wavelets > .pixel' + y + x);
            waveletDivs[y].push(waveletDiv);
            
            // change wavelet-values when clicking on wavelet block
            waveletDiv.addEventListener('mousemove', function(e) {
                if(mouseIsDown) {
                    triggerMouseEvent(e, -128, 128, wavelet, waveletToPixels);
                }
            });

            waveletDiv.addEventListener('click', function(e) {
                triggerMouseEvent(e, -128, 128, wavelet, waveletToPixels);
            });
        }
    }

    pixelsToWavelet();
    updateBlocks();

    presetElement.addEventListener('change', function() {

        // prevent but where mouse is registered as clicked
        // even though we only registered a selection change
        mouseIsDown = false;

        deepCopy(presets[presetElement.value], pixels);
        pixelsToWavelet();
        updateBlocks();
    });
})();
