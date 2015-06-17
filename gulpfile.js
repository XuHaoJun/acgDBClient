var argv = require('yargs').argv;

var ENV = process.env.ENV || process.env.NODE_ENV;
var production =  ( ENV == 'pro' || ENV == 'production' ? true : false);
var development = ( ENV == 'dev' || ENV == 'development' || !production  ? true : false);

var jsFiles = 'app/**/*.js';
var jsxFiles = 'app/**/*.jsx';
var bundleJsDest = (argv.bundleJsDest ? argv.bundleJsDest : 'dist/javascripts');
var bundleJsFilename = 'bundle.js';

var cssFiles = {
  stylus: ['assets/stylesheets/**/*.styl'],
  sass: ['assets/stylesheets/**/*.scss'],
  less: ['assets/stylesheets/**/*.less'],
  css: ['assets/stylesheets/**/*.css']
};
var bundleCssDest = (argv.bundleCssDest ? argv.bundleCssDest : 'dist/stylesheets');
var bundleCssFilename = 'bundle.css';



var gulp = require('gulp');
var livereload = require('gulp-livereload');
var merge = require('merge-stream');
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var uglify  = require('gulp-uglify');
var browserify = require('browserify');
var browserifyInc = require('browserify-incremental');
var xtend = require('xtend');
var strictify = require('strictify');
var react = require('gulp-react');
var watch = require('gulp-watch');
var gStreamify = require('gulp-streamify');
var minifyCSS = require('gulp-minify-css');
var stylus = require('gulp-stylus');
var sass = require('gulp-sass');
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var source = require('vinyl-source-stream');
var del = require('del');



if (argv._ && argv._.indexOf('watch') !== -1) {
  argv.livereload = argv.livereload === undefined ? true : false;
}

if (argv.livereload) {
  livereload.listen();
}

gulp.task('default', ['build']);

gulp.task('watch', ['js-jsx:watch',
                    'css:watch',
                    'manifest:watch',
                    'livereload:watch']);

gulp.task('build', ['js-jsx:build', 'css:build'], function() {
  return gulp.start('manifest:build');
});

gulp.task('clean', function(cb) {
  return (
    del([
      'dist/javascripts/bundle.js',
      'dist/stylesheets/bundle.css',
      '.browserify-cache.json'
    ], cb)
  );
});

gulp.task('js:lint', function() {
  var jshint = require('gulp-jshint');
  return (
    gulp.src(jsFiles)
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
  );
});

gulp.task('js-jsx:build', ['jsx:build'], function() {
  return gulp.start('js:build');
});

gulp.task('js-jsx:watch', ['jsx:watch', 'js:watch']);

gulp.task('js:build', function() {
  var b;
  if (development) {
    b = browserify('./app/app.js', xtend(browserifyInc.args, {}));
  } else {
    b = browserify('./app/app.js', {fullPaths: false});
  }
  b.transform(strictify);
  b.on('error', handleError('Browserify'));
  if (development) {
    browserifyInc(b, {cacheFile: './.browserify-cache.json'});
  }
  b = b.bundle().pipe(source(bundleJsFilename));
  if (production) {
    b = b.pipe(gStreamify(uglify()));
  }
  b = b.pipe(gulp.dest(bundleJsDest));
  // if (argv.livereload) {
  //   b = b.pipe(livereload({start: true}));
  // }
  return b;
});

gulp.task('js:watch', function() {
  return gulp.watch(jsFiles, ['js:build']);
});

gulp.task('jsx:build', function() {
  return gulp.src(jsxFiles)
    .pipe(plumber({errorHandler: handleError('jsx:build')}))
    .pipe(react())
    .pipe(gulp.dest('app/'));
});

gulp.task('jsx:watch', function() {
  return gulp.src(jsxFiles)
    .pipe(watch(jsxFiles))
    .pipe(plumber({errorHandler: handleError('jsx:build')}))
    .pipe(react())
    .pipe(gulp.dest('app/'));
});

gulp.task('css:build', function() {
  var _stylus = gulp.src(cssFiles.stylus)
        .pipe(plumber({errorHandler: handleError('css:build')}))
        .pipe(stylus());
  var _css = gulp.src(cssFiles.css);
  var _sass = gulp.src(cssFiles.sass).pipe(sass().on('error', sass.logError));
  var _less = gulp.src(cssFiles.less)
        .pipe(plumber({errorHandler: handleError('css:build')}))
        .pipe(less());
  return merge(_stylus, _css, _sass, _less)
    .pipe(prefix("last 3 version"))
    .pipe(minifyCSS({keepSpecialComments: 0}))
    .pipe(concat(bundleCssFilename, {newLine: ''}))
    .pipe(gulp.dest(bundleCssDest));
});

gulp.task('css:watch', function() {
  var files = [];
  for (var key in cssFiles) {
    files = files.concat(cssFiles[key]);
  }
  return gulp.watch(files, ['css:build']);
});

gulp.task('manifest:build', function(){
  var manifest = require('gulp-manifest');
  return gulp.src(['dist/**/*'])
    .pipe(manifest({
      filename: 'offline.manifest',
      hash: true,
      preferOnline: false,
      network: ['http://*', 'https://*', '*'],
      exclude: ['offline.manifest', 'index.mustache']
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('manifest:watch', function() {
  var manifest = require('gulp-manifest');
  return gulp.watch(['dist/**/*'], ['manifest:build']);
});

gulp.task('livereload:watch', function() {
  return watch(['dist/offline.manifest']).pipe(livereload({start: true}));
});

function handleError(task) {
  return function(err) {
    gutil.log(gutil.colors.red(err));
    notify.onError(task + ' failed, check the logs..')(err);
  };
}
