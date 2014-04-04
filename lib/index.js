var htmlparser = require('htmlparser2'),
    combine = require('./combiner');

/**
 * Combine html from multiple sources
 * @param {String} dest Destination HTML
 * @param {...String} sources One or more HTML sources to combine with destination template
 * @return {String} Combined HTMLs
 */
module.exports = function (dest, sources) {
    var parsed = [],
        parser,
        output;

    if (arguments.length < 2) throw new Error('Not enough arguments');

    parser = new htmlparser.Parser(new htmlparser.DomHandler(function (err, dom) {
        if (err) throw new Error('Error while parsing HTML -', err);
        parsed.push(dom);
    }/*, { normalizeWhitespace: true }*/));

    Array.prototype.forEach.call(arguments, parser.parseComplete.bind(parser));

    // combine parsed objects
    output = parsed.reduce(combine, parsed.shift());
    output = Array.isArray(output) ? output : [output];
    // render html from DOM objects
    output = output.map(htmlparser.DomUtils.getOuterHTML);

    return output.join('');
};
