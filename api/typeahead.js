var key = require('../utils/key');
var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');


// The Type Ahead API.
module.exports = function(req, res) {
  var term = req.query.text.trim();
  // var term = 'everettberry';
  if (!term) {
    res.json([{
      title: '<i>(enter a search term)</i>',
      text: ''
    }]);
    return;
  }

  var response;
  try {
    response = sync.await(request({
      url: 'https://api.github.com/search/repositories',
      qs: {
        q: 'user:' + term,
        // limit: 15,
        // api_key: key
      },
      gzip: true,
      json: true,
      timeout: 10 * 1000
    }, sync.defer()));
  } catch (e) {

    res.status(500).send('Error');
    return;
  }

  if (response.statusCode !== 200 || !response.body || !response.body.data) {
    res.status(500).send('Error');
    return;
  }

  var results = _.chain(response.body.data)
    /*
    .reject(function(image) {
      return !image || !image.images || !image.images.fixed_height_small;
    })
    */
    .map(function(items) {
      return {
        name: items.full_name

        /*
        title: '<img style="height:75px" src="' + image.images.fixed_height_small.url + '">',
        text: 'http://giphy.com/' + image.id
        */

      };
    })
    .value();

  if (results.length === 0) {
    res.json([{
      title: '<i>(no results)</i>',
      text: ''
    }]);
  } else {
    res.json(results);
  }
};
