'use strict';

var jsmediatags = window.jsmediatags;

const AUDIO_FILES = [
  'http://localhost:4500/audio/long-vbr.ogg',
  'http://localhost:4500/audio/seconds-CBR.mp3',
  'http://localhost:4500/audio/seconds-VBR.mp3',
  'http://localhost:4500/audio/rr_no_ones_listening_ep100_02_28_18.mp3',
  'http://localhost:4500/audio/rr_no_ones_listening_ep101_03_07_18.mp3',
  'http://localhost:4500/audio/rr_no_ones_listening_ep102_03_14_18.mp3',
];

const SKIP_BACK_ID = 'ap-skipback';
const PREV_TRACK_ID  = 'ap-prev';
const PLAY_PAUSE_ID  = 'ap-playpause';
const NEXT_TRACK_ID  = 'ap-next';
const SKIP_FORWARD_ID  = 'ap-skipforward';

class AudioPlayer {
  constructor() {
    //Audio element
    this.audio = document.createElement('audio');

    //Buttons
    this.skipBackBtn = document.getElementById(SKIP_BACK_ID);
    this.prevTrackBtn = document.getElementById(PREV_TRACK_ID);
    this.playPauseBtn = document.getElementById(PLAY_PAUSE_ID);
    this.nextTrackBtn = document.getElementById(NEXT_TRACK_ID);
    this.skipForwardBtn = document.getElementById(SKIP_FORWARD_ID);

    //Times
    this.timeTextCurrent = document.getElementById('ap-time-current');
    this.timeTextDuration = document.getElementById('ap-time-duration');
    this.duration = 0;

    //Timeline
    this.progressBar = document.getElementById('ap-progress-bar');
    this.timeDot = document.getElementById('ap-progress-bar-dot');
    this.progressBarWidth = this.progressBar.offsetWidth - this.timeDot.offsetWidth;
    this.onTimeDot = false;

    //Total Tracks
    this.trackCount = AUDIO_FILES.length;
    console.log(this.trackCount);

    //Current Track
    this.currentTrack = Number( localStorage.getItem('apTrack') ) || 0;
    
  }

  addListeners = () => {
    this.skipBackBtn.addEventListener('click', this.skipBack);
    this.prevTrackBtn.addEventListener('click', this.prevTrack);
    this.playPauseBtn.addEventListener('click', this.playPauseTrack);
    this.nextTrackBtn.addEventListener('click', this.nextTrack);
    this.skipForwardBtn.addEventListener('click', this.skipForward);

    this.audio.addEventListener('durationchange', () => this.duration = this.audio.duration, false);
    this.audio.addEventListener('timeupdate', this.timeUpdate, false);
    this.timeDot.addEventListener('mousedown', this.mouseDown, false);
    this.timeDot.addEventListener('touchstart', this.mouseDown, false);
    window.addEventListener('mouseup', this.mouseUp, false);
    window.addEventListener('touchend', this.mouseUp, false);
  }

  formatTime = (secs) => {
    let hour = Math.floor(secs / 3600);
    let minute = Math.floor((secs - (hour * 3600)) / 60);
    let second = Math.floor(secs - (hour * 3600) - (minute * 60));

    console.log(second);

    if (hour < 10) {
      hour = "0" + hour;
    }

    if (minute < 10) {
      minute = "0" + minute;
    }

    if (second < 10) {
      second = "0" + second;
    }

    if (hour < 1) {
      return minute + ':' + second;
    }

    return hour + ':' + minute + ':' + second;
  }

  timeUpdate = () => {
    console.log('current-time: ' + this.audio.currentTime);
    console.log('calculation time %: ' + (this.audio.currentTime / this.duration) );
    this.timeTextCurrent.innerText = this.formatTime(this.audio.currentTime);

    const timePercent = this.progressBarWidth * (this.audio.currentTime / this.duration);

    this.timeDot.style.left = timePercent + 'px';
  }

  

  mouseDown = () => {
    console.log('mouseDown');
    this.onTimeDot = true;
    window.addEventListener('mousemove', this.dragDot, true);
    window.addEventListener('touchmove', this.dragDot, true);
    this.audio.removeEventListener('timeupdate', this.timeUpdate, false);
  }

  mouseUp = (ev) => {
    if (this.onTimeDot) {
      this.dragDot(ev);
      window.removeEventListener('mousemove', this.dragDot, true);
      window.removeEventListener('touchmove', this.dragDot, true);
      this.audio.currentTime = this.duration * (ev.clientX / this.progressBarWidth);
      console.log('mouseUp duration * %: ' + (this.duration * (ev.clientX / this.progressBarWidth)) )
      console.log('mouseUp currentTime: ' + this.audio.currentTime );
      this.audio.addEventListener('timeupdate', this.timeUpdate, false);
    }
    this.onTimeDot = false;
  }

  dragDot = (ev) => {
    
    let leftPosition = ev.clientX;

    if (ev.touches) {
      leftPosition = ev.changedTouches[0].clientX;
    }
    
    console.log('pos: ' + leftPosition);

    if (leftPosition >= 0 && leftPosition <= this.progressBarWidth) {
      this.timeDot.style.left = leftPosition + 'px';
    }
    if (leftPosition < 0) {
      this.timeDot.style.left = '0';
    }
    if (leftPosition > this.progressBarWidth) {
      this.timeDot.style.left = this.progressBarWidth + 'px';
    }
  }

  loadTrack = (file) => {
    console.log(file);
    this.audio.src = file;
  }

  playPauseTrack = () => {
    if (this.audio.paused) {
      this.audio.play();
      this.timeTextDuration.innerText = this.formatTime(this.duration);
    } else {
      this.audio.pause();
    }
  };

  setTrack = () => {
    localStorage.setItem('apTrack', this.currentTrack);
  }

  nextTrack = () => {
    if (this.currentTrack >= this.trackCount - 1) {
      this.playPauseTrack();
      this.audio.currentTime = 0;
      return;
    }

    this.currentTrack = this.currentTrack + 1;
    this.setTrack();
    this.loadTrack(AUDIO_FILES[this.currentTrack]);
    this.playPauseTrack();
  }

  prevTrack = () => {
    if (this.currentTrack < 1) {
      this.currentTrack = 0;
      this.audio.currentTime = 0;
      this.setTrack();
      return;
    }

    this.currentTrack = this.currentTrack - 1;
    this.setTrack();
    this.loadTrack(AUDIO_FILES[this.currentTrack]);
    this.playPauseTrack();
  }

  skipBack = () => {
    this.audio.currentTime = this.audio.currentTime - 10;
    console.log(this.audio.currentTime);
  }

  skipForward = () => {
    this.audio.currentTime = this.audio.currentTime + 30;
    console.log(this.audio.currentTime);
  }

  readTags = () => {
    jsmediatags.read(AUDIO_FILES[0], {
      onSuccess: function(tag) {
        console.log(tag);
      },
      onError: function(error) {
        console.log(':(', error.type, error.info);
      }
    });
  }

  init() {
    this.loadTrack(AUDIO_FILES[this.currentTrack]);
    this.addListeners();
  };

}

const player = new AudioPlayer;
player.init();