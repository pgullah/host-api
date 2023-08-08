const exec = util.promisify(require('child_process').exec);
const shell = async (cmd, ...args) => await exec(`${cmd} ${args.join(" ")}`);
module.exports = shell;