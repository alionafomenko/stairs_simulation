const BRIGHTNESS = 255;
const NUM_STEPS = 16;
const LEDS_PER_LOGICAL = 3; //WS2811
const LOGICAL_LEDS_PER_STEP = 9;
const FPS = 64;
const FRAME_MS = 1000 / FPS;
console.log('FRAME_MS:', FRAME_MS);

const LED_SIZE_W = 20;
const LED_SIZE_H = 40;
const PADDING = 2;
const WIDTH = LOGICAL_LEDS_PER_STEP * LEDS_PER_LOGICAL * (LED_SIZE_W + PADDING);
const HEIGHT = NUM_STEPS * (LED_SIZE_H + PADDING);
const HIGH = 1;
const LOW = 1;
const INPUT = 1;
const UP = 1;
const DOWN = -1;
const canvas = document.getElementById("ledCanvas");
const ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;
const SENSOR_TOP = 6;
const SENSOR_BOTTOM = 5;
document.getElementById('sensor'+SENSOR_TOP).addEventListener("mousedown", () => digitalWrite(SENSOR_TOP, 1));
document.getElementById('sensor'+SENSOR_TOP).addEventListener("mouseup", () => digitalWrite(SENSOR_TOP, 0));
document.getElementById('sensor'+SENSOR_BOTTOM).addEventListener("mousedown", () => digitalWrite(SENSOR_BOTTOM, 1));
document.getElementById('sensor'+SENSOR_BOTTOM).addEventListener("mouseup", () => digitalWrite(SENSOR_BOTTOM, 0));
document.getElementById('animation_mode').addEventListener("change", function () {
    animation_mode = this.value;
    is_start_animation = true;
    console.log("animation_mode:", animation_mode, animation_frame, direction);
});

let pins = [0,0,0,0,0, 0,0,0,0,0, 0,0];
let start_time;
function millis() {
    return Date.now() - start_time;
}
function pinMode(pin, mode) {
}
function div(val, by){
    return (val - val % by) / by;
}
function digitalWrite(pin, state) {
    pins[pin] = state;
    document.getElementById('pins').innerText = pins.join(" ");
}
function digitalRead(pin) {
    return pins[pin]
}
MAX_ILLUM = 255;
function CRGB(red, green, blue) {
    if (red > MAX_ILLUM) {
        red = MAX_ILLUM
    }
    if (red < 0) {
        red = 0
    }
    if (green > MAX_ILLUM) {
        green = MAX_ILLUM
    }
    if (green < 0) {
        green = 0
    }
    if (blue > MAX_ILLUM) {
        blue = MAX_ILLUM
    }
    if (blue < 0) {
        blue = 0
    }
    return [red, green, blue];
}
const Black = CRGB(0,0,0);
const White = CRGB(MAX_ILLUM,MAX_ILLUM,MAX_ILLUM);
const Red = CRGB(MAX_ILLUM,0,0);
const Green = CRGB(0,MAX_ILLUM,0);
const Blue = CRGB(0,0,MAX_ILLUM);

//let leds = Array(NUM_STEPS * LOGICAL_LEDS_PER_STEP).fill(`rgb(0, 0, 0)`);
let leds = Array(NUM_STEPS * LOGICAL_LEDS_PER_STEP).fill(Black);

let FastLED = {
    brightness_coef: 1,

    show: function() {
        let color_i;
        //ctx.fillStyle = "grey";
        //ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let step = 0; step < NUM_STEPS; step++) {
            for (let led_i = 0; led_i < LOGICAL_LEDS_PER_STEP; led_i++) {
                color_i = leds[step*LOGICAL_LEDS_PER_STEP + led_i];
                if (this.brightness_coef < 1) {
                    color_i = CRGB(color_i[0]*this.brightness_coef, color_i[1]*this.brightness_coef, color_i[2]*this.brightness_coef);
                }
                ctx.fillStyle = `rgb(${color_i[0]},${color_i[1]},${color_i[2]})`;
                ctx.fillRect(led_i * (LED_SIZE_W + PADDING)*3, (NUM_STEPS -1 - step) * (LED_SIZE_H + PADDING), LED_SIZE_W, LED_SIZE_H);
                ctx.fillRect(led_i * (LED_SIZE_W + PADDING)*3 + (LED_SIZE_W + PADDING-1), (NUM_STEPS -1 - step) * (LED_SIZE_H + PADDING), LED_SIZE_W, LED_SIZE_H);
                ctx.fillRect(led_i * (LED_SIZE_W + PADDING)*3 + (LED_SIZE_W + PADDING-1) *2, (NUM_STEPS -1 - step) * (LED_SIZE_H + PADDING), LED_SIZE_W, LED_SIZE_H);
            }
        }
    },
    clear: function() {
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    setBrightness: function(brightness) {
        this.brightness_coef = brightness / 255;
    }
}

run();

function run() {
    start_time = Date.now();
    setup();
    FastLED.show();
    setInterval(loop, FRAME_MS);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let animation_mode = 6;
let animation_frame = 0;
let max_animation_frame = 0;
let key_frames = 1;
let key_frame = 0;
let progress = 0;
let degress = 1-progress;
let direction = DOWN;
let last_millis = millis();
let center_num = Math.floor(LOGICAL_LEDS_PER_STEP / 2);
let step_num = 0; // 0..NUM_STEPS-1
let point_num = 0;// 0..LOGICAL_LEDS_PER_STEP-1
let is_start_animation = false;
let step_on;
let step_on_prev1;
let step_on_prev2;
let first_step;
let last_step;
let worms = [];
console.log('center_num:', center_num);


function setup() {
    /*
    FastLED.addLeds<WS2811, LED_PIN_1, GRB>(leds, 0,                          LOGICAL_LEDS_PER_STEP * 4);
    FastLED.addLeds<WS2811, LED_PIN_2, GRB>(leds, LOGICAL_LEDS_PER_STEP * 4,  LOGICAL_LEDS_PER_STEP * 4);
    FastLED.addLeds<WS2811, LED_PIN_3, GRB>(leds, LOGICAL_LEDS_PER_STEP * 8,  LOGICAL_LEDS_PER_STEP * 4);
    FastLED.addLeds<WS2811, LED_PIN_4, GRB>(leds, LOGICAL_LEDS_PER_STEP * 12, LOGICAL_LEDS_PER_STEP * 4);
    */

    FastLED.setBrightness(BRIGHTNESS);
    FastLED.clear();
    FastLED.show();

    pinMode(SENSOR_BOTTOM, INPUT);
    pinMode(SENSOR_TOP, INPUT);
}


function loop() {
    if (digitalRead(SENSOR_BOTTOM) == HIGH && animation_frame == 0) {
        direction = UP;
        is_start_animation = true;
    }
    if (digitalRead(SENSOR_TOP) == HIGH && animation_frame == 0) {
        direction = DOWN;
        is_start_animation = true;
    }

    if (is_start_animation && direction == UP) {
        animation_frame = 1;
        first_step = 0;
        last_step = NUM_STEPS - 1;
        is_start_animation = false;
    }
    if (is_start_animation && direction == DOWN) {
        animation_frame = 1;
        first_step = NUM_STEPS - 1;
        last_step = 0;
        is_start_animation = false;
    }

    if (millis() - last_millis >= FRAME_MS-1) {
        last_millis = millis();
        if (animation_frame > 0) {
            max_animation_frame = 0;
            animate(animation_frame);
            FastLED.show();
        }
    }
}

function animate() {

    if (animation_mode == 1) {
        if (check_frames(1,32,4)) {
            fill_step(first_step, CRGB(progress*MAX_ILLUM, 0, 0));
        }
        if (check_frames(32,64,4)) {
            fill_step(first_step, CRGB(degress*MAX_ILLUM, 0, progress*MAX_ILLUM));
        }
        if (check_frames(64,96,4)) {
            fill_step(first_step, CRGB(0, 0, degress*MAX_ILLUM));
        }
        if (check_frames(4,128+32,4)) {
            move_all();
        }
    }

    if (animation_mode == 2) {
        let seconds = 2;
        let rolls_per_sec = 2; // 1,2,4
        let back_color = CRGB( 0, 0,MAX_ILLUM/4);
        let frames_for_1step = FPS / rolls_per_sec / NUM_STEPS;
        //console.log('frames_for_1step',rolls_per_sec, FRAME_MS, frames_for_1step);

        if (animation_frame == 1) {
            for (let i = 0; i < NUM_STEPS; i++) {
                fill_step(i, back_color);
            }
        }

        if (check_frames(1,FPS/rolls_per_sec/2+1,4)) {
            draw_step3(first_step, back_color, CRGB(0, 0, MAX_ILLUM/4 + progress*(MAX_ILLUM-MAX_ILLUM/4)), back_color);
        }
        if (check_frames(FPS/rolls_per_sec/2+1, FPS/rolls_per_sec+1,4)) {
            //draw_step3(first_step, back_color, CRGB(0, 0, degress*MAX_ILLUM), back_color);
            draw_step3(first_step, back_color, CRGB(0, 0, MAX_ILLUM/4 + degress*(MAX_ILLUM-MAX_ILLUM/4)), back_color);
        }

        if (check_frames(2,seconds*FPS,4)) {
            move_all();
        }
    }

    if (animation_mode == 3) {
        let speedon = 16
        let speedoff = 32;
        if (direction === UP){
            for (let i = 0; i < NUM_STEPS; i++) {
                if (check_frames(i*speedon,i*speedon+32,4)) {
                    draw_step3(i, Black, CRGB(progress*MAX_ILLUM, 0, 0), Black);
                }

                if (check_frames(i*speedon+32,i*speedon+64,4)) {
                    draw_step3(i, CRGB(progress*MAX_ILLUM, 0, 0), Red, CRGB(progress*MAX_ILLUM, 0, 0));
                }
                if (i>0){
                    if (check_frames(i*speedoff+64,i*speedoff+96,4)) {
                        draw_step3(i-1, Red, CRGB(degress*MAX_ILLUM, 0, 0), Red);
                    }

                    if (check_frames(i*speedoff+96,i*speedoff+128,4)) {
                        draw_step3(i-1, CRGB(degress*MAX_ILLUM, 0, 0), Black, CRGB(degress*MAX_ILLUM, 0, 0));
                    }
                }

            }

        } else {
            for (let i = NUM_STEPS-1; i >= 0; i--) {
                if (check_frames((NUM_STEPS-i-1)*speedon,(NUM_STEPS-i-1)*speedon+32,4)) {
                    draw_step3(i, Black, CRGB(progress*MAX_ILLUM, 0, 0), Black);
                }

                if (check_frames((NUM_STEPS-i-1)*speedon+32,(NUM_STEPS-i-1)*speedon+64,4)) {
                    draw_step3(i, CRGB(progress*MAX_ILLUM, 0, 0), Red, CRGB(progress*MAX_ILLUM, 0, 0));
                }
                if (i<NUM_STEPS){
                    if (check_frames((NUM_STEPS-i-1)*speedoff+64,(NUM_STEPS-i-1)*speedoff+96,4)) {
                        draw_step3(i+1, Red, CRGB(degress*MAX_ILLUM, 0, 0), Red);
                    }

                    if (check_frames((NUM_STEPS-i-1)*speedoff+96,(NUM_STEPS-i-1)*speedoff+128,4)) {
                        draw_step3(i+1, CRGB(degress*MAX_ILLUM, 0, 0), Black, CRGB(degress*MAX_ILLUM, 0, 0));
                    }
                }

            }
        }
    }


    if (animation_mode == 4) {
        let seconds = 5;
        let rolls_per_sec = 4; // 1,2,4
        let times = seconds / rolls_per_sec;
        let back_color = CRGB(MAX_ILLUM/2, 0, 0);
        let frames_for_1step = FPS / rolls_per_sec / NUM_STEPS;
        //console.log('frames_for_1step',rolls_per_sec, FRAME_MS, frames_for_1step);

        if (animation_frame == 1) {
            for (let i = 0; i < NUM_STEPS; i++) {
                fill_step(i, back_color);
            }
        }
        step_on_prev1 = step_on;
        if (direction == UP) {
            step_on = (animation_frame-1)/frames_for_1step % NUM_STEPS;
        } else {
            step_on = NUM_STEPS-1 - ((animation_frame-1)/frames_for_1step % NUM_STEPS);
        }
        if (step_on != step_on_prev1) {
            if (direction == UP) {
                step_on_prev2 = step_on - 2;
                if (step_on_prev2 < 0) {
                    step_on_prev2 = step_on_prev2 + NUM_STEPS;
                }
            } else {
                step_on_prev2 = step_on + 2;
                if (step_on_prev2 >= NUM_STEPS) {
                    step_on_prev2 = step_on_prev2 - NUM_STEPS;
                }
            }
            //console.log('frames_for_1step',frames_for_1step, animation_frame, [step_on, step_on_prev1, step_on_prev2]);
            fill_step(step_on_prev2, back_color);
            fill_step(step_on_prev1, CRGB(MAX_ILLUM/1.5, 0, 0));
            fill_step(step_on, Red);
        }
        if (check_frames(1,seconds*FPS,5)) {
            //do nothing, just set max_animation_frame = times*FPS
        }

    }

    if (animation_mode == 5) {
        if (check_frames(1,1,4)) {
            draw_step2(0, Red, Blue);
            draw_step2(1, Blue, Green);
            draw_step2(2, Green, Red);

            draw_step3(4, Red, Green, Blue);
            draw_step3(5, Green, Blue, Red);
            draw_step3(6, Blue, Red, Green);

            draw_step2(8, Red, Blue);
            draw_step2(9, Blue, Green);
            draw_step2(10, Green, Red);

            draw_step3(11, Red, Green, Blue);
            draw_step3(12, Green, Blue, Red);
            draw_step3(13, Blue, Red, Green);

            draw_step(15, [ Red, Green, Blue, Red, Green, Blue, Red, Green, Blue]);

            //show_debug(key_frames + ': ' + key_frame + ' >>> ' + progress*MAX_ILLUM + ' M:' + max_animation_frame);
        }
        if (check_frames(4,300,4)) {
            shift_step(8, 1);
            shift_step(9, 1);
            shift_step(10, 1);

            shift_step(11, -1);
            shift_step(12, -1);
            shift_step(13, -1);
            //show_debug(key_frames + ': ' + key_frame + ' >>> ' + progress*MAX_ILLUM + ' M:' + max_animation_frame);
        }
    }

    if (animation_mode === 6) {
        let frames_per_step = 3;
        let worm_len = 1;
        let worm_max_age = 6;
        let worm_count = 2;
        let frames_per_spawn = worm_max_age/2*frames_per_step;
        let warm_color = White;
        max_animation_frame = 64*5;


        let back_color = CRGB(MAX_ILLUM/3, MAX_ILLUM/3, MAX_ILLUM/3);

        if (animation_frame === 1) {
            for (let i = 0; i < NUM_STEPS; i++) {
                fill_step(i, back_color);
            }
        }


        if (animation_frame%frames_per_spawn === 1) {
            for (let worm_i = 0; worm_i < worm_count; worm_i++) {
                let point = random(0,LOGICAL_LEDS_PER_STEP-1);
                let step = random(0, NUM_STEPS-1-worm_max_age/2);
                fill_point(step, point, warm_color);
                worms.push({step:step, point:point, animation_frame:animation_frame});
            }
        }
        if (animation_frame%frames_per_step === 1) {
            for (let worm_i = 0; worm_i < worms.length; worm_i++) {
                let age_i = ((animation_frame - worms[worm_i].animation_frame) / frames_per_step);
                if (age_i >= worm_max_age){
                    fill_point(worms[worm_i].step + age_i - 1, worms[worm_i].point, back_color);
                    /*fill_point(worms[worm_i].step + age_i - 2 , worms[worm_i].point, back_color);*/
                    worms.splice(worm_i, 1);
                }
                  }

            for(let worm_i = 0; worm_i < worms.length; worm_i++){
                let age_i = ((animation_frame - worms[worm_i].animation_frame) / frames_per_step);
                fill_point(worms[worm_i].step + age_i, worms[worm_i].point, warm_color);
                console.log('1//      worms[worm_i].step + age_i   ',worms[worm_i].step + age_i,'worms[worm_i].point    ' ,worms[worm_i].point)
                fill_point(worms[worm_i].step + age_i - worm_len , worms[worm_i].point, back_color);
                console.log('2//      worms[worm_i].step + age_i - worm_len  ',worms[worm_i].step + age_i,'worms[worm_i].point    ' ,worms[worm_i].point)

            }
        }





      /*  if (check_frames(1,100,4)){
            for (let i = 0; i < NUM_STEPS; i++) {
                fill_step(i, CRGB(MAX_ILLUM/3, MAX_ILLUM/3, MAX_ILLUM/3));

            }

                for (let i = 1; i < NUM_STEPS - 9; i++) {

                    if (check_frames(i*speed-speed, i*speed, 4)) {
                        fill_point(i-1, 2, CRGB(MAX_ILLUM, MAX_ILLUM, MAX_ILLUM));
                    }
                    if (check_frames(i*speed-speed, i*speed, 4)) {
                        fill_point(i-2, 2, CRGB(MAX_ILLUM, MAX_ILLUM, MAX_ILLUM));
                    }
                }
                for (let i = 4; i < NUM_STEPS - 9; i++) {

                    if (check_frames(i*speed-speed, i*speed, 4)) {
                        fill_point(i+4, 6, CRGB(MAX_ILLUM, MAX_ILLUM, MAX_ILLUM));
                    }
                    if (check_frames(i*speed-speed, i*speed, 4)) {
                        fill_point(i+3, 6, CRGB(MAX_ILLUM, MAX_ILLUM, MAX_ILLUM));
                    }
                }
                for (let i = 2; i < NUM_STEPS - 9; i++) {

                    if (check_frames(i*speed-speed, i*speed, 4)) {
                        fill_point(i+8, 3, CRGB(MAX_ILLUM, MAX_ILLUM, MAX_ILLUM));
                    }
                    if (check_frames(i*speed-speed, i*speed, 4)) {
                        fill_point(i+7, 3, CRGB(MAX_ILLUM, MAX_ILLUM, MAX_ILLUM));
                    }
                }


        }*/




    }

    //console.log('key_frames:', key_frames + ': ' + key_frame + ' >>> ' + progress*MAX_ILLUM + ' M:' + max_animation_frame);

    // check animation finish
    animation_frame++;
    if (animation_frame > max_animation_frame) {
        animation_frame = 0;
        clear_all();
    }

}


function check_frames(frame_from, frame_to, key_frame_interval) {
    if (max_animation_frame < frame_to) {
        max_animation_frame = frame_to;
    }

    if (animation_frame >= frame_from && animation_frame <= frame_to) {
        if (animation_frame % key_frame_interval === 1 || frame_from === frame_to) {
            key_frames = div(frame_to - frame_from, key_frame_interval);
            key_frame = div(animation_frame - frame_from, key_frame_interval); // 0..key_frames-1
            if (key_frames < 1) {
                key_frames = 1;
            }
            progress = key_frame/key_frames; // 0..1
            //console.log('key_frames:', key_frames + ': ' + key_frame + ' >>> ' + progress*255 + ' ' + max_animation_frame);
            if (progress < 0.05) {progress = 0}
            if (progress > 1) {progress = 1}
            degress = 1 - progress;
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}
function copy_step(step_from, step_to) {
    for (let led_i = 0; led_i < LOGICAL_LEDS_PER_STEP; led_i++) {
        leds[step_to * LOGICAL_LEDS_PER_STEP + led_i] = leds[step_from * LOGICAL_LEDS_PER_STEP + led_i];
    }
}
function shift_step(step, shift_points) {
    if (shift_points >= LOGICAL_LEDS_PER_STEP) {
        shift_points = shift_points%LOGICAL_LEDS_PER_STEP;
    }
    if (shift_points <= -LOGICAL_LEDS_PER_STEP) {
        shift_points = shift_points%LOGICAL_LEDS_PER_STEP;
    }
    let prev_leds = Array.from(leds);
    let led_dest;
    for (let led_i = 0; led_i < LOGICAL_LEDS_PER_STEP; led_i++) {
        led_dest = led_i + shift_points;
        if (led_dest >= 0 && led_dest < LOGICAL_LEDS_PER_STEP) {
            leds[step * LOGICAL_LEDS_PER_STEP + led_dest] = prev_leds[step * LOGICAL_LEDS_PER_STEP + led_i];
        } else if (led_dest < 0) {
            led_dest = led_dest + LOGICAL_LEDS_PER_STEP;
            leds[step * LOGICAL_LEDS_PER_STEP + led_dest] = prev_leds[step * LOGICAL_LEDS_PER_STEP + led_i];
        } else if (led_dest >= LOGICAL_LEDS_PER_STEP) {
            led_dest = led_dest - LOGICAL_LEDS_PER_STEP;
            leds[step * LOGICAL_LEDS_PER_STEP + led_dest] = prev_leds[step * LOGICAL_LEDS_PER_STEP + led_i];
        }
    }
}
function draw_step(step, points) {
    if (step >= 0 && step < NUM_STEPS) {
        for (let led_i = 0; led_i < LOGICAL_LEDS_PER_STEP; led_i++) {
            if (points[led_i]) {
                leds[step * LOGICAL_LEDS_PER_STEP + led_i] = points[led_i];
            } else {
                leds[step * LOGICAL_LEDS_PER_STEP + led_i] = Black;
            }
        }
    }
}
function illum_step(step, illum) {
    let led_num;
    if (step >= 0 && step < NUM_STEPS) {
        for (let led_i = 0; led_i < LOGICAL_LEDS_PER_STEP; led_i++) {
            led_num = step * LOGICAL_LEDS_PER_STEP + led_i;
            leds[led_num] = CRGB(leds[led_num][0] + illum, leds[led_num][1] + illum, leds[led_num][2] + illum);
        }
    }
}
function fill_step(step, color) {
    if (step >= 0 && step < NUM_STEPS) {
        for (let led_i = 0; led_i < LOGICAL_LEDS_PER_STEP; led_i++) {
            leds[step * LOGICAL_LEDS_PER_STEP + led_i] = color;
        }
    }
}

function fill_point(step, point, color) {
    if (step >= 0 && step < NUM_STEPS) {
        if (point >= 0 && point < LOGICAL_LEDS_PER_STEP) {
            leds[step * LOGICAL_LEDS_PER_STEP + point] = color;

        }
    }
}
function draw_step2(step, color1, color2) {
    if (step >= 0 && step < NUM_STEPS) {
        let max_num = LOGICAL_LEDS_PER_STEP - 1;
        for (let led_i = 0; led_i < LOGICAL_LEDS_PER_STEP; led_i++) {
            leds[step * LOGICAL_LEDS_PER_STEP + led_i] = CRGB(
                color1[0] * (max_num - led_i) / max_num + color2[0] * led_i / max_num,
                color1[1] * (max_num - led_i) / max_num + color2[1] * led_i / max_num,
                color1[2] * (max_num - led_i) / max_num + color2[2] * led_i / max_num
            );
        }
    }
}
function draw_step3(step, color1, color2, color3) {
    let max_num = center_num;
    if (step >= 0 && step < NUM_STEPS) {
        for (let led_i = 0; led_i < center_num; led_i++) {
            leds[step * LOGICAL_LEDS_PER_STEP + led_i] = CRGB(
                color1[0] * (max_num - led_i) / max_num + color2[0] * led_i / max_num,
                color1[1] * (max_num - led_i) / max_num + color2[1] * led_i / max_num,
                color1[2] * (max_num - led_i) / max_num + color2[2] * led_i / max_num
            );
        }
        for (let led_i = center_num; led_i < LOGICAL_LEDS_PER_STEP; led_i++) {
            leds[step * LOGICAL_LEDS_PER_STEP + led_i] = CRGB(
                color2[0] * (max_num - led_i + center_num) / max_num + color3[0] * (led_i - center_num) / max_num,
                color2[1] * (max_num - led_i + center_num) / max_num + color3[1] * (led_i - center_num) / max_num,
                color2[2] * (max_num - led_i + center_num) / max_num + color3[2] * (led_i - center_num) / max_num
            );
        }
    }
}
function move_all() {
    if (direction == UP) {
        for (let step_i = NUM_STEPS-1; step_i > 0; step_i--) {
            copy_step(step_i - 1, step_i);
            //console.log('u',step_i - 1, step_i);
        }
    } else {
        for (let step_i = 0; step_i < NUM_STEPS-1; step_i++) {
            copy_step(step_i + 1, step_i);
            //console.log('d',step_i + 1, step_i);
        }
    }
}
function clear_all() {
    for (let step_i = 0; step_i < NUM_STEPS; step_i++) {
        fill_step(step_i, Black);
    }
}
function show_debug(debug) {
    //document.getElementById('debug').innerText = debug;
}

function random(min, max){
    return Math.trunc(Math.random()*(max+1-min)+min)
}


