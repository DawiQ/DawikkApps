const express = require('express')
const path = require("path");
const app = express()

// #############################################################################
// Logs all request paths and method
app.use(function (req, res, next) {
  res.set('x-timestamp', Date.now())
  res.set('x-powered-by', 'cyclic.sh')
  console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.path}`);
  next();
});

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
  index: ['index.html'],
  maxAge: '1m',
  // Must stay true: with redirect disabled a directory URL without a trailing
  // slash (e.g. /Hnefatafl) never reaches index.html and falls through to the
  // catch-all handler below, which answers with a raw JSON dump of the request.
  redirect: true
}
app.use(express.static('public', options))

// #############################################################################
// Catch all handler for all other requests: a plain 404 page. It used to echo
// the request back as JSON, which made unknown URLs look like a broken endpoint
// instead of a website.
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'))
})

module.exports = app
