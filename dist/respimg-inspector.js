/*
 *	respimg-inspector - v0.2.5
 *	A javascript plugin to check responsive images in the browser.
 *	https://www.npmjs.com/package/respimg-inspector
 *
 *	Made by Florent Bourgeois
 *	Under MIT License
 */
(function(window, document, undefined) {

  "use strict";

  var respImgInspector = {};

  var supports = !!document.querySelector &&
    !!window.addEventListener &&
    !!window.MutationObserver &&
    !!window.Promise;

  var settings,
    throttling = false,
    items = [],
    images = [],
    overlays = [];

  var defaults = {
    selectors: null,
    classNamespace: "respimg-inspector-"
  };

  var elementsToExclude = [
    "span", "em", "strong", "i", "b", "big", "small", "tt", "abbr",
    "script", "br", "hr", "sub", "sup", "button", "input", "label",
    "select", "textarea", "samp", "var", "iframe", "script", "video",
    "object", "canvas", "center", "font", "frame", "frameset", "noframe",
    "noscript", "option", "strike", "s", "wbr", "bdi", "kbd", "audio",
    "map", "area", "track", "embed", "param", "source", "del", "ins",
    "acronym", "applet", "blink", "dir", "spacer", "isindex", "content",
    "element", "shadow", "template", "noembed", "head", "meta", "link",
    "title", "style", "html"
  ];

  var docBody = document.body;
  var docElem = document.documentElement;

  var forEach = function(collection, callback, scope) {
    if (Object.prototype.toString.call(collection) === "[object Object]") {
      for (var prop in collection) {
        if (Object.prototype.hasOwnProperty.call(collection, prop)) {
          callback.call(scope, collection[prop], prop, collection);
        }
      }
    } else {
      for (var i = 0, len = collection.length; i < len; i++) {
        callback.call(scope, collection[i], i, collection);
      }
    }
  };

  var extend = function(defaults, options) {
    var extended = {};
    var prop;
    for (prop in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
        extended[prop] = defaults[prop];
      }
    }
    for (prop in options) {
      if (Object.prototype.hasOwnProperty.call(options, prop)) {
        extended[prop] = options[prop];
      }
    }
    return extended;
  };

  var throttle = function(type, name, scope) {
    console.log("respImgInspector: Throttle");
    var obj = scope || window;
    var func = function() {
      if (throttling) {
        return;
      }
      throttling = true;
      requestAnimationFrame(function() {
        obj.dispatchEvent(new CustomEvent(name));
        throttling = false;
      });
    };
    obj.addEventListener(type, func);
  };

  var getCss = function(element, property) {
    return window.getComputedStyle(element, null).getPropertyValue(property);
  };

  var imageLoaded = function(image) {
    return new Promise(function(resolve, reject) {
      if (image.complete) {
        resolve(image);
      } else {
        image.onload = function() {
          resolve(image);
        };
        image.onerror = function() {
          reject();
        };
      }
    });
  };

  var update = function() {
    console.log("respImgInspector: Update");
    throttling = true;
    cleanUp();
    var selectors = getSelectors();
    var respImgElements = document.querySelectorAll(selectors);
    forEach(respImgElements, function(respImgElement) {
      var image = getImage(respImgElement);
      if (image) {
        var item = {
          el: respImgElement,
          img: image
        };

        // TODO: Handle more background image usages.
        // Only handle IMG tag and background "cover" for now.
        if (item.el.nodeName === "IMG" || getCss(item.el, "background-size") === "cover") {
          items.push(item);
          images.push(image);
        }
      }
    });

    var promises = images.map(imageLoaded);
    Promise.all(promises).then(function() {
      forEach(items, function(item) {
        var data = extend(getElementData(item.el), getImageData(item.img));
        overlays.push(getOverlay(data));
      });
      renderOverlays();
      throttling = false;
    });
  };

  var getSelectors = function() {
    console.log("respImgInspector: Get Selectors");
    if (settings.selectors) {
      return settings.selectors;
    } else {
      var array = elementsToExclude.map(function(element) {
        return "not(" + element + ")";
      });
      return "*:" + array.join(":");
    }
  };

  var getElementData = function(element) {
    var elRect = element.getBoundingClientRect();
    var scrollTop = window.pageYOffset || docElem.scrollTop || docBody.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || docBody.scrollLeft;
    var clientTop = docElem.clientTop || docBody.clientTop || 0;
    var clientLeft = docElem.clientLeft || docBody.clientLeft || 0;
    return {
      elTag: element.nodeName.toLowerCase(),
      elWidth: elRect.width,
      elHeight: elRect.height,
      elTop: Math.round(elRect.top + scrollTop - clientTop),
      elBottom: Math.round(elRect.bottom + scrollTop - clientTop),
      elLeft: Math.round(elRect.left + scrollLeft - clientLeft),
      elRight: Math.round(elRect.right + scrollLeft - clientLeft)
    };
  };

  var getImageData = function(img) {
    return {
      imgWidth: img.width,
      imgHeight: img.height,
      imgNaturalWidth: img.naturalWidth,
      imgNaturalHeight: img.naturalHeight,
      imgSizes: img.sizes
    };
  };

  var getImage = function(element) {
    var image;
    if (element.nodeName === "IMG") {
      image = element;
    } else if (getCss(element, "background-image") !== "none") {
      var bgUrl = /^url\((['"]?)(.*)\1\)$/.exec(getCss(element, "background-image"));
      if (bgUrl) {
        image = new Image();
        image.src = bgUrl[2];
      }
    }
    return image;
  };

  var getOverlayClassName = function(data) {
    var overlayClassName;
    var pixelRatio = window.devicePixelRatio;
    if (data.elWidth * pixelRatio < data.imgNaturalWidth ||
      data.elHeight * pixelRatio < data.imgNaturalHeight
    ) {
      overlayClassName = "warning";
    } else if (data.elWidth * pixelRatio > data.imgNaturalWidth ||
      data.elHeight * pixelRatio > data.imgNaturalHeight
    ) {
      overlayClassName = "bad";
    } else {
      overlayClassName = "good";
    }
    return settings.classNamespace + overlayClassName;
  };

  var getOverlay = function(data) {
    var overlay = document.createElement("div");
    overlay.classList.add(settings.classNamespace + "overlay");
    overlay.style.position = "absolute";
    overlay.style.width = data.elWidth + "px";
    overlay.style.height = data.elHeight + "px";
    overlay.style.top = data.elTop + "px";
    overlay.style.left = data.elLeft + "px";
    overlay.style.zIndex = 2147483647;
    overlay.classList.add(getOverlayClassName(data));
    forEach(data, function(dataValue, dataKey) {
      overlay.dataset[dataKey] = dataValue;
    });
    return overlay;
  };

  var renderOverlays = function() {
    forEach(overlays, function(overlay) {
      docBody.appendChild(overlay);
    });
  };

  var cleanUp = function() {
    if (overlays.length) {
      forEach(overlays, function(overlay) {
        overlay.remove();
      });
    }
    items = [];
    images = [];
    overlays = [];
  };

  respImgInspector.init = function() {
    console.log("respImgInspector: Initialization");
    var options = {};
    if (!supports) {
      console.log("respImgInspector: Unsupported browser... Sorry.");
      return;
    }
    if (window.respImgInspectorSelectors) {
      options.selectors = window.respImgInspectorSelectors;
    }
    settings = extend(defaults, options || {});
    throttle("resize", "optimizedResize");
    window.addEventListener("optimizedResize", update, false);
    update();
  };

  respImgInspector.destroy = function() {
    if (!settings) {
      return;
    }
    cleanUp();
    window.removeEventListener("optimizedResize", update, false);
  };

  if (typeof define === "function" && define.amd) {
    define([], function() {
      return respImgInspector;
    });
  } else if (typeof module !== "undefined" && module.exports) {
    module.exports = respImgInspector;
  } else {
    window.respImgInspector = respImgInspector;
  }

  respImgInspector.init();

})(window, document);