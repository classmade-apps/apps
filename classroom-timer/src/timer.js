import {Countdown,formatTime} from './timer-model.js';
import {TIMER_DEFAULTS} from './timer-config.js';
const timer=new Countdown();
const defaultMinutes=Number(TIMER_DEFAULTS.minutes);
if(Number.isFinite(defaultMinutes)&&defaultMinutes>=1&&defaultMinutes<=180)timer.setDuration(defaultMinutes*60000);
document.querySelector('#activity').value=String(TIMER_DEFAULTS.activity||'Independent reading');
document.querySelector('#minutes').value=Math.floor(timer.duration/60000);
document.querySelector('#seconds').value=(timer.duration/1000)%60;
if(/^#[0-9a-f]{6}$/i.test(TIMER_DEFAULTS.accent))document.documentElement.style.setProperty('--green',TIMER_DEFAULTS.accent);
const presets=Array.isArray(TIMER_DEFAULTS.presets)?TIMER_DEFAULTS.presets.filter(n=>Number.isFinite(n)&&n>=1&&n<=180):[];
if(presets.length){const container=document.querySelector('.presets');container.replaceChildren();for(const minutes of presets){const button=document.createElement('button');button.type='button';button.dataset.minutes=minutes;button.textContent=`${minutes} min`;container.append(button);}}
const display=document.querySelector('#time-display'),start=document.querySelector('#start-pause'),status=document.querySelector('#timer-status'),sound=document.querySelector('#sound');
let audio;
function render(){display.textContent=formatTime(timer.remaining);display.classList.toggle('done',timer.remaining===0);document.querySelector('#progress-fill').style.width=`${100*timer.remaining/timer.duration}%`;start.textContent=timer.running?'Pause timer':timer.remaining===0?'Start again':timer.remaining<timer.duration?'Resume timer':'Start timer';}
function readyAudio(){if(sound.checked)try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{status.textContent='Audio is unavailable. The timer will finish visually.';});}catch{status.textContent='Audio is unavailable. The timer will finish visually.';}}
function finish(){status.textContent='Time is up. Ready for what’s next?';if(sound.checked&&audio)try{for(let i=0;i<2;i++){const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);const at=audio.currentTime+i*.6;osc.frequency.value=i?659.25:523.25;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.12,at+.02);gain.gain.exponentialRampToValueAtTime(.001,at+.55);osc.start(at);osc.stop(at+.6);}}catch{status.textContent='Time is up. Sound could not play on this device.';}}
start.addEventListener('click',()=>{if(timer.running){const done=timer.pause(Date.now());status.textContent='Timer paused.';if(done)finish();}else{timer.start(Date.now());status.textContent='Timer running.';readyAudio();}render();});
document.querySelector('#reset').addEventListener('click',()=>{timer.reset();status.textContent='Timer reset. Ready when you are.';render();});
function setTime(ms){try{timer.setDuration(ms);document.querySelector('#minutes').value=Math.floor(ms/60000);document.querySelector('#seconds').value=(ms/1000)%60;status.textContent=`Set to ${formatTime(ms)}. Ready when you are.`;render();}catch(error){status.textContent=error.message;}}
document.querySelectorAll('[data-minutes]').forEach(button=>button.addEventListener('click',()=>setTime(Number(button.dataset.minutes)*60000)));
document.querySelector('#custom-time').addEventListener('submit',event=>{event.preventDefault();setTime((Number(document.querySelector('#minutes').value)*60+Number(document.querySelector('#seconds').value))*1000);});
sound.addEventListener('change',readyAudio);
const fullscreen=document.querySelector('#fullscreen'),shell=document.querySelector('#timer-shell');
fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(shell.requestFullscreen)await shell.requestFullscreen();else status.textContent='Fullscreen is not available in this browser. Try your browser’s fullscreen option.';}catch{status.textContent='Fullscreen could not open. Try your browser’s fullscreen option.';}});
document.addEventListener('fullscreenchange',()=>{fullscreen.textContent=document.fullscreenElement?'Exit fullscreen':'Enter fullscreen';});
function tick(){if(timer.tick(Date.now()))finish();render();}
setInterval(tick,100);document.addEventListener('visibilitychange',tick);render();
