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

	it( 'should not parse nor modify script contents', function() {
		expect(
			removeWhiteSpaces(
				combine( sources.template, sources.tpl )
			)
		).to.equal(
			removeWhiteSpaces( sources[ 'tpl.result' ] )
		);
	} );

	it( 'should not parse nor modify textarea contents', function() {
		expect(
			removeWhiteSpaces(
				combine( sources.template, sources.textarea )
			)
		).to.equal(
			removeWhiteSpaces(
				sources[ 'textarea.result' ]
			)
		);
	} );

	it( 'should merge head element with template', function() {
		expect(
			removeWhiteSpaces(
				combine( sources.template, sources.head )
			)
		).to.equal(
			removeWhiteSpaces(
				sources[ 'head.result' ]
			)
		);
	} );

	it( 'should merge body element with template', function() {
		expect(
			removeWhiteSpaces(
				combine( sources.template, sources.body )
			)
		).to.equal(
			removeWhiteSpaces(
				sources[ 'body.result' ]
			)
		);
	} );

	it( 'should override template\'s doctype', function() {
		expect(
			removeWhiteSpaces(
				combine( sources.template, sources.doctype )
			)
		).to.equal(
			removeWhiteSpaces(
				sources[ 'doctype.result' ]
			)
		);
	} );

	it( 'should override meta tag\'s value', function() {
		expect(
			removeWhiteSpaces(
				combine( sources.template, sources.meta )
			)
		).to.equal(
			removeWhiteSpaces(
				sources[ 'meta.result' ]
			)
		);
	} );
} );
