/*global describe, it, before */

'use strict';

var fs = require( 'fs' ),
	path = require( 'path' ),
	combine = require( '../lib' ),
	expect = require( 'chai' ).expect;

describe( 'DOM Combiner', function() {
	var sources = {};

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

	it( 'should combine sources', function() {
		console.log( combine( sources.template, sources[ 1 ] ) );
	} );
} );
