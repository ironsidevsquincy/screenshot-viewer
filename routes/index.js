
/*
 * GET home page.
 */

var AWS = require('aws-sdk'),
    _   = require('lodash'),
    s3  = new AWS.S3();

exports.index = function(req, res){
    var env = req.query.env || 'code';
    s3.listObjects({Bucket: 'aws-frontend-store', Prefix: env.toUpperCase() + '/screenshots'}, function(err, data) {
        var pages = data.Contents
            // pull out page url (3 part of the key)
            .map(function(content) {
                return content.Key.split('/')[2];
            });
        res.render('index', { pages: _.unique(pages) });
    });
};

exports.page = function(req, res){
    var page = req.query.page,
        env = req.query.env || 'code',
        breakpoint = req.query.breakpoint || 'mobile';
    // get screenshots for this page, breakpoint and env
    s3.listObjects({Bucket: 'aws-frontend-store', Prefix: env.toUpperCase() + '/screenshots/' + page + '/' + breakpoint}, function(err, data) {
        var screenshots = data.Contents
            // order by date
            .sort(function(screenshotOne, screenshotTwo) {
                return screenshotTwo.LastModified - screenshotOne.LastModified;
            })
            // pull out src and date
            .map(function(content) {
                return {
                    date: content.Key.split('/').slice(4, 8).join('/').split('.').shift(),
                    src: 'https://' + data.Name + '.s3.amazonaws.com/' + content.Key
                }
            });
        res.render('page', { page: page, screenshots: screenshots });
    });
};