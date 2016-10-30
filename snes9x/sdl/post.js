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
var gamecip_saveSRAM = Module['cwrap']("saveSRAM", "void", []);
var gamecip_PauseAudio = Module['cwrap']("pauseAudio", "void", ["number"]);
var gamecip_getPTR = Module['cwrap']("gamecip_getPTR", "number", ["number"]);
