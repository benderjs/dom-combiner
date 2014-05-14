var htmlparser = require('htmlparser2'),
    combine = require('./combiner');

/**
 * Combine html from multiple sources
 * @param {Array.<String>|...String} sources    Two or more HTML sources to combine
 * @param {Function}                 [callback] Function called when done or when error occures
 * @return {String} Combined HTMLs
 */
module.exports = function (sources, callback) {
    var parsed = [],
        parser,
        output;

    if (!Array.isArray(sources)) {
        sources = Array.prototype.slice.call(arguments, 0);
        
        if (typeof sources[sources.length - 1] == 'function') {
            callback = sources.pop();
        }
    }

    parser = new htmlparser.Parser(
        new htmlparser.DomHandler(function (err, dom) {
            if (err) {
                if (typeof callback == 'function') return callback(err);
                else throw err;
            }

            parsed.push(dom);
        }/*, { normalizeWhitespace: true }*/)
    );

    sources.forEach(parser.parseComplete.bind(parser));

    // combine parsed objects
    output = parsed.reduce(combine, parsed.shift());
    output = Array.isArray(output) ? output : [output];
    // render html from DOM objects
    output = output.map(htmlparser.DomUtils.getOuterHTML);

    if (typeof callback == 'function') callback(null, output.join(''));
    else return output.join('');
};
