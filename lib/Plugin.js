'use strict';

module.exports = function Plugin(schema, options) {
    //Load up the Application plugin
    schema.plugin(require('./Extension'), options);

};