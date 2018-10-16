'use strict';

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
const PAUSE_ICON_ID = 'ap-pauseicon';
const PLAY_ICON_ID = 'ap-playicon';


class AudioPlayer {
  constructor(tracks, userOptions) {
    //Options
    let defaults = {
      autoPlayNextTrack: true,
      rememberTrackSession: false,
      showNextButton: true,
      showPrevButton: true,
      showSkipForward: true,
      showSkipBack: true 
    }

    this.options = Object.assign({}, defaults, userOptions);

    //Track List
    this.trackList = tracks;
    this.trackCount = tracks.length;

    //Current Track
    this.currentTrack = this.options.rememberTrackSession ? Number( localStorage.getItem('apTrack') ) : 0;

    //Audio element
    this.audio = document.createElement('audio');

    //Container Elements
    this.containerBottom = document.getElementById('ap-bottom');
    this.containerTop = document.getElementById('ap-top');

    //Title Elements
    this.titleElements = document.getElementsByClassName('js-ap-title');
    this.authorElements = document.getElementsByClassName('js-ap-author');

    //Buttons
    this.skipBackBtn = document.getElementById(SKIP_BACK_ID);
    this.prevTrackBtn = document.getElementById(PREV_TRACK_ID);
    this.playPauseBtn = document.getElementById(PLAY_PAUSE_ID);
    this.nextTrackBtn = document.getElementById(NEXT_TRACK_ID);
    this.skipForwardBtn = document.getElementById(SKIP_FORWARD_ID);

    //Hide Buttons according to options
    if (!this.options.showNextButton) {
      this.nextTrackBtn.classList.add('ap-controls__btn--hide');
    }
    if (!this.options.showPrevButton) {
      this.prevTrackBtn.classList.add('ap-controls__btn--hide');
    }
    if (!this.options.showSkipBack) {
      this.skipBackBtn.classList.add('ap-controls__btn--hide');
    }
    if (!this.options.showSkipForward) {
      this.skipForwardBtn.classList.add('ap-controls__btn--hide');
    }

    //Icons
    this.pauseIcon = document.getElementById(PAUSE_ICON_ID);
    this.playIcon = document.getElementById(PLAY_ICON_ID);

    //Volume
    this.volumeBar = document.getElementById('ap-volume');
    this.volumeBar.value = Number( localStorage.getItem('apVolume') ) || 100;
    this.audio.volume = (this.volumeBar.value / 100) || 1;


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
    
    //Initialize
    this.playerInitialized = false;
    //this.init(this.trackList[this.currentTrack]);
    this.loadTrackLinks();
  }

  addListeners = () => {
    this.skipBackBtn.addEventListener('click', this.skipBack);
    this.prevTrackBtn.addEventListener('click', this.prevTrack);
    this.playPauseBtn.addEventListener('click', this.playPauseTrack);
    this.nextTrackBtn.addEventListener('click', this.nextTrack);
    this.skipForwardBtn.addEventListener('click', this.skipForward);

    this.audio.addEventListener('durationchange', () => this.duration = this.audio.duration, false);
    this.audio.addEventListener('timeupdate', this.timeUpdate, false);
    this.audio.addEventListener('ended', this.options.autoPlayNextTrack ? this.nextTrack : this.stopTrack);

    this.volumeBar.addEventListener('change', this.setVolume, false);

    this.timeDot.addEventListener('mousedown', this.mouseDown, false);
    window.addEventListener('mouseup', this.mouseUp, false);
    this.timeDot.addEventListener('touchstart', this.mouseDown, false);
    this.timeDot.addEventListener('touchend', this.mouseUp, false);
  }

  formatTime = (secs) => {
    let hour = Math.floor(secs / 3600);
    let minute = Math.floor((secs - (hour * 3600)) / 60);
    let second = Math.floor(secs - (hour * 3600) - (minute * 60));

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
    this.timeTextCurrent.innerHTML = this.formatTime(this.audio.currentTime);

    const timePercent = this.progressBarWidth * (this.audio.currentTime / this.duration);

    this.timeDot.style.left = timePercent + 'px';
    this.timeColor.style.width = timePercent + 'px';
  }

  mouseDown = () => {
    this.onTimeDot = true;
    window.addEventListener('mousemove', this.dragDot, true);
    this.timeDot.addEventListener('touchmove', this.dragDot, true);
    this.audio.removeEventListener('timeupdate', this.timeUpdate, false);
  }

  mouseUp = (ev) => {
    if (this.onTimeDot) {
      this.dragDot(ev);
      window.removeEventListener('mousemove', this.dragDot, true);
      this.timeDot.removeEventListener('touchmove', this.dragDot, true);

      let timeChange = ev.touches ? parseInt(ev.changedTouches[0].clientX) : ev.clientX;
      this.audio.currentTime = this.duration * (timeChange / this.progressBarWidth);

      this.audio.addEventListener('timeupdate', this.timeUpdate, false);
    }
    this.onTimeDot = false;
  }

  dragDot = (ev) => {
    
    let leftPosition = ev.clientX;

    if (ev.touches) {
      leftPosition = parseInt(ev.changedTouches[0].clientX);
    }
    if (leftPosition >= 0 && leftPosition <= ( this.progressBarWidth + 25 ) ) {
      this.timeDot.style.left = leftPosition + 'px';
      this.timeColor.style.width = leftPosition + 'px';
    }
    if (leftPosition < 0) {
      this.timeDot.style.left = '0';
      this.timeColor.style.width = leftPosition + 'px';
    }
    if ( leftPosition > ( this.progressBarWidth + 25 ) )  {
      this.timeDot.style.left = ( this.progressBarWidth - 25 ) + 'px';
      this.timeColor.style.width = leftPosition + 'px';
    }
  }

  loadTrack = (track) => {
    this.audio.src = track.file;
    
    for (let i = 0; i < this.titleElements.length; i++) {
      this.titleElements[i].innerHTML = track.title || 'Untitled';
    }

    for (let i = 0; i < this.authorElements.length; i++) {
      this.authorElements[i].innerHTML = track.author || 'Unknown Author';
    }
  }

  stopTrack = () => {
    this.audio.currentTime = 0;
    this.pauseIcon.classList.remove('ap-icon--show');
    this.playIcon.classList.add('ap-icon--show');
  }

  playPauseTrack = () => {
    if (this.audio.paused) {
      this.audio.play();
      this.pauseIcon.classList.add('ap-icon--show');
      this.playIcon.classList.remove('ap-icon--show');
    } else {
      this.audio.pause();
      this.pauseIcon.classList.remove('ap-icon--show');
      this.playIcon.classList.add('ap-icon--show');
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
  }

  skipForward = () => {
    this.audio.currentTime = this.audio.currentTime + 30;
  }

  setVolume = () => {
    this.audio.volume = this.volumeBar.value / 100;
    localStorage.setItem('apVolume', this.volumeBar.value);
  }

  loadTrackLinks = () => {
    let audioLinks = document.getElementsByClassName('ap-audio-file');
    if (audioLinks && audioLinks.length > 0) {
      for (let item of audioLinks) {
        item.addEventListener('click', this.playFromLink.bind(this));
      }
    }
  }

  playFromLink = (e) => {
    e.preventDefault();
    let track = {
      title: e.target.dataset.title || 'Untitled',
      author: e.target.dataset.author || 'Unknown',
      file: e.target.href || null
    }

    //If we already called init, don't do it again.
    this.playerInitialize ? this.loadTrack(track) : this.init(track);

    this.playPauseTrack();
  };

  init = (track) => {
    this.loadTrack(track);
    this.addListeners();
    this.containerBottom.classList.add('ap-bottom--show');
    this.containerTop.classList.add('ap-top--show');
    this.playerInitialize = true;
  };

}

const player = new AudioPlayer(SONGS, {
  autoPlayNextTrack: false,
  showNextButton: false,
  showPrevButton: false,
  showSkipForward: true,
  showSkipBack: true 
});
