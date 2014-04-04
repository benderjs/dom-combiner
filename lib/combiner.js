var utils = require('htmlparser2').DomUtils,
    _ = require('lodash');

/**
 * Combine two HtmlParser2 DOMs
 * @param  {Array.<Object>} dest Destination HtmlParser2 DOM
 * @param  {Array.<Object>} src Source HtmlParser2 DOM
 * @return {Object}
 */
function combine(dest, src) {
    var newLine = {
            data: '\n',
            type: 'text'
        };

    /**
     * Append a tag to the destination or destination's <body> if found
     * @param {Object} elem Element to append
     */
    function appendTag(elem) {
        // search for html tag
        var old = _.where(dest, { name: 'html' })[0];
        // search for body tag
        if (old) old = _.where(old.children, { name : 'body' })[0];
        // append element to body
        if (old) utils.appendChild(old, elem);
        // append element to destination
        else utils.append(dest[dest.length - 1], elem);
        // add new line after appending new tag
        utils.append(elem, _.clone(newLine));
    }

    /**
     * Merge element with equivalent found in destination
     * @param {Object}   elem     Source element
     * @param {Object}   options  Search options
     * @param {Function} callback Callback called when equivalent found
     */
    function merge(elem, options, callback) {
        var old = _.where(dest, options)[0],
            nl;

        // merge with old element
        if (old) {
            if (typeof callback == 'function') return callback(old);

            _.merge(old.attribs, elem.attribs);
            if (elem.children) combine(old.children, elem.children);
        // append new element
        } else {
            nl = _.clone(newLine);
            
            if (dest.children) {
                utils.appendChild(dest, elem);
                // add new line character
                utils.append(elem, nl);
            } else {
                utils.prepend(dest[0], elem);
                // fix for domutils issue
                elem.parent = dest[0].parent;
                dest.unshift(elem);
                // add new line character
                utils.append(elem, nl);
                dest.splice(dest.indexOf(elem) + 1, 0, nl);
            }
        }
    }

    /**
     * Merge doctype directives
     * @param {Object} elem New doctype directive
     */
    function mergeDoctype(elem) {
        merge(elem, { name: '!doctype' }, function (old) {
            utils.replaceElement(old, elem);
            dest[dest.indexOf(old)] = elem;
        });
    }

    /**
     * Merge <title> tags
     * @param {Object} elem New title tag
     */
    function mergeTitle(elem) {
        merge(elem, { name: 'title' }, function (old) {
            var text = elem.children[0];

            utils.replaceElement(old.children[0], text);
            old.children[0] = text;
        });
    }

    /**
     * Merge <meta> tags
     * @param  {Object} elem New meta tag
     * @return {Boolean} True if merged
     */
    function mergeMeta(elem) {
        var attr = elem.attribs,
            old = _.where(dest, { name: 'meta' }),
            added = false;

        ['charset', 'name', 'http-equiv'].forEach(function (meta) {
            if (!attr[meta]) return;

            old.forEach(function (el) {
                var idx;

                if ((el.attribs[meta] === attr[meta]) ||
                    (meta === 'charset' && el.attribs[meta])) {
                    idx = dest.indexOf(el);
                    utils.replaceElement(el, elem);
                    dest[idx] = elem;
                    added = true;
                }
            });
        });

        return added;
    }

    // iterate over all source elements
    src.forEach(function (elem) {
        var name = elem.name;

        // ignore plain text and comments ?
        if (elem.type === 'text' || elem.type === 'comment') return;

        if (name === '!doctype') mergeDoctype(elem);
        else if (['html', 'head', 'body'].indexOf(name) > -1)  merge(elem, { name: name });
        else if (name === 'title') mergeTitle(elem);
        else if (name === 'meta' && mergeMeta(elem)) return;
        else appendTag(elem);
    });

    return dest;
}

module.exports = combine;
