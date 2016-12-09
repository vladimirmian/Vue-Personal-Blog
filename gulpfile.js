'use strict'
let gulp = require('gulp'),
    path = require('path'),
    $ = require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    browserSyncSpa = require('browser-sync-spa'),
    proxy = require('http-proxy-middleware');
const root = 'blog';
const build = 'wwww';
const paths = {
    index: root + '/index.html',
    bowerJs: [path.join(root, 'bower_components/**/*.min.js'), path.join(root, 'bower_components/**/*-min.js')],
    bowerStyle: [path.join(root, 'bower_components/**/*.min.css'), path.join(root, 'bower_components/**/**/*.min.css')],
    devScript: [path.join(root, '/*.js'), path.join(root, 'develop/*.js'), path.join(root, 'config/*.js'), path.join(root, 'router/*.js')],
    devHtml: [path.join(root, 'views/*.html'), path.join(root, 'view/**/*.html')],
    devScss: [path.join(root, 'sass/*.scss'), path.join(root, 'sass/**/*.scss')],
    devCss: root + '/style/*.css'
}

const injectOption = {
    bower: { name: 'bower', relative: true },
    dev: { name: 'dev', relative: true },
    sass: { name: 'prod', relative: true, addRootSlash: false }
}
const sassOptions = {
    outputStyle: 'compressed',
    precision: 10
};
gulp.task('clean', function() {
    return gulp.src(paths.devCss)
        .pipe($.clean());
});
gulp.task('style', ['clean'], function() {
    return gulp.src(paths.devScss)
        .pipe($.sass(sassOptions).on('error', $.sass.logError))
        .pipe(gulp.dest(path.join(root, 'style')));
});
gulp.task('inject-all', ['style'], function() {
    return gulp.src(paths.index)
        .pipe($.inject(gulp.src(paths.bowerStyle), injectOption.bower))
        .pipe($.inject(gulp.src(paths.devCss), injectOption.dev))
        .pipe($.inject(gulp.src(paths.bowerJs), injectOption.bower))
        .pipe($.inject(gulp.src(paths.devScript), injectOption.dev))
        .pipe(gulp.dest(root));
});

gulp.task('inject-dev', function() {
    return gulp.src(paths.index)
        .pipe($.inject(gulp.src(paths.devScript), injectOption.dev))
        .pipe(gulp.dest(root));
});

gulp.task('inject-style', ['style'], function() {
    return gulp.src(paths.index)
        .pipe($.inject(gulp.src(paths.devCss), injectOption.dev))
        .pipe(gulp.dest(root))
        .pipe(browserSync.stream());
});

gulp.task('watch', ['inject-all'], function() {
    //没有安装那个compass的情况下用这个
    /*gulp.watch(paths.devScss, function(cb) {
        if (isOnlyChange(cb)) {
            compileSingle(cb)
                .pipe(browserSync.stream());
        } else {
            gulp.start('inject-style');
        }
    });*/
    //使用那个compass的时候
    gulp.watch(paths.devCss, function(cb) {
        if (isOnlyChange(cb)) {
            gulp.src(cb.path)
                .pipe(browserSync.stream());
        } else {
            reInjectStyle();
        }
    });
    gulp.watch(paths.devScript, function(cb) {
        if (isOnlyChange(cb)) {
            gulp.src(cb.path)
                .pipe(eslint())
                .pipe(eslint.format())
                .pipe(browserSync.stream());
        } else {
            gulp.start('inject-dev');
        }
    });
});
// use the compass to prod
gulp.task('serve', ['watch'], function() {
    browserSync.init({
        port: 9105,
        startPath: '/',
        //open: 'local',
        server: {
            baseDir: root,
            index: 'index.html',
            /*middleware: proxy('/api', {
                target: 'http://tmct.73go.cn/api/',
                changeOrigin: true
            })*/
        },
        brower: 'default'
    });
});







function isOnlyChange(cb) {
    return cb.type === 'changed';
}

function compileSingle(cb) {
    return gulp.src(cb.path)
        .pipe($.sass(sassOptions).on('error', $.sass.logError))
        .pipe(gulp.dest(path.join(root, 'style')))
        .pipe(browserSync.stream());
}

function reInjectStyle() {
    return gulp.src(paths.index)
        .pipe($.inject(gulp.src(paths.devCss), injectOption.dev))
        .pipe(gulp.dest(root))
        .pipe(browserSync.stream());
}
