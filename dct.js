var pixelMin = 0;
var pixelMax = 255;
var dctMin = -512;
var dctMax = 512;

var dctMatrix = [
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
var dctDivs = [];

// precalculated weights
// first row is calculated with: sqrt(2)/4
// at row y >= 1 and column x, each index is calculated with:
// 0.5 * sum for i from 0-7 of (cos(2*i)*y*pi/16)
// (looking at the official calculation might make more sense than this)
var weights1d = [
    [ 0.3535533905932737622  , 0.3535533905932737622  , 0.3535533905932737622  , 0.3535533905932737622  , 0.3535533905932737622  , 0.3535533905932737622  , 0.3535533905932737622  , 0.3535533905932737622  ],
    [ 0.49039264020161522456 , 0.41573480615127261854 , 0.27778511650980111237 , 0.097545161008064133924,-0.097545161008064133924,-0.27778511650980111237 ,-0.41573480615127261854 ,-0.49039264020161522456 ],
    [ 0.46193976625564337806 , 0.19134171618254488586 ,-0.19134171618254488586 ,-0.46193976625564337806 ,-0.46193976625564337806 ,-0.19134171618254488586 , 0.19134171618254488586 , 0.46193976625564337806 ],
    [ 0.41573480615127261854 ,-0.097545161008064133924,-0.49039264020161522456 ,-0.27778511650980111237 , 0.27778511650980111237 , 0.49039264020161522456 , 0.097545161008064133924,-0.41573480615127261854 ],
    [ 0.3535533905932737622  ,-0.3535533905932737622  ,-0.3535533905932737622  , 0.3535533905932737622  , 0.3535533905932737622  ,-0.3535533905932737622  ,-0.3535533905932737622  , 0.3535533905932737622  ],
    [ 0.27778511650980111237 ,-0.49039264020161522456 , 0.097545161008064133924, 0.41573480615127261854 ,-0.41573480615127261854 ,-0.097545161008064133924, 0.49039264020161522456 ,-0.27778511650980111237 ],
    [ 0.19134171618254488586 ,-0.46193976625564337806 , 0.46193976625564337806 ,-0.19134171618254488586 ,-0.19134171618254488586 , 0.46193976625564337806 ,-0.46193976625564337806 , 0.19134171618254488586 ],
    [ 0.097545161008064133924,-0.27778511650980111237 , 0.41573480615127261854 ,-0.49039264020161522456 , 0.49039264020161522456 ,-0.41573480615127261854 , 0.27778511650980111237 ,-0.097545161008064133924],
];


// turns matrices such as
// | a b c |          | a d g |
// | d e f |   into   | b e h |
// | g h i |          | c f i |
function transform_matrix(m) {
    
    // transform matrix
    for(var y = 1; y < 8; y++) {
        for(var x = 0; x < y; x++) {
            var tmp = m[y][x];
            m[y][x] = m[x][y];
            m[x][y] = tmp;
        }
    }
}

function dct(F, signal) {

    for(var u=0; u<8; u++) {
        var sum = 0.0;
        for(var i=0; i<8; i++) {
            sum += weights1d[u][i]*signal[i];
        }

        F[u] = sum;
    }

}

// turn pixel signals into dct coefficients
function dct2() {
    var tmp_matrix = [
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ];
    
    for(var u = 0; u < 8; u++) {
        dct(tmp_matrix[u], pixels[u]);
    }

    // transform matrix
    transform_matrix(tmp_matrix);

    for(u = 0; u < 8; u++) {
        dct(dctMatrix[u], tmp_matrix[u]);
    }

    transform_matrix(dctMatrix);
}

function idct(signal, F) {

    for(var i=0; i<8; i++)
    {
        var sum = 0.0;
        for(var u=0; u<8; u++)
        {
            sum += weights1d[u][i]*F[u];
        }
        signal[i] = sum;
    }

}

// turn dct coefficients into pixels
function idct2() {
    var tmp_matrix = [
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 0, 0 ]
    ];

    for(var u = 0; u < 8; u++) {
        for(var v = 0; v < 8; v++) {
            // switch v and u-index so we don't have to transform it later on
            pixels[v][u] = dctMatrix[u][v];
        }
    }

    for(u = 0; u < 8; u++) {
        idct(tmp_matrix[u], pixels[u]);
    }

    transform_matrix(tmp_matrix);

    for(u = 0; u < 8; u++) {
        idct(pixels[u], tmp_matrix[u]);
    }
}

function triggerMousePixelEvent(e) {
    var rect = e.target.getBoundingClientRect();
    var y = e.clientY - rect.top;  //y position within the element.

    // pixel32
    // charAt(5) == 3
    // charAt(6) == 2
    var wY = e.target.classList[0].charAt(5) - '0';
    var wX = e.target.classList[0].charAt(6) - '0';
    pixels[wY][wX] = (1 - (y / e.target.getBoundingClientRect().height)) * (pixelMax - pixelMin) + pixelMin;

    if(pixels[wY][wX] > pixelMax)
        pixels[wY][wX] = pixelMax;
    else if(pixels[wY][wX] < pixelMin)
        pixels[wY][wX] = pixelMin;
    
    dct2();
    updateBlocks();
}

function updateBlocks() {

    for(var y = 0; y < 8; y++) {
        for(var x = 0; x < 8; x++) {
            pixelDivs[y][x].style.opacity = (pixels[y][x] - pixelMin) / (pixelMax - pixelMin);

            var height = (100 - ((dctMatrix[y][x] - dctMin) * 100 / (dctMax - dctMin))) + '%';
            var back = 'linear-gradient(to bottom, #1e5799 0%,#1e5799 ' + height + ',#7db9e8 ' + height + ',#7db9e8 100%)'
            dctDivs[y][x].style.background = back;
            dctDivs[y][x].innerHTML = Math.round(dctMatrix[y][x]);
        }
    }
}

function triggerMouseDctEvent(e) {
    var rect = e.target.getBoundingClientRect();
    var y = e.clientY - rect.top;  //y position within the element.

    // pixel32
    // charAt(5) == 3
    // charAt(6) == 2
    var wY = e.target.classList[0].charAt(5) - '0';
    var wX = e.target.classList[0].charAt(6) - '0';
    dctMatrix[wY][wX] = -1 * ((y / e.target.getBoundingClientRect().height) * (dctMax - dctMin) + dctMin);
    if(dctMatrix[wY][wX] > dctMax)
        dctMatrix[wY][wX] = dctMax;
    else if(dctMatrix[wY][wX] < dctMin)
        dctMatrix[wY][wX] = dctMin;
    
    idct2();
    updateBlocks();
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
        dctDivs.push([]);

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
            
            // dct grid
            var dctDiv = document.querySelector('#dcts > .pixel' + y + x);
            dctDivs[y].push(dctDiv);
            
            // change dct-values when clicking on dct block
            dctDiv.addEventListener('mousemove', function(e) {
                if(mouseIsDown) {
                    triggerMouseDctEvent(e);
                }
            });

            dctDiv.addEventListener('click', function(e) {
                triggerMouseDctEvent(e);
            });
        }
    }

    dct2();
    updateBlocks();

    var presetElement = document.querySelector('#presetSelection');
    presetElement.addEventListener('change', function() {
        mouseIsDown = false;
        var newSet = presets[presetElement.value];
        if(newSet != null) {
            pixels = newSet;
            dct2();
            updateBlocks();
        }
    });
})();
