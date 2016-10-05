Module['saveState'] = function(onSaved, onError) {
    try {
    gamecip_freeze();
    if(onSaved) {
        onSaved(FS.readFile("/state.frz", {encoding:'binary'}));
    }
    } catch(e) {
        if(onError) { onError(e); }
    }
}

Module['saveExtraFiles'] = function(files, onSaved, onError) {
    try {
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
    } catch(e) {
        if(onError) { onError(files, e); }
    }
}

Module['loadState'] = function(s, onLoaded, onError) {
    try {
    //load s in place of "state.frz"
    FS.writeFile("/state.frz", s, {encoding:'binary'});
    gamecip_unfreeze();
    if(onLoaded) {
        onLoaded(s);
    }
    } catch(e) {
        if(onError) { onError(s,e); }
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

Module['quit'] = function() {
    Module.noExitRuntime = false;
    try { Module.exit(0,false); }
    catch(e) { }
    Module.canvas.remove();
}

Module.preRun.push(function() {
    SDL.openAudioContext();
    SDL.realAudioContext = SDL.audioContext;
    var bufferSize = 16384;
    var captureNode = SDL.realAudioContext.createGain();
    SDL.audioContext = {
        createBufferSource:function() { return SDL.realAudioContext.createBufferSource(); },
        createBuffer:function(chans,sizePerChan,freq) {
            return SDL.realAudioContext.createBuffer(chans,sizePerChan,freq);
        },
        decodeAudioData:function(buf,onDone) {
            return SDL.realAudioContext.decodeAudioData(buf,onDone);
        },
        createPanner:function() { return SDL.realAudioContext.createPanner(); },
        createGain:function() { return SDL.realAudioContext.createGain(); },
        destination:captureNode,
        get currentTime() { return SDL.realAudioContext.currentTime; }
    };
    SDL.audioContext.destination.connect(SDL.realAudioContext.destination);
    Module["getAudioCaptureInfo"] = function() {
        return {
            context:SDL.realAudioContext,
            capturedNode:SDL.audioContext.destination
        };
    }
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

Module["getMemoryRegions"] = function() {
    return {
        RAM:{size:0x20000, idx:0},
        SRAM:{size:0x20000, idx:1},
        VRAM:{size:0x10000, idx:2},
        FillRAM:{size:0x8000, idx:3},
        ROM:{size:0x800000+0x200, idx:4}
    };
}

Module["getBytes"] = function(regionPath, offset, count) {
    if(typeof regionPath != "string") {
        if(regionPath.length != 1) {
            return null;
        }
        regionPath = regionPath[0];
    }
    var region = Module["getMemoryRegions"](regionPath);
    return new Uint8Array(Module.HEAPU8.buffer, gamecip_getPTR(region.idx)+offset, count);
}

Module.postRun.push(function() {
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
