var gulp = require('gulp');
var jsmin = require('gulp-jsmin');
var rename = require('gulp-rename');
var javascriptObfuscator = require('gulp-javascript-obfuscator');
var browserSync = require('browser-sync').create();

var info_color = '\u001b[33m';
var error_color = '\u001b[31m';
var success_color = '\u001b[32m';
var reset_color = '\u001b[0m';

gulp.task('cplang', function (done) {
    gulp.src('form/lang/*.json')
        .pipe(gulp.dest('dist/lang/'))
    done()
});

gulp.task('minob', function (done) {
    gulp.src('form/*.js')
        .pipe(javascriptObfuscator({
            compact: true,
        }))
        .pipe(rename({ suffix: '.obf' }))
        .pipe(gulp.dest('dist'))
    done()
});

gulp.task('minjs', function (done) {
    gulp.src('form/*.js')
        .pipe(jsmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist'))
    done()
});

gulp.task('watch', function () {
    console.log(`   ${info_color} build source ${reset_color}`);

    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch('./form/**/*.js', gulp.series('minjs', 'minob'));
    gulp.watch("./*.html").on('change', browserSync.reload);
    gulp.watch("./form/**/*.js").on('change', browserSync.reload);
});

gulp.task('default', gulp.series('cplang', 'minjs', 'minob', 'watch'));
