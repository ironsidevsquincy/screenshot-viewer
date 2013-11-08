
/*
 * GET home page.
 */

var AWS = require('aws-sdk'),
    _   = require('lodash'),
    s3  = new AWS.S3();

exports.index = function(req, res){
    // get screenshot files
    s3.listObjects({Bucket: 'aws-frontend-store', Prefix: 'CODE/screenshots'}, function(err, data) {
        var urls = _.unique(data.Contents.map(function(content) {
            return content.Key.split('/').pop().split('-').shift();
        }));
        res.render('index', { urls: urls });
    });
};

exports.page = function(req, res){
    // get screenshot files
    s3.listObjects({Bucket: 'aws-frontend-store', Prefix: 'CODE/screenshots'}, function(err, data) {
        var urls = _.unique(data.Contents.map(function(content) {
            return content.Key.split('/').pop().split('-').shift();
        }));
        res.render('page', { page: req.query.url });
    });
};