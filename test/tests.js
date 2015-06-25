/**
 * Copyright (c) 2014-2015, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 */

/*global describe, it, before */

'use strict';

var fs = require( 'fs' ),
	path = require( 'path' ),
	combine = require( '../lib' ),
	expect = require( 'chai' ).expect;

describe( 'DOM Combiner', function() {
	var sources = {};

	function removeWhiteSpaces( str ) {
		return str.replace( /(\r|\n|\t)/g, '' );
	}

	before( function( done ) {
		fs.readdir( __dirname, function( err, files ) {
			if ( err ) {
				return console.error( err );
			}

			function loadFile() {
				var file = files.shift();

				if ( !file ) {
					return done();
				}

				if ( path.extname( file ) !== '.html' ) {
					return loadFile();
				}

				fs.readFile( path.join( __dirname, file ), function( err, data ) {
					if ( err ) {
						return console.error( err );
					}

					sources[ path.basename( file, '.html' ) ] = data.toString();
					loadFile();
				} );
			}

			loadFile();
		} );
	} );

	function checkEqual( a, b ) {
		expect( removeWhiteSpaces( a ) ).to.equal( removeWhiteSpaces( b ) );
	}

	it( 'should not parse nor modify script contents', function() {
		checkEqual( combine( sources.template, sources.tpl ), sources[ 'tpl.result' ] );
	} );

	it( 'should not parse nor modify textarea contents', function() {
		checkEqual( combine( sources.template, sources.textarea ), sources[ 'textarea.result' ] );
	} );

	it( 'should merge head element with template', function() {
		checkEqual( combine( sources.template, sources.head ), sources[ 'head.result' ] );
	} );

	it( 'should merge body element with template', function() {
		checkEqual( combine( sources.template, sources.body ), sources[ 'body.result' ] );
	} );

	it( 'should override template\'s doctype', function() {
		checkEqual( combine( sources.template, sources.doctype ), sources[ 'doctype.result' ] );
	} );

	it( 'should override meta tag\'s value', function() {
		checkEqual( combine( sources.template, sources.meta ), sources[ 'meta.result' ] );
	} );

	it( 'should override title tag\'s value', function() {
		checkEqual( combine( sources.template, sources.title ), sources[ 'title.result' ] );
	} );

	it( 'should not evaluate escaped characters', function() {
		checkEqual( combine( sources.template, sources.escape ), sources[ 'escape.result' ] );
	} );
} );
