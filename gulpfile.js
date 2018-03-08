const gulp = require('gulp')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const connect = require('gulp-connect')
const open = require('gulp-open')

const sources = {
  html: 'src/*.html',
  sass: 'src/styles/**/*.scss',
  js: 'src/scripts/**/*.js'
}
const outputDir = 'dist'

// Copy html files
gulp.task('copy', () => {
  gulp.src('src/*.html')
  .pipe(gulp.dest(outputDir))
  gulp.src('src/images/*')
  .pipe(gulp.dest(`${outputDir}/images`))
})

// copy fonts
gulp.task('fonts', () => {
  gulp.src('src/fonts/*')
  .pipe(gulp.dest(`${outputDir}/fonts`))
})
// Reload when html changes
gulp.task('html', () => {
  gulp.src(sources.html)
  .pipe(connect.reload())
})

// Compile sass to css, move to dist and reload
gulp.task('sass', () => {
  return gulp.src('src/styles/main.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest(`${outputDir}/css`))
    .pipe(connect.reload())
})

// Convert to es5, uglify and move js files
gulp.task('js', () => {
  return gulp.src(sources.js)
    .pipe(babel({
      presets: ['es2015']
    }))
    // .pipe(uglify())
    .pipe(gulp.dest(`${outputDir}/js`))
    .pipe(connect.reload())
})

// Watch html, sass and js
gulp.task('watch', () => {
  gulp.watch(sources.html, ['html', 'copy'])
  gulp.watch(sources.sass, ['sass'])
  gulp.watch(sources.js, ['js'])
})

// Start server
gulp.task('connect', () => {
  connect.server({
    root: '.',
    livereload: true
  })
})

// Open browser
gulp.task('open', () => {
  gulp.src('')
  .pipe(open({uri: 'http://localhost:8080/dist'}))
})

gulp.task('default', ['copy', 'html', 'sass', 'js', 'watch', 'connect'])
gulp.task('start', ['copy', 'html', 'sass', 'js', 'watch', 'connect', 'open'])
