Module['saveState'] = function(onSaved) {
    gamecip_freeze();
    if(onSaved) {
        onSaved(FS.readFile("/state.frz", {encoding:'binary'}));
    }
}

Module['saveExtraFiles'] = function(files, onSaved) {
    gamecip_saveSRAM();
    if(onSaved) {
        var r = {};
        for(var i = 0; i < files.length; i++) {
            if(files[i] == "battery") {
                r["battery"] = FS.readFile("/rom.srm", {encoding:'binary'});
            } else if(files[i] == "state") {
                r["state"] = FS.readFile("/state.frz", {encoding:'binary'});
            }
        }
        onSaved(r);
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

Module['setMuted'] = function(b) {
    gamecip_PauseAudio(b ? 1 : 0);
    Module._isMuted = b;
}

Module['isMuted'] = function() {
    return Module._isMuted;
}

Module['listExtraFiles'] = function() {
    return ["battery", "state"];
}

Module.preRun.push(function() {
    ENV.SDL_EMSCRIPTEN_KEYBOARD_ELEMENT = Module.targetID;
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

Module.postRun.push(function() {
    Module.setMuted(true);
    Module.canvas.style.setProperty( "width", "inherit", "important");
    Module.canvas.style.setProperty("height", "inherit", "important");
})

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