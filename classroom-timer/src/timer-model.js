export function formatTime(milliseconds){const total=Math.max(0,Math.ceil(milliseconds/1000));return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;}
export class Countdown {
 constructor(duration=300000){this.duration=duration;this.remaining=duration;this.deadline=null;}
 setDuration(ms){if(!Number.isFinite(ms)||ms<1000||ms>10800000)throw new RangeError('Choose a time from 1 second to 180 minutes.');this.duration=ms;this.reset();}
 start(now){if(this.remaining<=0)this.remaining=this.duration;this.deadline=now+this.remaining;}
 tick(now){if(this.deadline===null)return false;this.remaining=Math.max(0,this.deadline-now);if(this.remaining===0){this.deadline=null;return true;}return false;}
 pause(now){const completed=this.tick(now);this.deadline=null;return completed;}
 reset(){this.remaining=this.duration;this.deadline=null;}
 get running(){return this.deadline!==null;}
}
