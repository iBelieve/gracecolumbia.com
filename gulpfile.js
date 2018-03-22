const path = require('path')
const gulp = require('gulp')
const gutil = require('gulp-util')
const es = require('event-stream')
const plugins = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'gulp.*'],
  replaceString: /\bgulp[\-.]/
})

/***** METALSMITH SETUP *****/

const metalsmith = {
  layouts: require('metalsmith-layouts'),
  markdown: require('metalsmith-markdown'),
  permalinks: require('metalsmith-permalinks'),
  path: require('./lib/metalsmith-path')
}

/***** GLOBAL CONSTANTS *****/

const IS_DEV = process.env.NODE_ENV !== 'production'
const SASS_STYLE = IS_DEV ? 'expanded' : 'compressed'
const SOURCE_MAPS = !IS_DEV

const METADATA = {
  site: {
    title: 'Grace Lutheran Church',
    url: 'http://gracecolumbia.com'
  },
  google_analytics: '',
  // description: 'It\'s about saying »Hello« to the world.',
  links: {}
}

const PATHS = {
  content: {
    files: 'content/**',
    dest: './dist'
  },
  layouts: {
    files: 'layouts/**'
  },
  styles: {
    sass: {
      src: 'assets/sass',
      files: 'assets/sass/**/*.scss'
    },
    css: {
      src: 'assets/css',
      files: 'assets/css/**/*.css'
    },
    dest: './dist/css/'
  },
  scripts: {
    src: 'assets/js/**/*.js',
    dest: './dist/js/'
  },
  images: {
    src: 'assets/images/**/*',
    dest: './dist/images/'
  }
}

function changeEvent(prefix) {
  const ACTIONS = {
    add: 'added',
    addDir: 'added',
    change: 'changed',
    unlink: 'deleted',
    unlinkDir: 'deleted'
  }

  return (evt, file) => {
    gutil.log(
      gutil.colors.cyan(prefix),
      'file',
      gutil.colors.green(path.relative(__dirname, file)),
      'was',
      gutil.colors.magenta(ACTIONS[evt])
    )
  }
}

/***** TASKS *****/

function content() {
  return gulp
    .src(PATHS.content.files)
    .pipe(
      plugins.metalsmith({
        root: __dirname,
        use: [
          metalsmith.markdown(),
          metalsmith.permalinks({
            relative: false
          }),
          metalsmith.path({
            baseDirectory: '/',
            directoryIndex: 'index.html'
          }),
          metalsmith.layouts()
        ],
        metadata: METADATA
      })
    )
    .pipe(gulp.dest(PATHS.content.dest))
}

function styles() {
  const sass = gulp
    .src(PATHS.styles.sass.files)
    .pipe(plugins.sourcemaps.init())
    .pipe(
      plugins.sass({
        outputStyle: SASS_STYLE,
        includePaths: [PATHS.styles.sass.src]
      })
    )
    .on('error', function(err) {
      throw new gutil.PluginError('CSS', err, { showStack: true })
    })

  return es
    .concat(gulp.src(PATHS.styles.css.files), sass)
    .pipe(plugins.concat('styles.css'))
    .pipe(plugins.autoprefixer('last 2 versions'))
    .pipe(IS_DEV ? gutil.noop() : plugins.cssmin())
    .pipe(IS_DEV ? plugins.sourcemaps.write() : gutil.noop())
    .pipe(plugins.size({ title: 'Styles' }))
    .pipe(gulp.dest(PATHS.styles.dest))
}

function scripts() {
  return gulp
    .src(PATHS.scripts.src)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.babel())
    .pipe(plugins.concat('scripts.js'))
    .pipe(IS_DEV ? gutil.noop() : plugins.uglify())
    .pipe(IS_DEV ? plugins.sourcemaps.write() : gutil.noop())
    .pipe(plugins.size({ title: 'Scripts' }))
    .pipe(gulp.dest(PATHS.scripts.dest))
}

function images() {
  return gulp
    .src(PATHS.images.src, { since: gulp.lastRun(images) })
    .pipe(plugins.size({ title: 'Images' }))
    .pipe(gulp.dest(PATHS.images.dest))
}

function watch() {
  const server = plugins.liveServer.static('dist')
  server.start()

  gulp.watch(['dist/**']).on('all', (evt, path) => server.notify({ path }))
  gulp.watch([PATHS.content.files, PATHS.layouts.files], content).on('all', changeEvent('Content'))
  gulp
    .watch([PATHS.styles.sass.files, PATHS.styles.css.files], styles)
    .on('all', changeEvent('Styles'))
  gulp.watch(PATHS.scripts.src, scripts).on('all', changeEvent('Scripts'))
  gulp.watch(PATHS.images.src, images).on('all', changeEvent('Images'))
}

const all = gulp.parallel(content, styles, scripts, images)
const serve = gulp.series(all, watch)

module.exports = { all, serve, default: all }
