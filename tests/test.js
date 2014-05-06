var fs = require('fs'),
    path = require('path'),
    combine = require('../lib'),
    sources = {},
    combined;

fs.readdirSync(__dirname).forEach(function (file) {
    if (file === 'tests.js') return;

    sources[file] = fs.readFileSync(path.join(__dirname, file)).toString();
});

combine(sources['template.html'], sources['1.html'], sources['2.html'], sources['3.html'], function (err, combined) {
    if (err) return console.err(err);
    console.log(combined);
});

console.log(
    combine(
        sources['template.html'],
        sources['1.html'],
        sources['2.html'],
        sources['3.html']
    )
);

// TODO prepare proper test cases
