/**
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 */

'use strict';

var parse5 = require( 'parse5' ),
	combine = require( './combiner' );

/**
 * Combine html from multiple sources
 * @param  {Array.<String>|...String} sources    Two or more HTML sources to combine
 * @param  {Function}                 [callback] Function called when done or when an error occures
 * @return {String} Combined HTMLs
 */
module.exports = function( sources, callback ) {
	var docPattern = /^(?:\s|\n)*<(!doctype|html|head|body)/i,
		serializer,
		parsed,
		parser,
		output;

	if ( !Array.isArray( sources ) ) {
		sources = Array.prototype.slice.call( arguments, 0 );

		if ( typeof sources[ sources.length - 1 ] == 'function' ) {
			callback = sources.pop();
		}
	}

	serializer = new parse5.TreeSerializer( parse5.TreeAdapters.htmlparser2 );

	var oldSerializeTextNode = serializer._serializeTextNode;

	// override serializer's text node serialization method to avoid escaping textarea and code tags content's
	serializer._serializeTextNode = function( node ) {
		var parent = this.treeAdapter.getParentNode( node ),
			parentTn = parent && this.treeAdapter.getTagName( parent );

		if ( parentTn === 'textarea' || parentTn === 'code' ) {
			this.html += this.treeAdapter.getTextNodeContent( node );
		} else {
			oldSerializeTextNode.apply( this, arguments );
		}
	};

	parser = new parse5.Parser( parse5.TreeAdapters.htmlparser2 );

	parsed = sources.map( function( src ) {
		return parser[ docPattern.test( src ) ? 'parse' : 'parseFragment' ]( src );
	} );

	// combine parsed objects
	output = parsed.reduce( combine, parsed.shift() );
	output = Array.isArray( output ) ? output : [ output ];

	// render html from DOM objects
	output = output.map( function( tree ) {
		return serializer.serialize( tree );
	} );

	if ( typeof callback == 'function' ) {
		callback( null, output.join( '' ) );
	} else {
		return output.join( '' );
	}
};
