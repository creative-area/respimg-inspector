/*globals chrome */

var currentTabId;

function toggle( tab ) {
	if ( currentTabId === tab.id ) {
		removeTab( currentTabId );
	} else {
		addTab( tab );
	}
}

function addTab( tab ) {
	currentTabId = tab.id;
	chrome.tabs.insertCSS( currentTabId, {
		file: "respimg-inspector.css"
	} );
	chrome.tabs.executeScript( currentTabId, {
		file: "imagesloaded.pkgd.js"
	} );
	chrome.tabs.executeScript( currentTabId, {
		file: "respimg-inspector.js"
	}, function() {
		chrome.tabs.executeScript( currentTabId, {
			code: "respImgInspector.init();"
		} );
	} );
	chrome.browserAction.setIcon( {
		tabId: currentTabId,
		path: "icon_active32.png"
	} );
}

function removeTab( id ) {
	chrome.browserAction.setIcon( {
		tabId: id,
		path: "icon32.png"
	} );
	chrome.tabs.reload( id );
	currentTabId = null;
}

chrome.browserAction.onClicked.addListener( toggle );
