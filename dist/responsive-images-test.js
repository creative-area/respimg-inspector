/*
 *  responsive-images-test - v0.1.0
 *  A javascript plugin to check responsive images in the browser.
 *  
 *
 *  Made by Florent Bourgeois
 *  Under MIT License
 */
;( function( window, document, undefined ) {

		"use strict";

		var respImgTest = {};

		var supports = !!document.querySelector && !!window.addEventListener && !!window.MutationObserver;

		var settings;

		var defaults = {
			selectors: "img",
			classNamespace: "respimg-"
		};

		var forEach = function( collection, callback, scope ) {
			if ( Object.prototype.toString.call( collection ) === "[object Object]" ) {
				for ( var prop in collection ) {
					if ( Object.prototype.hasOwnProperty.call( collection, prop ) ) {
						callback.call( scope, collection[ prop ], prop, collection );
					}
				}
			} else {
				for ( var i = 0, len = collection.length; i < len; i++ ) {
					callback.call( scope, collection[ i ], i, collection );
				}
			}
		};

		var extend = function( target, source ) {
			target = JSON.parse( JSON.stringify( target ) );
			Object.keys( source ).map( function( prop ) {
				Object.prototype.hasOwnProperty.call( target, prop ) &&
					( target[ prop ] = source[ prop ] );
			} );
			return target;
		};

		var throttle = function( type, name, scope ) {
			var obj = scope || window;
			var running = false;
			var func = function() {
				if ( running ) { return; }
				running = true;
				observer.disconnect();
				requestAnimationFrame( function() {
						obj.dispatchEvent ( new CustomEvent( name ) );
						running = false;
				} );
			};
			obj.addEventListener( type, func );
		};

		var observer = new MutationObserver( function( mutations ) {
			mutations.forEach( function( mutation ) {
				console.log( "observer", mutation.type );
				update();
			} );
		} );

		var imageLoaded = function( img, callback ) {
			if ( !img.complete ) {
				img.addEventListener( "load", function() {
					callback();
				} );
			} else {
				callback();
			}
		};

		var update = function() {
			observer.disconnect();
			removeOverlays();
			var respImgElements = document.querySelectorAll( settings.selectors );
			forEach( respImgElements, function( respImgElement ) {
				var data = {};
				if ( respImgElement.tagName === "IMG" ) {
					handleImgElement( respImgElement, renderOverlay );
				} else if ( respImgElement.style.backgroundImage ) {
					handleBackgroundElement( respImgElement, renderOverlay );
				} else {
					return;
				}
				observer.observe( respImgElement, {
					attributes: true
				} );
			} );
			observer.observe( document.body, {
				childList: true
			} );
		};

		var handleImgElement = function( element, callback ) {
			console.log( "handleImgElement" );
			imageLoaded( element, function() {
				console.log( "handleImgElement", "imageLoaded" );
				var boundingClientRect = element.getBoundingClientRect();
				var data = {
					elementWidth: boundingClientRect.width,
					elementHeight: boundingClientRect.height,
					elementTop: boundingClientRect.top,
					elementBottom: boundingClientRect.bottom,
					elementLeft: boundingClientRect.left,
					elementRight: boundingClientRect.right,
					imageWidth: element.width,
					imageHeight: element.height,
					imageNaturalWidth: element.naturalWidth,
					imageNaturalHeight: element.naturalHeight,
					imageSizes: element.sizes
				};
				callback( data );
			} );
		};

		var handleBackgroundElement = function( element, callback ) {
			console.log( "handleBackgroundElement" );
			var boundingClientRect = element.getBoundingClientRect();
			var bgUrl = /^url\((['"]?)(.*)\1\)$/.exec( element.style.backgroundImage );
			var image = new Image( boundingClientRect.width, boundingClientRect.height );
			image.src = bgUrl[ 2 ];
			imageLoaded( image, function() {
				console.log( "handleBackgroundElement", "imageLoaded" );
				var data = {
					elementWidth: boundingClientRect.width,
					elementHeight: boundingClientRect.height,
					elementTop: boundingClientRect.top,
					elementBottom: boundingClientRect.bottom,
					elementLeft: boundingClientRect.left,
					elementRight: boundingClientRect.right,
					imageWidth: image.width,
					imageHeight: image.height,
					imageNaturalWidth: image.naturalWidth,
					imageNaturalHeight: image.naturalHeight,
					imageSizes: image.sizes
				};
				callback( data );
			} );
		};

		var renderOverlay = function( data ) {
			console.log( "renderOverlay" );
			var overlay = document.createElement( "div" );
			overlay.classList.add( settings.classNamespace + "overlay" );
			overlay.style.position = "absolute";
			overlay.style.zIndex = 2147483647;
			overlay.style.width = data.elementWidth + "px";
			overlay.style.height = data.elementHeight + "px";
			overlay.style.top = data.elementTop + "px";
			overlay.style.left =  data.elementLeft + "px";
			if ( data.imageWidth < data.imageNaturalWidth || data.imageHeight < data.imageNaturalHeight ) {
				overlay.classList.add( settings.classNamespace + "warning" );
			} else if ( data.imageWidth > data.imageNaturalWidth || data.imageNaturalHeight > data.imageNaturalHeight ) {
				overlay.classList.add( settings.classNamespace + "bad" );
			} else {
				overlay.classList.add( settings.classNamespace + "good" );
			}
			forEach( data, function( dataValue, dataKey ) {
				overlay.dataset[ dataKey ] = dataValue;
			} );
			document.body.appendChild( overlay );
		};

		var removeOverlays = function() {
			console.log( "removeOverlays" );
			var overlays = document.querySelectorAll( "." + settings.classNamespace + "overlay" );
			forEach( overlays, function( overlay ) {
				overlay.remove();
			} );
		};

		respImgTest.init = function( options ) {
			console.log( "init" );
			if ( !supports ) { return; }
			settings = extend( defaults, options || {} );
			throttle( "resize", "optimizedResize" );
			window.addEventListener( "optimizedResize", update );
			update();
		};

		if ( typeof define === "function" && define.amd ) {
			define( [], function() {
				return respImgTest;
			} );
		} else if ( typeof module !== "undefined" && module.exports ) {
			module.exports = respImgTest;
		} else {
			window.respImgTest = respImgTest;
		}

	} )( window, document );
