define(function (require, exports, module) {
    'use strict';

    var midi,
        volume = -20,
        comp = new Tone.Compressor(volume * 0.25).toMaster(),
        drum = new Tone.DrumSynth().connect(comp),
        freeverb = new Tone.Freeverb().connect(comp),
        dist = new Tone.Distortion(0.8).connect(freeverb),
        phaser = new Tone.Phaser({
            Q: 10,
            frequency: 15, 
            depth: 5, 
            baseFrequency: 1000
        }).connect(dist),
        synth = new Tone.PolySynth(6, Tone.SimpleSynth, {
            oscillator: {
                type: 'pulse'
            },
            envelope: {
                attack: 0.1,
                decay: 0.1,
                sustain: 1,
                release: 0.1
            },
        }).connect(phaser);
    
    function frequencyFromNoteNumber (note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    function onMIDIMessage (message) {
        var cmd = message.data[0] >> 4,
            channel = message.data[0] & 0xf,
            // type = message.data[0] & 0xf0,
            data1 = message.data[1],
            data2 = message.data[2];
            // , 'type', type
        console.log(channel, 'cmd', cmd, data1, data2);

        switch (channel) {
            case 0:
                switch (cmd) {
                    case 9: // note-on
                        synth.triggerAttack(frequencyFromNoteNumber(data1), '8n', data2 / 127);
                        break;
                    case 8: // note-off
                        synth.triggerRelease(frequencyFromNoteNumber(data1), undefined);
                        break;                    
                }
                break;
            case 1:
                switch (cmd) {
                    case 9: // note-on
                        drum.triggerAttack(frequencyFromNoteNumber(data1), '8n', data2 / 127);
                        break;
                    case 8: // note-off
                        drum.triggerRelease(frequencyFromNoteNumber(data1), undefined);
                        break;                    
                }
                break;
        }

        switch (cmd) {
            case 11: // knob
                // width
                switch (data1) {
                    case 1:
                        synth.set({ oscillator: { width: data2 / 127 } });
                        break;

                    case 2:
                        phaser.frequency.value = (data2 / 127) * 16;
                        break;
                    case 3:
                        phaser.baseFrequency = (data2 / 127) * 1000;
                        break;

                    case 5:
                        freeverb.roomSize.value = (data2 / 127);
                        break;
                    case 6:
                        freeverb.wet.value = (data2 / 127);
                        break;

                    case 7:
                        dist.distortion = (data2 / 127);
                        break;
                    case 8:
                        dist.wet.value = (data2 / 127);
                        break;
                }
                break;
        }
    }

    navigator.requestMIDIAccess().then(access => {
        midi = access;
        var inputs = midi.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = onMIDIMessage;
        }
    });

    var Page = React.createClass({
        mixins: [
        ],

        render: function () {
            return <div></div>
        }
    });

    return Page;
});
