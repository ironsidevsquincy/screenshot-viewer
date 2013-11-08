
/*
 * GET home page.
 */

var AWS = require('aws-sdk'),
    _   = require('lodash'),
    s3  = new AWS.S3();

exports.index = function(req, res){
    s3.listObjects({Bucket: 'aws-frontend-store', Prefix: 'CODE/screenshots'}, function(err, data) {
        var pages = _.unique(data.Contents.map(function(content) {
            return content.Key.split('/')[2];
        }));
        res.render('index', { pages: pages });
    });
};

exports.page = function(req, res){
    var page = req.query.page,
        breakpoint = req.query.breakpoint || 'mobile';
    // get screenshot
    s3.listObjects({Bucket: 'aws-frontend-store', Prefix: 'CODE/screenshots/' + page + '/' + breakpoint}, function(err, data) {
        var screenshots = _.unique(data.Contents.map(function(content) {
            return 'https://s3-eu-west-1.amazonaws.com/' + data.Name + '/' + content.Key
        }));
        res.render('page', { page: page, screenshots: screenshots });
    });
};