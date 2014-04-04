var fs = require('fs'),
    path = require('path'),
    combine = require('../lib'),
    sources = {},
    combined;

fs.readdirSync(__dirname).forEach(function (file) {
    if (file === 'tests.js') return;

    sources[file] = fs.readFileSync(path.join(__dirname, file)).toString();
});

combined = combine(sources['template.html'], sources['1.html'], sources['2.html'], sources['3.html']);

console.log(combined);

// TODO prepare proper test cases
