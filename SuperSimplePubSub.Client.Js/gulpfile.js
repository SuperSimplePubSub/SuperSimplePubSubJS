var gulp        = require('gulp'),
    concat      = require('gulp-concat'),
    sourcemaps  = require('gulp-sourcemaps'),
    ts          = require('gulp-typescript'),
    tslint      = require('gulp-tslint'),
    karma       = require('karma').server;


var paths = {
  scripts: ['src/*.ts', 'tests/*.ts'],
  configs: {
    ts: __dirname + '/tsconfig.json',
    karma: __dirname + '/karma.conf.js'
  }
};



gulp.task('lint', function() {
  gulp.src(paths.scripts)
      .pipe(tslint())
      .pipe(tslint.report('verbose'));
});


var tsProject = ts.createProject(paths.configs.ts, { sortOutput: true });
gulp.task('compile', function() {
  var tsResult = tsProject.src()
    .pipe(ts(tsProject, undefined, ts.reporter.longReporter()));

  return tsResult.js.pipe(gulp.dest('.'));
});


gulp.task('test', ['compile'], function(done) {
  karma.start({
    configFile: paths.configs.karma,
    browsers: ['Chrome', 'Firefox'],
    singleRun: true
  }, done);
});

gulp.task('tdd', ['compile'], function(done) {
  karma.start({
    configFile: paths.configs.karma
  }, done);
});


gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['compile']);
});

gulp.task('default', ['watch', 'tdd']);

gulp.task('dest', ['lint', 'test']);
