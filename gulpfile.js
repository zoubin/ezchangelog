var gulp = require('gulp')

gulp.task('clean', function () {
  var del = require('del')
  return del('build')
})

gulp.task('scripts', ['clean'], function () {
  return gulp.src(['lib/*.js', 'bin/*', 'index.js'], { base: process.cwd() })
    .pipe(gulp.dest('build'))
})

gulp.task('docs', ['clean'], function () {
  return gulp.src(['README.md', 'LICENSE', 'package.json'])
    .pipe(gulp.dest('build'))
})

gulp.task('build', ['scripts', 'docs'])

gulp.task('lint', function () {
  var eslint = require('gulp-eslint')
  return gulp.src(['*.js', 'bin/*.js', 'lib/*.js', 'test/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('default', ['lint'])

