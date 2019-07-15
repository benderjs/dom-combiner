/**
 * Copyright (c) 2014-2015, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 */

'use strict';

var utils = require( 'domutils' ),
	_ = require( 'lodash' );

/**
 * Combine two HtmlParser2 DOMs
 * @param  {<Object>} dest Destination HtmlParser2 DOM
 * @param  {<Object>} src Source HtmlParser2 DOM
 * @return {Object}
 */
function combine( dest, src ) {
	var destChildren = dest.children;

	function find( collection, name ) {
		return _.filter( collection, {
			name: name
		} )[ 0 ];
	}

	/**
	 * Append a tag to the destination or destination's <body> element if found
	 * @param {Object} elem Element to append
	 */
	function appendTag( elem ) {
		var parent;
		// no parent or parent is a root = we're at the top level -> try to add to body
		if ( !elem.parent || elem.parent.type === 'root' ) {
			parent = find( destChildren, 'html' );

			if ( parent ) {
				parent = find( parent.children, 'body' );
			}

			if ( parent ) {
				utils.appendChild( parent, elem );
			} else {
				// append the element to the destination
				utils.append( destChildren[ destChildren.length - 1 ], elem );
			}
			// append the element to the destination
		} else {
			utils.append( destChildren[ destChildren.length - 1 ], elem );
		}
	}

	/**
	 * Merge element with equivalent found in destination
	 * @param {Object}   elem     Source element
	 * @param {Function} callback Callback called when equivalent found
	 */
	function merge( elem, callback ) {
		var old = find( destChildren, elem.name ),
			nl;

		// merge with old element
		if ( old ) {
			if ( typeof callback == 'function' ) {
				return callback( old );
			}

			_.merge( old.attribs, elem.attribs );

			if ( elem.children ) {
				combine( old, elem );
			}
			// append new element
		} else {
			if ( dest.children ) {
				utils.appendChild( dest, elem );
			} else {
				utils.prepend( destChildren[ 0 ], elem );
				// fix for domutils issue
				elem.parent = destChildren[ 0 ].parent;
				destChildren.unshift( elem );
				destChildren.splice( destChildren.indexOf( elem ) + 1, 0, nl );
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
			destChildren[ destChildren.indexOf( old ) ] = elem;
		} );
	}

	/**
	 * Merge <head> and <body> tags that are directly in the source
	 * @param {Object} elem New head/body element
	 */
	function mergeHeadBody( elem ) {
		var old = find( destChildren, elem.name ),
			html;

		if ( old ) {
			merge( elem );
		} else {
			html = find( destChildren, 'html' );
			combine( html.children, elem );
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
			old = _.filter( destChildren, {
				name: 'meta'
			} ),
			merged = false;

		[ 'charset', 'name', 'http-equiv' ].forEach( function( meta ) {
			if ( !attr[ meta ] ) {
				return;
			}

			old.forEach( function( el ) {
				var idx;

				if ( ( el.attribs[ meta ] === attr[ meta ] ) ||
					( meta === 'charset' && el.attribs[ meta ] ) ) {
					idx = destChildren.indexOf( el );
					utils.replaceElement( el, elem );
					destChildren[ idx ] = elem;
					merged = true;
				}
			} );
		} );

		return merged;
	}

	// iterate over all source elements
	src.children.forEach( function( elem ) {
		var name = elem.name;

		// ignore plain text and comments ?
		if ( elem.type === 'text' || elem.type === 'comment' ) {
			return appendTag( elem );
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
