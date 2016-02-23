var sync = require('synchronize');
var request = require('request');
var _ = require('underscore');
var https = require('https');

// The Type Ahead API.
module.exports = function(req, res) {
  var term = req.query.text.trim();
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
      headers: {
        'user-agent': 'node.js'
      },
      qs: {
        q: term,
      },
      json: true,
      gzip: true,
      timeout: 10 * 1000
    }, sync.defer()));
  } catch (e) {
    res.status(500).send('Error');
    return;
  }

  if (response.statusCode !== 200 || !response.body) {
    res.status(500).send('Error');
    return;
  }

  var results = _.chain(response.body.items)
    .map(function(item) {
      return {
        title: item.full_name,
        text: item.html_url
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
