'use strict';

const gulp = require('gulp');
const mocha = require('gulp-mocha');
const eslint = require('gulp-eslint');
const PEG = require('pegjs');
const fs = require('fs');

gulp.task('build', function() {
    const src = fs.readFileSync('lib/parser.pegjs', {encoding: 'utf8'});
    const parser = PEG.buildParser(src, {output: 'source'});
    fs.writeFileSync('lib/parser.js', 'module.exports = ' + parser + ';\n', {encoding: 'utf8'});
});

gulp.task('test', function() {
    return gulp.src('test/**/*.js', {read: false})
        .pipe(mocha({reporter: 'dot'}));
});

gulp.task('default', ['build', 'test']);
