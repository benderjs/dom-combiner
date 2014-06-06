var utils = require( 'htmlparser2' ).DomUtils,
	_ = require( 'lodash' );

/**
 * Combine two HtmlParser2 DOMs
 * @param  {Array.<Object>} dest Destination HtmlParser2 DOM
 * @param  {Array.<Object>} src Source HtmlParser2 DOM
 * @return {Object}
 */
function combine( dest, src ) {
	var newLine = {
		data: '\n',
		type: 'text'
	};

	function find( collection, name ) {
		return _.where( collection, {
			name: name
		} )[ 0 ];
	}

	/**
	 * Append a tag to the destination or destination's <body> if found
	 * @param {Object} elem Element to append
	 */
	function appendTag( elem ) {
		var parent;
		// no parent = we're at the top level -> try add to body
		if ( !elem.parent ) {
			parent = find( dest, 'html' );

			if ( parent ) {
				parent = find( parent.children, 'body' );
			}

			if ( parent ) {
				utils.appendChild( parent, elem );
			} else {
				// append element to destination
				utils.append( dest[ dest.length - 1 ], elem );
			}
			// append element to destination
		} else {
			utils.append( dest[ dest.length - 1 ], elem );
		}
		// add new line after appending new tag
		utils.append( elem, _.clone( newLine ) );
	}

	/**
	 * Merge element with equivalent found in destination
	 * @param {Object}   elem     Source element
	 * @param {Function} callback Callback called when equivalent found
	 */
	function merge( elem, callback ) {
		var old = find( dest, elem.name ),
			nl;

		// merge with old element
		if ( old ) {
			if ( typeof callback == 'function' ) {
				return callback( old );
			}

			_.merge( old.attribs, elem.attribs );

			if ( elem.children ) {
				combine( old.children, elem.children );
			}
			// append new element
		} else {
			nl = _.clone( newLine );

			if ( dest.children ) {
				utils.appendChild( dest, elem );
				// add new line character
				utils.append( elem, nl );
			} else {
				utils.prepend( dest[ 0 ], elem );
				// fix for domutils issue
				elem.parent = dest[ 0 ].parent;
				dest.unshift( elem );
				// add new line character
				utils.append( elem, nl );
				dest.splice( dest.indexOf( elem ) + 1, 0, nl );
			}
		}
	}

	/**
	 * Merge doctype directives
	 * @param {Object} elem New doctype directive
	 */
	function mergeDoctype( elem ) {
		merge( elem, function( old ) {
			utils.replaceElement( old, elem );
			dest[ dest.indexOf( old ) ] = elem;
		} );
	}

	/**
	 * Merge <head> and <body> tags that are directly in the source
	 * @param {Object} elem New head/body element
	 */
	function mergeHeadBody( elem ) {
		var old = find( dest, elem.name ),
			html;

		if ( old ) {
			merge( elem );
		} else {
			html = find( dest, 'html' );
			combine( html.children, [ elem ] );
		}
	}

	/**
	 * Merge <title> tags
	 * @param {Object} elem New title tag
	 */
	function mergeTitle( elem ) {
		merge( elem, function( old ) {
			var text = elem.children[ 0 ];

			utils.replaceElement( old.children[ 0 ], text );
			old.children[ 0 ] = text;
		} );
	}

	/**
	 * Merge <meta> tags
	 * @param  {Object} elem New meta tag
	 * @return {Boolean} True if merged
	 */
	function mergeMeta( elem ) {
		var attr = elem.attribs,
			old = _.where( dest, {
				name: 'meta'
			} ),
			added = false;

		[ 'charset', 'name', 'http-equiv' ].forEach( function( meta ) {
			if ( !attr[ meta ] ) {
				return;
			}

			old.forEach( function( el ) {
				var idx;

				if ( ( el.attribs[ meta ] === attr[ meta ] ) ||
					( meta === 'charset' && el.attribs[ meta ] ) ) {
					idx = dest.indexOf( el );
					utils.replaceElement( el, elem );
					dest[ idx ] = elem;
					added = true;
				}
			} );
		} );

		return added;
	}

	// iterate over all source elements
	src.forEach( function( elem ) {
		var name = elem.name;

		// ignore plain text and comments ?
		if ( elem.type === 'text' || elem.type === 'comment' ) {
			return;
		}

		if ( name === '!doctype' ) {
			mergeDoctype( elem );
		} else if ( name === 'html' ) {
			merge( elem );
		} else if ( name === 'head' || name === 'body' ) {
			mergeHeadBody( elem );
		} else if ( name === 'title' ) {
			mergeTitle( elem );
		} else if ( name === 'meta' && mergeMeta( elem ) ) {
			return;
		} else {
			appendTag( elem );
		}
	} );

	return dest;
}

module.exports = combine;
