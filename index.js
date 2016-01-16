const path = require('path');

module.exports = {
    parser: require(path.join(path.dirname(__filename), 'lib', 'parser.js'))
};
