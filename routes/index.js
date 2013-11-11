
/*
 * GET home page.
 */

var AWS = require('aws-sdk'),
    _   = require('lodash'),
    s3  = new AWS.S3(),
    env = 'CODE';

exports.index = function(req, res){
    s3.listObjects({Bucket: 'aws-frontend-store', Prefix: env + '/screenshots/', Delimiter: '/'}, function(err, data) {
        var pages = data.CommonPrefixes
            // pull out page url (3rd part of the key)
            .map(function(prefix) {
                return prefix.Prefix.split('/')[2];
            });
        res.render('index', { pages: pages });
    });
};

exports.page = function(req, res){
    var page = req.query.page,
        breakpoint = req.query.breakpoint || 'mobile';
    s3.listObjects({Bucket: 'aws-frontend-store', Prefix: env + '/screenshots/', Delimiter: '/'}, function(err, data) {
        var pages = data.CommonPrefixes
            // pull out page url (3rd part of the key)
            .map(function(prefix) {
                return prefix.Prefix.split('/')[2];
            });
        // get screenshots for this page, breakpoint and env
        s3.listObjects({Bucket: 'aws-frontend-store', Prefix: env + '/screenshots/' + page + '/', Delimiter: '/'}, function(err, data) {
            var breakpoints = data.CommonPrefixes
                // pull out breakpoint (4th part of the key)
                .map(function(prefix) {
                    return prefix.Prefix.split('/')[3];
                });
            // get screenshots for this page, breakpoint and env
            s3.listObjects({Bucket: 'aws-frontend-store', Prefix: env + '/screenshots/' + page + '/' + breakpoint}, function(err, data) {
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
                    })
                    .slice(0, 5);;
                res.render('page', { page: page, breakpoint: breakpoint, screenshots: screenshots, pages: pages, breakpoints: breakpoints });
            });
        });
    });
};