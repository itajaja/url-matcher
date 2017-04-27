var path = require('path')

module.exports = function (config) {

  config.set({
    browsers: [ 'Chrome' ],
    frameworks: [ 'mocha' ],
    reporters: [ 'mocha' ],
  })

}
