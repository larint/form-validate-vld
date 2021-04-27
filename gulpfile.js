var gulp = require('gulp');
var jsmin = require('gulp-jsmin');
var rename = require('gulp-rename');
var javascriptObfuscator = require('gulp-javascript-obfuscator');

gulp.task('minob', function () {
    gulp.src('form/*.js')
        .pipe(javascriptObfuscator({
            compact: true,
        }))
        .pipe(rename({ suffix: '.obf' }))
        .pipe(gulp.dest('dist'));
});


gulp.task('minjs', function () {
    gulp.src('form/*.js')
        .pipe(jsmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist'));
});

gulp.watch('./form/**/*.js', ['minjs', 'minob']).on('change', reload);