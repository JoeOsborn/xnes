Module['saveState'] = function(onSaved) {
    gamecip_freeze();
    if(onSaved) {
        onSaved(FS.readFile("/state.frz", {encoding:'binary'}));
    }
}

Module['saveExtraFiles'] = function(onSaved) {
    gamecip_saveSRAM();
    if(onSaved) {
        onSaved({"battery": FS.readFile("/rom.srm", {encoding:'binary'})});
    }
}

Module['loadState'] = function(s, onLoaded) {
    //load s in place of "state.frz"
    FS.writeFile("/state.frz", s, {encoding:'binary'});
    gamecip_unfreeze();
    if(onLoaded) {
        onLoaded(s);
    }
}

Module.preRun.push(function() {
    var gameFile = Module["gameFile"];
    var freezeFile = Module["freezeFile"];
    var extraFiles = Module["extraFiles"] || {};
    //todo: handle .sfc?
    FS.createPreloadedFile("/", "rom.smc", gameFile, true, true);
    if(freezeFile) {
        FS.createPreloadedFile("/", "state0.frz", freezeFile, true, true);
        FS.createPreloadedFile("/", "state.frz", freezeFile, true, true);
    }
    if("battery" in extraFiles) {
        FS.createPreloadedFile("/", "rom.srm", extraFiles["battery"], true, true);
    }
});

// The junk below is to save the emscripten heap and everything. it's not
// necessary if the emulator already has savestate support!

// function maybeSaveState() {
//     if(awaitingSaveCallback) {
//         assert(Module.buffer);
//         //store current time and heap
//         var state = {
//             time: Date.now(), // game time
//             heap: Module.buffer.slice(0),
//             stack: asm.stackSave()
//         };
//         var cb = awaitingSaveCallback;
//         awaitingSaveCallback = null;
//         cb(state);
//     }
// }
//
// var gamecip_ResetGFX = null;
//
// function maybeLoadState() {
//     if(awaitingLoadCallback) {
//         assert(awaitingLoadState);
//         loadedTime = gcip_realNow(); //wallclock time
//         savedTime = awaitingLoadState.time; //game time
//         //reset heap
//
//         var b = new Uint8Array(awaitingLoadState.heap); // awaitingLoadState.heap
//         HEAP8.set(b);
//
//         asm.stackRestore(awaitingLoadState.stack);
//
//         //call callback
//         var cb = awaitingLoadCallback;
//         awaitingLoadCallback = null;
//         var s = awaitingLoadState;
//         awaitingLoadState = null;
//         cb(s);
//         // gamecip_ResetGFX();
//         return true;
//     }
// }