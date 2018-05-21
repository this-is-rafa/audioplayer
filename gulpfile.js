var gulp = require('gulp'),
  babel = require('gulp-babel'),
  concat = require('gulp-concat'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cleanCss = require('gulp-clean-css');

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

var autoprefixerOptions = {
  browsers: ['last 4 versions', 'Firefox ESR']
};

var cleanCssOptions = {
  compatibility: 'ie9',
  level: 2
};


gulp.task('sassy', function() {
  return gulp
    .src('./scss/style.scss')
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(cleanCss(cleanCssOptions))
    .pipe(gulp.dest('./app/'));
})

gulp.task('html', function () {
  return gulp.src([
    './app/header.html', 
    './svg/icons.html', 
    './app/client.html',
    './app/toolbar.html',
    './app/alert_bar.html',
    './app/content-header.html',
    './app/profilebar.html',
    './app/profile.html',
    './app/status.html',
    './app/patient_status.html',
    './app/room_history.html',
    './app/operating_room.html',
    './app/or_performance.html',
    './app/or_schedule.html',
    './app/hawthorne.html',
    './app/efficiency.html',
    './app/case_menu.html',
    './app/case_room_first.html',
    './app/case_room_last.html ',
    './app/case_per_day.html',
    './app/patient_flow.html',
    './app/patient_location.html',
    './app/room_occupied.html',
    './app/room_utilization.html',
    './app/room_turnaround.html',
    './app/tag_registered.html',
    './app/wristband.html',
    './app/notification.html',
    './app/notification_history.html',
    './app/patient.html',
    './app/settings.html',
    './app/content-footer.html',
    './app/footer.html',
  ])
    .pipe(concat('index.html'))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['html', 'sassy']);

gulp.task('watch', function () {
  gulp.watch('app/*.html', ['html']);
  gulp.watch('scss/*.scss', ['sassy']);
});