var link = document.createElement( "link" );
link.id = "respimage-inspector-link";
link.href = "https://cdn.rawgit.com/creative-area/respimg-inspector/@@version/dist/respimg-inspector.css";
document.head.appendChild( link );

var script = document.createElement( "script" );
script.id = "respimage-inspector-script";
script.src = "https://cdn.rawgit.com/creative-area/respimg-inspector/@@version/dist/respimg-inspector.min.js";
document.body.appendChild( script );
