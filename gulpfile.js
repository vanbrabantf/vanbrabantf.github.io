const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const child = require('child_process');
const gutil = require('gulp-util');

const cssFiles = '_sass/**/*.?(s)css';

gulp.task('css', () => {
  gulp.src(cssFiles)
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(gulp.dest('assets/css'))
});

gulp.task('watch', () => {
  gulp.watch(cssFiles, ['css']);
});

gulp.task('default', ['css', 'watch']);