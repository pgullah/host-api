const util = require('util');
const childProcess = require('child_process');
module.exports = util.promisify(childProcess.exec);