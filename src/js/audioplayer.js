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

const SONGS = [
  {
    title: 'Long VBR No One\'s Listening',
    author: 'Ogg Vorbis Rat Radio',
    file: 'http://localhost:4500/audio/long-vbr.ogg' 
  },
  {
    title: 'Seconds CBR',
    author: 'Mpeg Layer 3',
    file: 'http://localhost:4500/audio/seconds-CBR.mp3' 
  },
  {
    title: 'Seconds VBR',
    author: 'MP3',
    file: 'http://localhost:4500/audio/seconds-VBR.mp3' 
  },
  {
    title: 'No One\'s Listening Show Ep.100',
    author: 'Rat Radio',
    file: 'http://localhost:4500/audio/rr_no_ones_listening_ep100_02_28_18.mp3',
  },
  {
    title: 'No One\'s Listening Show Ep.101',
    author: 'Rat Radio',
    file: 'http://localhost:4500/audio/rr_no_ones_listening_ep101_03_07_18.mp3' 
  },
  {
    title: 'No One\'s Listening Show Ep.102',
    author: 'Rat Radio',
    file: 'http://localhost:4500/audio/rr_no_ones_listening_ep102_03_14_18.mp3', 
  },
]

const SKIP_BACK_ID = 'ap-skipback';
const PREV_TRACK_ID  = 'ap-prev';
const PLAY_PAUSE_ID  = 'ap-playpause';
const NEXT_TRACK_ID  = 'ap-next';
const SKIP_FORWARD_ID  = 'ap-skipforward';

class AudioPlayer {
  constructor(tracks) {
    //Track List
    this.trackList = tracks;
    this.trackCount = tracks.length;
    console.log(this.trackCount);

    //Current Track
    this.currentTrack = Number( localStorage.getItem('apTrack') ) || 0;

    //Audio element
    this.audio = document.createElement('audio');

    //Title Elements
    this.titleElements = document.getElementsByClassName('js-ap-title');
    this.authorElements = document.getElementsByClassName('js-ap-author');

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
    this.timeColor = document.getElementById('ap-progress-bar-color');
    this.progressBarWidth = this.progressBar.offsetWidth - this.timeDot.offsetWidth;
    this.onTimeDot = false;
    
  }

  addListeners = () => {
    this.skipBackBtn.addEventListener('click', this.skipBack);
    this.prevTrackBtn.addEventListener('click', this.prevTrack);
    this.playPauseBtn.addEventListener('click', this.playPauseTrack);
    this.nextTrackBtn.addEventListener('click', this.nextTrack);
    this.skipForwardBtn.addEventListener('click', this.skipForward);

    this.audio.addEventListener('durationchange', () => this.duration = this.audio.duration, false);
    this.audio.addEventListener('timeupdate', this.timeUpdate, false);
    this.audio.addEventListener('ended', this.nextTrack);
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
    this.timeTextCurrent.innerHTML = this.formatTime(this.audio.currentTime);

    const timePercent = this.progressBarWidth * (this.audio.currentTime / this.duration);

    this.timeDot.style.left = timePercent + 'px';
    this.timeColor.style.width = timePercent + 'px';
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
      this.timeColor.style.width = leftPosition + 'px';
    }
    if (leftPosition < 0) {
      this.timeDot.style.left = '0';
      this.timeColor.style.width = leftPosition + 'px';
    }
    if (leftPosition > this.progressBarWidth) {
      this.timeDot.style.left = this.progressBarWidth + 'px';
      this.timeColor.style.width = leftPosition + 'px';
    }
  }

  loadTrack = (track) => {
    console.log(track.file);
    this.audio.src = track.file;
    
    for (let i = 0; i < this.titleElements.length; i++) {
      this.titleElements[i].innerHTML = track.title || 'Untitled';
    }

    for (let i = 0; i < this.authorElements.length; i++) {
      this.authorElements[i].innerHTML = track.author || 'Unknown Author';
    }
  }

  playPauseTrack = () => {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
    this.timeTextDuration.innerHTML = this.formatTime(this.duration);
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
    this.loadTrack(this.trackList[this.currentTrack]);
    this.playPauseTrack();
  }

  prevTrack = () => {
    if (this.currentTrack < 1) {
      this.currentTrack = 0;
      this.loadTrack(this.trackList[this.currentTrack]);
      this.audio.currentTime = 0;
      this.setTrack();
      return;
    }

    this.currentTrack = this.currentTrack - 1;
    this.setTrack();
    this.loadTrack(this.trackList[this.currentTrack]);
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
    this.loadTrack(this.trackList[this.currentTrack]);
    this.addListeners();
  };

}

const player = new AudioPlayer(SONGS);
player.init();