window['shuffleFiles'] = function() {
    FS.writeFile("state.frz", FS.readFile("state0.frz", {encoding:'binary'}), {encoding:'binary'});
    FS.chmod("state.frz",0777);
}

window['saveState'] = function(onSaved) {
    gamecip_freeze();
    onSaved(FS.readFile("state.frz", {encoding:'binary'}));
}

window['loadState'] = function(s, onLoaded) {
    //load s in place of "state.frz"
    FS.writeFile("state.frz", s, {encoding:'binary'});
    gamecip_unfreeze();
    onLoaded(s);
}

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