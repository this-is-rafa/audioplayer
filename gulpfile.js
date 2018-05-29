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
    .src('./src/scss/style.scss')
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(cleanCss(cleanCssOptions))
    .pipe(gulp.dest('./dist/css/'));
})

gulp.task('html', function () {
  return gulp.src('./src/index.html')
    .pipe(concat('index.html'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('js', function () {
  return gulp.src("./src/js/audioplayer.js")
    .pipe(babel())
    .pipe(gulp.dest("./dist/js"));
});

gulp.task('default', ['html', 'sassy', 'js']);

gulp.task('watch', function () {
  gulp.watch('src/*.html', ['html']);
  gulp.watch('src/scss/*.scss', ['sassy']);
  gulp.watch('src/js/*.js', ['js']);
});