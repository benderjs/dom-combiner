var htmlparser = require('htmlparser2'),
    combine = require('./combiner');

/**
 * Combine html from multiple sources
 * @param {Array.<String>|...String} sources Two or more HTML sources to combine
 * @return {String} Combined HTMLs
 */
module.exports = function (sources) {
    var parsed = [],
        parser,
        output;

    if (!Array.isArray(sources)) sources = Array.prototype.slice.call(arguments, 0);

    parser = new htmlparser.Parser(new htmlparser.DomHandler(function (err, dom) {
        if (err) throw new Error('Error while parsing HTML -', err);
        parsed.push(dom);
    }/*, { normalizeWhitespace: true }*/));

    sources.forEach(parser.parseComplete.bind(parser));

    // combine parsed objects
    output = parsed.reduce(combine, parsed.shift());
    output = Array.isArray(output) ? output : [output];
    // render html from DOM objects
    output = output.map(htmlparser.DomUtils.getOuterHTML);

    return output.join('');
};
