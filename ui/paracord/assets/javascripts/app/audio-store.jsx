import AudioActions from 'app/audio-actions';

export default Reflux.createStore({
    listenables: [
        AudioActions
    ],
    
    init: function () {
        this.swishVolume = -30;
        this.swish = new Tone.Noise('brown').toMaster().start();
        this.swish.volume.value = this.swishVolume;

        var volume = -20,
            comp = new Tone.Compressor(volume * 0.25).toMaster();

        this.drones = [];
        this.dronesStarted = false;
        for (var i=0; i<8; ++i) {
            let osc = new Tone.OmniOscillator({
                frequency: 100,
                phase: Math.round(Math.random() * 360)
            }).connect(comp);
            osc.volume.value = volume;
            this.drones.push(osc);
        }
    },

    getInitialState: function () {
        return { };
    },

    onSwish: function () {
        this.swish.volume.setCurrentValueNow();
        this.swish.volume.linearRampToValueAtTime(-5, '+0.5');
        this.swish.volume.linearRampToValueAtTime(this.swishVolume, '+1');
    },

    droneFreq: function () {
        return 160 + Math.round(Math.random() * 80);
    },

    onDrone: function () {
        var i, rate = 2;
        if (this.dronesStarted) {
            i = Math.floor(Math.random() * this.drones.length);
            this.drones[i].frequency.setCurrentValueNow();
            this.drones[i].frequency.rampTo(this.droneFreq(), rate);
            return;
        }

        this.dronesStarted = false;
        for (i=0; i<this.drones.length; ++i) {
            this.drones[i].start();
            this.drones[i].frequency.setCurrentValueNow();
            this.drones[i].frequency.rampTo(this.droneFreq(), 0.1);
        }
    }
    
});
