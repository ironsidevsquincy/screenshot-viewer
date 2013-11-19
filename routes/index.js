
/*
 * GET home page.
 */

var AWS = require('aws-sdk'),
    _   = require('lodash'),
    moment = require('moment'),
    s3  = new AWS.S3(),
    env = 'CODE';

exports.index = function(req, res){
    s3.listObjects({Bucket: 'aws-frontend-store', Prefix: env + '/screenshots/', Delimiter: '/'}, function(err, data) {
        var pages = data.CommonPrefixes
            // pull out page url (3rd part of the key)
            .map(function(prefix) {
                return decodeURIComponent(prefix.Prefix.split('/')[2]);
            });
        res.render('index', { pages: pages });
    });
};

exports.pages = function(req, res){
    var page = encodeURIComponent(req.query.page),
        breakpoint = req.query.breakpoint || 'mobile';
    // get the available pages
    s3.listObjects({Bucket: 'aws-frontend-store', Prefix: env + '/screenshots/', Delimiter: '/'}, function(err, data) {
        var pages = data.CommonPrefixes
            // pull out page url (3rd part of the key)
            .map(function(prefix) {
                return decodeURIComponent(prefix.Prefix.split('/')[2]);
            });
        // get the available breakpoints
        s3.listObjects({Bucket: 'aws-frontend-store', Prefix: env + '/screenshots/' + page + '/', Delimiter: '/'}, function(err, data) {
            var breakpoints = data.CommonPrefixes
                // pull out breakpoint (4th part of the key)
                .map(function(prefix) {
                    return prefix.Prefix.split('/')[3];
                })
                .sort(function(a, b) {
                    var sizes = ['mobile', 'tablet', 'desktop', 'wide'];
                    return sizes.indexOf(a) - sizes.indexOf(b);
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
                        console.log(content.Key)
                        return {
                            date: moment.unix(parseInt(content.Key.split('/').pop().split('.')[1], 10)).format('ddd Mo, h:mma'),
                            src: encodeURI('https://' + data.Name + '.s3.amazonaws.com/' + content.Key)
                        }
                    })
                    // take first 5
                    .slice(0, 5);
                res.render('page', { page: page, breakpoint: breakpoint, screenshots: screenshots, pages: pages, breakpoints: breakpoints });
            });
        });
    });
};