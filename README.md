# RespImg Inspector

**RespImg Inspector** is a javascript plugin to check responsive images in the browser. This plugin intends to help you implement responsive images' best practices.

[![Build Status](https://travis-ci.org/creative-area/respimg-inspector.svg?branch=master)](https://travis-ci.org/creative-area/respimg-inspector)
[![GitHub version](https://badge.fury.io/gh/creative-area%2Frespimg-inspector.svg)](http://badge.fury.io/gh/creative-area%2Frespimg-inspector)
[![npm version](https://badge.fury.io/js/respimg-inspector.svg)](http://badge.fury.io/js/respimg-inspector)
[![Bower version](https://badge.fury.io/bo/respimg-inspector.svg)](http://badge.fury.io/bo/respimg-inspector)

By adding this script to a page, it will add layers over images and check their *responsiveness* status. Those status can be `good`, `warning` or `bad`:

- Status is `good` when image is perfectly sized at the correct DPI.
- Status is `warning` when the delivered image is larger than it should be.
- Status is `bad` when the delivered image is smaller than it should be.

## Why does it matter ?

By delivering too large images (the `warning` case), providers and clients consume more network bandwidth than they should and slow-down page load time. Furthermore, by using a [fluid images approach](http://alistapart.com/article/fluid-images) (ie. `max-width: 100%`), you delegate the downscaling task to the browser which [means more CPU, more memory](http://timkadlec.com/2013/11/why-we-need-responsive-images-part-deux/). This can have an impact the user experience and the situation is of course even worse on mobiles where it often means janks, crashes and less battery life.

By delivering too small images (the `bad` case), you get some of the drawbacks above plus an ugly user experience because of the upscale.

## Features

- Handle `img` and elements with background images (only elements with a `background-size` set to `cover` for now)
- Live react to changes in the DOM (window resize, added/updated elements)
- Handle device pixel ratio

## Install

From source file:
- `dist/respimg-inspector.js`
- `dist/respimg-inspector.min.js`

Or install via Bower: `bower install respimg-inspector`

Or install via npm: `npm install respimg-inspector`

## Usage

```html
<script src="respimg-inspector.min.js"></script>
```

By default, all document's nodes are processed except those:

`span`, `em`, `strong`, `i`, `b`, `big`, `small`, `tt`, `abbr`,
`script`, `br`, `hr`, `sub`, `sup`, `button`, `input`, `label`,
`select`, `textarea`, `samp`, `var`, `iframe`, `script`, `video`,
`object`, `canvas`, `center`, `font`, `frame`, `frameset`, `noframe`,
`noscript`, `option`, `strike`, `s`, `wbr`, `bdi`, `kbd`, `audio`,
`map`, `area`, `track`, `embed`, `param`, `source`, `del`, `ins`,
`acronym`, `applet`, `blink`, `dir`, `spacer`, `isindex`, `content`,
`element`, `shadow`, `template`, `noembed`, `head`, `meta`, `link`,
`title`, `style`, `html`

To restrict the scope, you can filter with custom selectors:

```html
<script>
var respImgInspectorSelectors = "img";
</script>
```

Or

```html
<script>
var respImgInspectorSelectors = ".myclass, img";
</script>
```

You can customize how **RespImg Inspector**'s overlays look by adding your own stylesheet. Here are the css of the demo.

```css
.respimg-inspector-overlay::before {
  display: block;
  padding: 20px;
  font-family: monospace;
  font-size: 9px;
  color: #fff;
  content: "tag: " attr(data-el-tag) " - width: " attr(data-img-width) "px - height: " attr(data-img-height) "px - natural width: " attr(data-img-natural-width) "px - natural height: " attr(data-img-natural-height) "px";
}

.respimg-inspector-warning {
  background-color: rgba(252, 176, 49, .7);
}

.respimg-inspector-bad {
  background-color: rgba(252, 86, 61, .7);
}

.respimg-inspector-good {
  background-color: rgba(185, 237, 67, .7);
}
```
