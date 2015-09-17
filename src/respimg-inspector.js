;( function( window, document, undefined ) {

	"use strict";

	var respImgInspector = {};

	var supports = !!document.querySelector &&
		!!window.addEventListener &&
		!!window.MutationObserver;

	var settings, wrapper, items = [], images = [], overlays = [];

	var defaults = {
		selectors: null,
		classNamespace: "respimg-inspector-",
		wrapperId: "respimg-inspector-wrapper"
	};

	var elementsToExclude = [
		"span", "em", "strong", "i", "b", "big", "small", "tt", "abbr",
		"script", "br", "hr", "sub", "sup", "button", "input", "label",
		"select", "textarea", "samp", "var"
	];

	var docBody = document.body;

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

	var extend = function( defaults, options ) {
		var extended = {};
		var prop;
		for ( prop in defaults ) {
			if ( Object.prototype.hasOwnProperty.call( defaults, prop ) ) {
				extended[ prop ] = defaults[ prop ];
			}
		}
		for ( prop in options ) {
			if ( Object.prototype.hasOwnProperty.call( options, prop ) ) {
				extended[ prop ] = options[ prop ];
			}
		}
		return extended;
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

	var getCss = function( element, property ) {
		return window.getComputedStyle( element, null ).getPropertyValue( property );
	};

	var observer = new MutationObserver( function( mutations ) {
		mutations.forEach( function() {
			update();
		} );
	} );

	var update = function() {
		cleanUp();
		var selectors = getSelectors();
		var respImgElements = document.querySelectorAll( selectors );
		forEach( respImgElements, function( respImgElement ) {
			var image = getImage( respImgElement );
			var item = {
				el: respImgElement,
				img: image
			};

			// TODO: Handle more background image usages.
			// Only handle IMG tag and background "cover" for now.
			if ( item.el.nodeName === "IMG" ||
				getCss( item.el, "background-size" ) === "cover"
			) {
				items.push( item );
				images.push( image );
			}
		} );
		window.imagesLoaded( images, function() {
			forEach( items, function( item ) {
				var data = extend( getElementData( item.el ), getImageData( item.img ) );
				overlays.push( getOverlay( data ) );
				observer.observe( item.el, {
					attributes: true
				} );
			} );
			renderWrapper();
			renderOverlays();
			observer.observe( docBody, {
				childList: true
			} );
		} );
	};

	var getSelectors = function() {
		if ( settings.selectors ) {
			return settings.selectors;
		} else {
			var array = elementsToExclude.map( function( element ) {
				return "*:not(" + element + ")";
			} );
			return array.join();
		}
	};

	var getElementData = function( element ) {
		var elRect = element.getBoundingClientRect();
		return {
			elTag: element.nodeName.toLowerCase(),
			elWidth: elRect.width,
			elHeight: elRect.height,
			elTop: elRect.top,
			elBottom: elRect.bottom,
			elLeft: elRect.left,
			elRight: elRect.right
		};
	};

	var getImageData = function( img ) {
		return {
			imgWidth: img.width,
			imgHeight: img.height,
			imgNaturalWidth: img.naturalWidth,
			imgNaturalHeight: img.naturalHeight,
			imgSizes: img.sizes
		};
	};

	var getImage = function( element ) {
		var image;
		if ( element.nodeName === "IMG" ) {
			image = element;
		} else if ( getCss( element, "background-image" ) !== "none" ) {
			var bgUrl = /^url\((['"]?)(.*)\1\)$/.exec( getCss( element, "background-image" ) );
			image = new Image();
			image.src = bgUrl[ 2 ];
		}
		return image;
	};

	var getOverlayClassName = function( data ) {
		var overlayClassName;
		var pixelRatio = window.devicePixelRatio;
		if ( data.elWidth * pixelRatio < data.imgNaturalWidth ||
			data.elHeight * pixelRatio < data.imgNaturalHeight
		) {
			overlayClassName = "warning";
		} else if ( data.elWidth * pixelRatio > data.imgNaturalWidth ||
			data.elHeight * pixelRatio > data.imgNaturalHeight
		) {
			overlayClassName = "bad";
		} else {
			overlayClassName = "good";
		}
		return settings.classNamespace + overlayClassName;
	};

	var getOverlay = function( data ) {
		var marginTop = getCss( docBody, "margin-top" );
		var marginLeft = getCss( docBody, "margin-left" );
		var bodyRect = docBody.getBoundingClientRect();
		var offsetTop = data.elTop - bodyRect.top;
		var offsetLeft = data.elLeft - bodyRect.left;
		var overlay = document.createElement( "div" );
		overlay.classList.add( settings.classNamespace + "overlay" );
		overlay.style.position = "absolute";
		overlay.style.width = data.elWidth + "px";
		overlay.style.height = data.elHeight + "px";
		overlay.style.top = "calc(" + offsetTop + "px + " + marginTop + ")";
		overlay.style.left =	"calc(" + offsetLeft + "px + " + marginLeft + ")";
		overlay.classList.add( getOverlayClassName( data ) );
		forEach( data, function( dataValue, dataKey ) {
			overlay.dataset[ dataKey ] = dataValue;
		} );
		return overlay;
	};

	var renderWrapper = function() {
		wrapper = document.createElement( "div" );
		wrapper.id = settings.wrapperId;
		wrapper.style.position = "absolute";
		wrapper.style.top = 0;
		wrapper.style.bottom = 0;
		wrapper.style.left = 0;
		wrapper.style.right = 0;
		wrapper.style.zIndex = 2147483647;
		docBody.appendChild( wrapper );
	};

	var renderOverlays = function() {
		forEach( overlays, function( overlay ) {
			wrapper.appendChild( overlay );
		} );
	};

	var cleanUp = function() {
		observer.disconnect();
		if ( overlays.length ) {
			forEach( overlays, function( overlay ) {
				overlay.remove();
			} );
		}
		if ( wrapper !== undefined ) {
			wrapper.remove();
		}
		items = [];
		images = [];
		overlays = [];
	};

	respImgInspector.init = function( options ) {
		if ( !supports ) { return; }
		settings = extend( defaults, options || {} );
		throttle( "resize", "optimizedResize" );
		window.addEventListener( "optimizedResize", update );
		window.addEventListener( "load", update );
	};

	if ( typeof define === "function" && define.amd ) {
		define( [], function() {
			return respImgInspector;
		} );
	} else if ( typeof module !== "undefined" && module.exports ) {
		module.exports = respImgInspector;
	} else {
		window.respImgInspector = respImgInspector;
	}

} )( window, document );
