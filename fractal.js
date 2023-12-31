var c = document.getElementById('c');
var ctx = c.getContext('2d');
var W = c.width;
var H = c.height;

var imgData = ctx.createImageData(W,H);
var buf = imgData.data;
function setPx(x,y, r,g,b) {
    if (x < 0 || x >= W || y < 0 || y >= H)
        return;

    var ind = 4 * (Math.floor(y)*W + Math.floor(x));

    buf[ind++] = r;
    buf[ind++] = g;
    buf[ind++] = b;
    buf[ind]   = 0xff;
}

// ---
var offx = 0;
var offi = 0;

var dynamic = true;
var zoom = 3;
var depth = 100;
var bound = Infinity;
var bound2 = bound*bound;
// function square(z) {
//     var real = z.real;
//     var imaginary = z.imaginary;

//     z.real = real*real - imaginary*imaginary;
//     // if (imaginary === 0)
//     //     z.imaginary = 0;
//     // else
//         z.imaginary = 2*(real*Math.abs(imaginary));
// }
function abs(z) {
    return Math.sqrt(z.real*z.real + z.imaginary*z.imaginary);
}
function abs2(z) {
    return z.real*z.real + z.imaginary*z.imaginary;
}
// function iterate_m(z, cr, ci) {
//     square(z);
//     z.real += cr;
//     z.imaginary += ci;
// }
    
function shader(range) {
    return 0|(0xff*range); // dark mode
}
function render_image(done=()=>{}) {
    var x = 0;
    var y = 0;
    var halfwaydone = false;
    for (var x = 0; x < W; x += 1) {
        var cr = ((x)/W - 0.5) * zoom + offx;
        if (halfwaydone === false && x > W*0.5) {
            halfwaydone = true;
            console.log('halfway done');
        }
        for (var y = 0; y < H; y += 1) {
            var ci = ((y)/H - 0.5) * zoom - offi;

            var z = {real: 0, imaginary: 0};
            var d = 0;
            var breaches = 0;
            while (d++ < depth && abs2(z) <= bound2) {
                iterate_m(z, cr, ci);
            }

            var color = shader(d/depth);
            setPx((x), (y), color,color,color);
        };
    };

    ctx.putImageData(imgData, 0,0);
    done();
}
// ---
document.write('<br>done');

var image_i = 0;
var image_total = Infinity;
var image_zoom_increment = 0.98;

// function onDone() {
//     // var img = document.createElement('img');
//     // img.src = c.toDataURL();
//     // document.body.appendChild(img);

//     if (++image_i <= image_total) {
//         zoom *= image_zoom_increment;
//         setTimeout(() => render_image(onDone), 0);
//     }
// }
// render_image(onDone);

c.oncontextmenu = function(e) {
    return false;
};
c.onmousedown = function(e) {
    var rect = c.getBoundingClientRect();
    var increment = 0.5;

    var x = ((e.x - rect.left) - W/2) / (W);
    var y = ((e.y - rect.top) - H/2) / (H);

    if (e.button === 0) {
        console.log(x*zoom + offx, -y*zoom - offi);
        render_image();
        return;
    }
    else {
        zoom *= increment;
        offx += x * zoom;
        offi -= y * zoom;
        render_image();
        return false;
    }

};