/**
 * Created by Yunzhe on 2017/9/30.
 */

'use strict';
let cursor_show = false;
let isrunning = false;
let cursor_r_min = 30;
let cursor_r_max = 100;
let segment_r_min = 5;
let segment_r_max = 15;
let segment_d_min = 5;
let segment_d_max = 50;
let segment_velocity_times = 0.5;

class Segment {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI;
        this.r = Math.random() * (segment_r_max - segment_r_min) + segment_r_min;
        this._mx = (Math.random() - 0.5) * 2 * segment_velocity_times;
        this._my = (Math.random() - 0.5) * 2 * segment_velocity_times;
        this.velocity = Math.sqrt(this._mx * this._mx + this._my * this._my);
    }

    drawSegment(ctx) {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(0, -this.r);
        ctx.lineTo(0, this.r);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(204, 204, 204, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.rotate(-this.angle);
        ctx.translate(-this.x, -this.y);
    }

    drawLine(ctx, _Segment) {
        let dx = Math.abs(this.x - _Segment.x);
        let dy = Math.abs(this.y - _Segment.y);
        if (dx < segment_d_max && dy < segment_d_max){
            let d = Math.sqrt(dx * dx + dy * dy);
            if (d > segment_d_min && d < segment_d_max) {
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(_Segment.x, _Segment.y);
                ctx.closePath();
                let dd =(segment_d_max - segment_d_min);
                if (d <= dd / 2) {
                    ctx.strokeStyle = 'rgba(204, 204, 204, ' + ((d - (segment_d_max + segment_d_min) / 2) / dd + 0.5) + ')';
                }
                else {
                    ctx.strokeStyle = 'rgba(204, 204, 204, ' + (0.5 - (d - (segment_d_max + segment_d_min) / 2) / dd) + ')';
                }
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    move(w, h) {
        this._mx = (this.x < w && this.x > 0) ? this._mx : (-this._mx);
        this._my = (this.y < h && this.y > 0) ? this._my : (-this._my);
        this.x += this._mx;
        this.y += this._my;
        this.angle += 0.02;
    }

    attracted(dx, dy, d) {
        this._mx = dx / d * this.velocity;
        this._my = dy / d * this.velocity;
    }

    scale(ratioX, ratioY) {
        this.x *= ratioX;
        this.y *= ratioY;
    }
}
class Cursor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = Math.random() * 4;
    }

    drawCursor(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 100, 0, 360);
        ctx.closePath();
        ctx.fillStyle = 'rgba(77, 255, 54, 0.6)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 50, 0, 360);
        ctx.closePath();
        ctx.fillStyle = 'rgba(54, 77, 255, 0.3)';
        ctx.fill();
    }

    attract(target) {
        let dx = this.x - target.x;
        let dy = this.y - target.y;
        if (dx > -cursor_r_max && dx < cursor_r_max && dy > -cursor_r_max && dy < cursor_r_max) {
            let d = Math.sqrt(dx * dx + dy * dy);
            if (d < cursor_r_max && d > cursor_r_min) {
                target.attracted(dx, dy, d);
            }
        }
    }
}

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

let canvas_effect = $('#canvas-effect')[0];
let ctx = canvas_effect.getContext('2d');
let w = canvas_effect.width = canvas_effect.offsetWidth;
let h = canvas_effect.height = canvas_effect.offsetHeight;
let segments = [];
let cursor = new Cursor(0, 0);
let requestId = null;
let resizeFnBox = [];
let resizeTimer = null;

let drawEffect = function () {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < segments.length; i++) {
        segments[i].move(w, h);
        segments[i].drawSegment(ctx);
        for (let j = i + 1; j < segments.length; j++) {
            segments[i].drawLine(ctx, segments[j]);
        }
    }
    if (cursor.x) {
        if (cursor_show) {
            cursor.drawCursor(ctx);
        }
        for (let k = 1; k < segments.length; k++) {
            cursor.attract(segments[k]);
        }
    }
    requestId = requestAnimationFrame(drawEffect);
};

let pauseEffect = function () {
    if (isrunning) {
        cancelAnimationFrame(requestId);
        isrunning = false;
        console.log("Effect is Paused.");
    }
};

let continueEffect = function () {
    isrunning = true;
    requestId = requestAnimationFrame(drawEffect);
    console.log("Effect is continued.");
};

let startEffect = function (num) {
    for (let i = 0; i < num; i++) {
        segments.push(new Segment(Math.random() * w, Math.random() * h));
    }
    isrunning = true;
    drawEffect();
};

window.addEventListener('load', startEffect(100));
canvas_effect.onmousemove = function (e) {
    e = e || window.event;
    cursor.x = e.clientX;
    cursor.y = e.clientY;
};
canvas_effect.onmouseout = function () {
    cursor.x = null;
    cursor.y = null;
};
window.onresize = function () {
    if (resizeTimer) {
        clearTimeout(resizeTimer);
    }
    pauseEffect();
    resizeTimer = setTimeout(function () {
        for (let i = 0;i < resizeFnBox.length;i++) {
            resizeFnBox[i]();
        }
        continueEffect();
    }, 200);
};
resizeFnBox.push(function () {
    let ratioX = canvas_effect.offsetWidth / w;
    let ratioY = canvas_effect.offsetHeight / h;
    w = canvas_effect.width = canvas_effect.offsetWidth;
    h = canvas_effect.height = canvas_effect.offsetHeight;
    for (let i = 0;i < segments.length;i++) {
        segments[i].scale(ratioX, ratioY);
    }
});
document.onkeypress = function (e) {
    if (e.keyCode === 113 || e.keyCode === 81) {
        if (isrunning) {
            pauseEffect();
        }
        else {
            continueEffect();
        }
    }
};