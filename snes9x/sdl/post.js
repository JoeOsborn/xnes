// (function() {
//     var pml = Module['preMainLoop'];
//     Module.preMainLoop = function() {
//         if(pml && !pml()) { return false; }
//         maybeSaveState();
//         maybeLoadState();
//         return true;
//     }
// })();

//cwrap freeze and unfreeze
var gamecip_freeze = Module['cwrap']("freeze", "void", []);
var gamecip_unfreeze = Module['cwrap']("unfreeze", "void", []);