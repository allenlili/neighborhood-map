'use strict';
const gulp                      = require('gulp');                      // task engine
const htmlmin                   = require('gulp-htmlmin');              // compress html
const minifyCss                 = require('gulp-minify-css');           // compress css
const injectCSS                 = require('gulp-inject-css');           // inject css
const uglify                    = require('gulp-uglify');               // compress js
const del                       = require('del');                       // delete files and folders
const imagemin                  = require('gulp-imagemin');             // compressing image
const imageminPngquant          = require('imagemin-pngquant');
const imageminJpegRecompress    = require('imagemin-jpeg-recompress');
const imageResize               = require('gulp-image-resize');         // compressing and resize image
const rename                    = require("gulp-rename");               // rename files
const browserSync               = require('browser-sync').create();     // live reload
const plumber                   = require('gulp-plumber');              // handle error, can continue gulp watch
const deploy                    = require('gulp-gh-pages');             // deploy to github page
const babel                     = require('gulp-babel');

// path
const HTML_PATH = 'src/*.html';
const CSS_PATH = 'src/css/**/*.css';
const SCRIPTS_PATH = 'src/js/**/*.js';
const IMAGES_PATH = 'src/img/**/*.{png,jpeg,jpg,svg,gif}';
const DEST_PATH = 'dist/';

let errHandler = function (type, err) {
    console.log(type + ' Task Error');
    console.log(err);
    this.emit('end');
};

// html
gulp.task('htmls', function(){
    console.log("starting task htmls...");
    gulp.src(HTML_PATH)
        .pipe(plumber(errHandler))
        .pipe(injectCSS())
        .pipe(htmlmin({
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
                removeComments: true
            }))
        .pipe(gulp.dest(DEST_PATH));
});

// styles
gulp.task('styles', function(){
    console.log("starting task styles...");
    gulp.src(CSS_PATH)
        .pipe(plumber(errHandler))
        .pipe(minifyCss({keepSpecialComments: 1}))
        .pipe(gulp.dest(DEST_PATH + 'css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// scripts
gulp.task('scripts', function(){
    console.log("starting task scripts...");
    gulp.src(SCRIPTS_PATH)
        .pipe(plumber(errHandler))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(DEST_PATH + 'js'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// images
const options = {
    interlaced: true,
    progressive: true,
    optimizationLevel: 3
};
const plugins = [
    imagemin.gifsicle({interlaced: true}),
    imagemin.jpegtran({progressive: true}),
    imagemin.optipng({optimizationLevel: 7}),
    imagemin.svgo(),
    imageminPngquant(),
    imageminJpegRecompress()
];
gulp.task('images', function(){
    console.log("starting task images...");
    gulp.src(IMAGES_PATH)
        .pipe(plumber(errHandler))
        .pipe(imagemin(plugins, options))
        .pipe(gulp.dest(DEST_PATH + '/img'));
});

gulp.task('images-resize', function(){
    console.log('starting task image resize...');
    gulp.src('src/views/images/pizzeria.jpg')
        .pipe(imageResize({
                width : 100,
                height : 75,
                crop : true,
                upscale: false
            }
        ))
        .pipe(imagemin())
        .pipe(rename(function (path) {path.basename += '-small';}))
        .pipe(gulp.dest(DEST_PATH + 'views/images'));
});

// delete
gulp.task('clean', function(){
    console.log("starting task clean...");
    del.sync([
        DEST_PATH
    ]);
});

// default
gulp.task('default', ['clean', 'htmls', 'styles', 'scripts'], function(){
    console.log("starting tasks .clean.htmls.styles.scripts");
});

// watch
gulp.task('watch', ['htmls', 'styles', 'scripts'], function(){
    console.log("starting task watch...");
    // init browser
    browserSync.init({
        server: {
            baseDir: './dist'
        }
    });
    // reload when changes
    return gulp.watch(
        [
            HTML_PATH,
            CSS_PATH,
            SCRIPTS_PATH,
            'gulpfile.js'
        ], undefined, ['htmls', 'styles', 'scripts']).on('change', browserSync.reload);
});

gulp.task('deploy', function(){
    console.log('starting task deploy...');
    del.sync([
        '.publish'
    ]);
    return gulp.src('./dist/**/*')
            .pipe(deploy());
});
