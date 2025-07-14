// This code is written by Bismaya Jyoti Dalei and BCassO(github.com/BCassO) and is licensed under the MIT License.
// If you use this code, please give credit to the authors. Otherwise, we'll come in your dreams and haunt you with our beatboxing skills. 
// Just kidding! Enjoy the code and have fun making music! 🎶 No need to give credit, but it would be appreciated if you do. 

let game;

class AdvancedBeatboxGame {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.visualizerBars = [];
        this.isPlaying = {};
        this.recordedLoop = [];
        this.isRecording = false;
        this.isLoopPlaying = false;
        this.loopInterval = null;
        this.masterVolume = 0.7;
        this.currentTempo = 120;

        // Audio samples
        this.audioFiles = {}; // Store loaded audio files
        this.currentAudioFile = null; // Currently playing audio file

        // Visualizer setup
        this.visualizerUpdateTimeout = null;
        this.animationFrameId = null;
        this.lastVisualizerUpdate = 0;
        this.visualizerFPS = 45; // Target FPS
        this.visualizerInterval = 1000 / this.visualizerFPS;
        this.isVisualizerActive = true;
        this.visualizerData = {
            frequencies: new Array(32).fill(0),
            waveform: new Array(128).fill(0),
            lastBeatTime: 0,
            beatDecay: 0
        };

        // Batch update system
        this.pendingUpdates = new Set();
        this.updateQueue = [];

        // Game stats
        this.stats = {
            totalBeats: 0,
            combo: 0,
            maxCombo: 0,
            score: 0,
            bpm: 0,
            lastBeatTime: 0,
            beatTimes: []
        };

        this.activeSounds = new Map();

        // Beat pad configuration
        this.beatPads = [
            // { key: 'q', name: 'KICK', description: 'Deep Bass Kick', color: '#ff0080', sound: 'kick' },
            // { key: 'w', name: 'SNARE', description: 'Crisp Snare Hit', color: '#ff8c00', sound: 'snare' },
            // { key: 'e', name: 'HI-HAT', description: 'Closed Hi-Hat', color: '#40e0d0', sound: 'hihat' },
            // { key: 'r', name: 'OPEN HAT', description: 'Open Hi-Hat', color: '#ee82ee', sound: 'openhat' },
            // // { key: 't', name: 'HARP', description: 'Celestial Harp', color: '#ffd700', sound: 'harp' },
            // { key: 't', name: '🔥 TRAP 808', description: 'Deep trap snare with layered 808 bass and vinyl texture', color: '#ffd700', sound: 'trap808' },
            // { key: 'y', name: 'FLUTE', description: 'Ethereal Flute', color: '#98fb98', sound: 'flute' },
            // { key: 'u', name: 'EMAJ', description: 'E Major Chord', color: '#ff6b35', sound: 'emajor' },
            // { key: 'i', name: 'AMIN', description: 'A Minor Chord', color: '#4ecdc4', sound: 'aminor' },
            // { key: 'a', name: 'CLAP', description: 'Hand Clap', color: '#32cd32', sound: 'clap' },
            // { key: 's', name: 'CRASH', description: 'Crash Cymbal', color: '#ffd700', sound: 'crash' },
            // { key: 'd', name: 'RIDE', description: 'Musical Ride', color: '#ff69b4', sound: 'ride' },
            // { key: 'f', name: 'PERC', description: 'Percussion Hit', color: '#00ffff', sound: 'perc' },
            // { key: 'g', name: 'CHOIR', description: 'Angelic Choir', color: '#e6e6fa', sound: 'choir' },
            // { key: 'h', name: 'AURORA', description: 'Aurora Pad', color: '#ff69b4', sound: 'aurora' },
            // { key: 'j', name: 'FMAJ7', description: 'F Major 7th', color: '#96ceb4', sound: 'fmaj7' },
            // { key: 'k', name: 'DMIN', description: 'D Minor Chord', color: '#feca57', sound: 'dminor' },
            // { key: 'z', name: 'BASS', description: '808 Bass Drop', color: '#ff4500', sound: 'bass' },
            // { key: 'x', name: 'PIANO', description: 'Piano Chord', color: '#9370db', sound: 'piano' },
            // { key: 'c', name: 'STRINGS', description: 'String Ensemble', color: '#20b2aa', sound: 'strings' },
            // { key: 'v', name: 'GMAJ', description: 'G Major Chord', color: '#dc143c', sound: 'gmajor' },
            // { key: 'b', name: 'BELLS', description: 'Crystal Bells', color: '#87ceeb', sound: 'bells' },
            // { key: 'n', name: 'CMAJ9', description: 'C Major 9th', color: '#ff9ff3', sound: 'cmaj9' },
            // { key: 'm', name: 'POWER', description: 'Power Chord', color: '#54a0ff', sound: 'power' }
            { key: 'l', name: 'DHOL', description: 'Traditional Sambalpuri barrel drum - deep thunder', color: '#ff6b35', sound: 'dhol' },
            { key: 'o', name: 'TABLA', description: 'Folk tabla with earthy resonance', color: '#4ecdc4', sound: 'tabla' },
            { key: 'p', name: 'NAGADA', description: 'Massive ceremonial drum - earth shaking', color: '#ffd700', sound: 'nagada' },
            { key: '1', name: 'MANJIRA', description: 'Brass cymbals with shimmer', color: '#ff9ff3', sound: 'manjira' },
            { key: '2', name: 'DHOLAK', description: 'Folk barrel drum with wood resonance', color: '#96ceb4', sound: 'dholak' },
            { key: '3', name: 'KANJIRA', description: 'Frame drum with jingles', color: '#feca57', sound: 'kanjira' },

        ];

        this.longDurationSounds = ['emajor', 'aminor', 'fmaj7', 'dminor', 'cmaj9', 'gmajor', 'choir', 'aurora', 'strings', 'bells', 'power', 'dhol', 'nagada'];




        // Pre-made sample beats
        this.sampleBeats = [
            {
                name: "Hip-Hop Classic",
                genre: "Hip-Hop",
                description: "Classic boom-bap style with heavy kick and snare",
                bpm: 90,
                pattern: [
                    { key: 'q', time: 0 },      // Kick
                    { key: 'w', time: 500 },    // Snare
                    { key: 'e', time: 250 },    // Hi-hat
                    { key: 'e', time: 750 },    // Hi-hat
                    { key: 'q', time: 1000 },   // Kick
                    { key: 'e', time: 1250 },   // Hi-hat
                    { key: 'w', time: 1500 },   // Snare
                    { key: 'e', time: 1750 }    // Hi-hat
                ]
            },
            {
                name: "🔥 Trap Fire",
                genre: "Trap/Hip-Hop",
                description: "Hard-hitting trap beat with layered 808s, crispy hi-hats, and modern bounce - pure fire! 🔥",
                bpm: 140,
                pattern: [
                    // === BAR 1: Opening Power (0-1.7s) ===
                    { key: 'q', time: 0 },       // Kick - Strong start
                    { key: 't', time: 100 },     // Trap 808 - Layer that sub bass
                    { key: 'e', time: 200 },     // Hi-hat
                    { key: 'e', time: 350 },     // Hi-hat
                    { key: 'w', time: 428 },     // Snare - Off-beat snap
                    { key: 'e', time: 500 },     // Hi-hat
                    { key: 'q', time: 642 },     // Kick - Syncopated
                    { key: 'e', time: 700 },     // Hi-hat
                    { key: 't', time: 800 },     // Trap 808 - Bass layer
                    { key: 'e', time: 850 },     // Hi-hat
                    { key: 'w', time: 857 },     // Snare - Main backbeat
                    { key: 'r', time: 950 },     // Open hat - Accent
                    { key: 'e', time: 1000 },    // Hi-hat
                    { key: 'e', time: 1150 },    // Hi-hat
                    { key: 'q', time: 1285 },    // Kick - Driving force
                    { key: 'e', time: 1350 },    // Hi-hat
                    { key: 'e', time: 1500 },    // Hi-hat
                    { key: 't', time: 1600 },    // Trap 808 - Sub power

                    // === BAR 2: Build Energy (1.7-3.4s) ===
                    { key: 'q', time: 1714 },    // Kick - Bar 2 start
                    { key: 'e', time: 1800 },    // Hi-hat
                    { key: 'e', time: 1950 },    // Hi-hat
                    { key: 'a', time: 2000 },    // Clap - Add texture
                    { key: 'w', time: 2142 },    // Snare - Backbeat
                    { key: 'e', time: 2200 },    // Hi-hat
                    { key: 'q', time: 2357 },    // Kick - Syncopated
                    { key: 't', time: 2400 },    // Trap 808 - Heavy bass
                    { key: 'e', time: 2500 },    // Hi-hat
                    { key: 'e', time: 2650 },    // Hi-hat
                    { key: 'w', time: 2571 },    // Snare - Main snap
                    { key: 'f', time: 2700 },    // Perc - Add flavor
                    { key: 'e', time: 2800 },    // Hi-hat
                    { key: 'r', time: 2950 },    // Open hat - Wash
                    { key: 'q', time: 3000 },    // Kick - Power
                    { key: 'e', time: 3100 },    // Hi-hat
                    { key: 't', time: 3200 },    // Trap 808 - Sub hit
                    { key: 'e', time: 3350 },    // Hi-hat

                    // === BAR 3: Peak Section (3.4-5.1s) ===
                    { key: 'q', time: 3428 },    // Kick - Bar 3 power
                    { key: 'e', time: 3500 },    // Hi-hat
                    { key: 'e', time: 3650 },    // Hi-hat
                    { key: 'w', time: 3785 },    // Snare - Crisp
                    { key: 't', time: 3800 },    // Trap 808 - Layer bass
                    { key: 'e', time: 3900 },    // Hi-hat
                    { key: 'a', time: 4000 },    // Clap - Texture
                    { key: 'q', time: 4071 },    // Kick - Driving
                    { key: 'e', time: 4150 },    // Hi-hat
                    { key: 'e', time: 4300 },    // Hi-hat
                    { key: 'w', time: 4285 },    // Snare - Backbeat power
                    { key: 'f', time: 4400 },    // Perc - Flavor
                    { key: 'e', time: 4500 },    // Hi-hat
                    { key: 't', time: 4600 },    // Trap 808 - Sub boom
                    { key: 'e', time: 4650 },    // Hi-hat
                    { key: 'r', time: 4750 },    // Open hat - Release
                    { key: 'q', time: 4785 },    // Kick - Power
                    { key: 'e', time: 4900 },    // Hi-hat
                    { key: 'e', time: 5000 },    // Hi-hat

                    // === BAR 4: Breakdown/Bridge (5.1-6.8s) ===
                    { key: 't', time: 5142 },    // Trap 808 - Solo bass moment
                    { key: 'e', time: 5300 },    // Hi-hat - Sparse
                    { key: 'w', time: 5500 },    // Snare - Isolated
                    { key: 'e', time: 5600 },    // Hi-hat
                    { key: 'q', time: 5785 },    // Kick - Return
                    { key: 't', time: 5800 },    // Trap 808 - Layer
                    { key: 'e', time: 5900 },    // Hi-hat
                    { key: 'a', time: 6000 },    // Clap - Build back
                    { key: 'e', time: 6100 },    // Hi-hat
                    { key: 'w', time: 6214 },    // Snare - Building
                    { key: 'e', time: 6300 },    // Hi-hat
                    { key: 'q', time: 6428 },    // Kick - Almost back
                    { key: 'e', time: 6500 },    // Hi-hat
                    { key: 't', time: 6600 },    // Trap 808 - Ready for drop
                    { key: 'r', time: 6700 },    // Open hat - Build tension

                    // === BAR 5: The Drop (6.8-8.5s) ===
                    { key: 'q', time: 6857 },    // Kick - THE DROP!
                    { key: 't', time: 6857 },    // Trap 808 - MASSIVE BASS
                    { key: 'w', time: 6857 },    // Snare - Triple impact
                    { key: 'e', time: 7000 },    // Hi-hat
                    { key: 'e', time: 7150 },    // Hi-hat
                    { key: 'a', time: 7200 },    // Clap - Texture
                    { key: 'w', time: 7285 },    // Snare - Power
                    { key: 'e', time: 7350 },    // Hi-hat
                    { key: 'q', time: 7500 },    // Kick - Driving
                    { key: 't', time: 7550 },    // Trap 808 - Sub power
                    { key: 'e', time: 7600 },    // Hi-hat
                    { key: 'f', time: 7700 },    // Perc - Flavor
                    { key: 'e', time: 7750 },    // Hi-hat
                    { key: 'e', time: 7900 },    // Hi-hat
                    { key: 'q', time: 8000 },    // Kick - Power
                    { key: 'r', time: 8100 },    // Open hat - Wash
                    { key: 't', time: 8200 },    // Trap 808 - Bass boom
                    { key: 'e', time: 8300 },    // Hi-hat
                    { key: 'e', time: 8450 },    // Hi-hat

                    // === BAR 6: Outro Power (8.5-10.2s) ===
                    { key: 'q', time: 8571 },    // Kick - Final section
                    { key: 'e', time: 8650 },    // Hi-hat
                    { key: 'w', time: 8785 },    // Snare - Strong
                    { key: 't', time: 8800 },    // Trap 808 - Heavy
                    { key: 'e', time: 8900 },    // Hi-hat
                    { key: 'a', time: 9000 },    // Clap - Texture
                    { key: 'e', time: 9100 },    // Hi-hat
                    { key: 'q', time: 9214 },    // Kick - Driving
                    { key: 'e', time: 9300 },    // Hi-hat
                    { key: 'w', time: 9428 },    // Snare - Backbeat
                    { key: 'f', time: 9500 },    // Perc - Flavor
                    { key: 'e', time: 9600 },    // Hi-hat
                    { key: 't', time: 9700 },    // Trap 808 - Sub hit
                    { key: 'r', time: 9800 },    // Open hat - Build to end
                    { key: 'q', time: 9857 },    // Kick - Final power
                    { key: 't', time: 9857 },    // Trap 808 - Double impact
                    { key: 'w', time: 10000 },   // Snare - Big finish
                    { key: 's', time: 10100 }    // Crash - Epic ending!
                ]
            },
            {
                name: "Acoustic Garden",
                genre: "Acoustic Guitar",
                description: "Beautiful guitar chord progression - pure acoustic bliss with perfect harmony",
                bpm: 72,
                pattern: [
                    // Verse 1: Overlapping chords for smooth flow (0-16s)
                    { key: 'n', time: 0 },      // Cmaj9 - Rich opening
                    { key: 'i', time: 3500 },   // Am - Start before C ends
                    { key: 'j', time: 7000 },   // Fmaj7 - Overlap with Am
                    { key: 'v', time: 10500 },  // Gmaj - Overlap with F

                    // Verse 2: Tighter overlaps for flowing progression (14-28s)
                    { key: 'n', time: 14000 },  // Cmaj9 - Start before G ends
                    { key: 'i', time: 16500 },  // Am - Quick transition
                    { key: 'j', time: 19000 },  // Fmaj7 - Smooth flow
                    { key: 'v', time: 21500 },  // Gmaj - Continuous
                    { key: 'i', time: 24000 },  // Am - Extended minor feel
                    { key: 'j', time: 25500 },  // Fmaj7 - Quick change
                    { key: 'v', time: 27000 },  // Gmaj - Prepare for return
                    { key: 'n', time: 28500 },  // Cmaj9 - Home resolution

                    // Bridge: Dense harmonic progression (30-42s)
                    { key: 'i', time: 30000 },  // Am - Emotional start
                    { key: 'k', time: 31500 },  // Dm - Deep sadness (overlap)
                    { key: 'j', time: 33000 },  // Fmaj7 - Lift (overlap)
                    { key: 'v', time: 34500 },  // Gmaj - Hope (overlap)
                    { key: 'u', time: 36000 },  // Emaj - Brightness (overlap)
                    { key: 'i', time: 37500 },  // Am - Return (overlap)
                    { key: 'j', time: 39000 },  // Fmaj7 - Prepare (overlap)
                    { key: 'v', time: 40500 },  // Gmaj - Build tension

                    // Final Chorus: Rich layering (42-56s)
                    { key: 'n', time: 42000 },  // Cmaj9 - Grand return
                    { key: 'u', time: 44000 },  // Emaj - Layer on top
                    { key: 'i', time: 45500 },  // Am - Add emotion
                    { key: 'j', time: 47000 },  // Fmaj7 - Sophistication
                    { key: 'v', time: 48500 },  // Gmaj - Power
                    { key: 'n', time: 50000 },  // Cmaj9 - Resolution
                    { key: 'j', time: 51500 },  // Fmaj7 - Final color
                    { key: 'v', time: 53000 },  // Gmaj - Build to end
                    { key: 'm', time: 54500 },  // Power - Climax
                    { key: 'n', time: 56000 }   // Cmaj9 - Perfect ending
                ]
            },
            {
                name: "🏺 Singha Baja",
                genre: "Indian Folk",
                description: "Authentic Odisha Singha Baja rhythms",
                bpm: 115,
                pattern: [
                    // === Ceremonial Opening (0-3s) ===
                    { key: 'p', time: 0 },       // Nagada - Deep ceremonial thunder
                    { key: 'l', time: 400 },     // Dhol - Main folk rhythm
                    { key: 'o', time: 700 },     // Tabla - Earthy response
                    { key: '1', time: 900 },     // Manjira - Folk shimmer
                    { key: 'l', time: 1200 },    // Dhol - Power beat
                    { key: 'l', time: 1400 },    // Dhol - Double hit (classic Sambalpuri)
                    { key: 'o', time: 1600 },    // Tabla - Quick folk accent
                    { key: '2', time: 1800 },    // Dholak - Wood texture
                    { key: 'p', time: 2000 },    // Nagada - Thunder return
                    { key: 'l', time: 2200 },    // Dhol - Driving
                    { key: '3', time: 2400 },    // Kanjira - Jingle texture
                    { key: 'o', time: 2600 },    // Tabla - Folk response
                    { key: '1', time: 2800 },    // Manjira - Bright accent

                    // === Main Singha Baja Groove (3-6s) ===
                    { key: 'l', time: 3000 },    // Dhol - Strong folk beat
                    { key: 'l', time: 3150 },    // Dhol - Quick double (signature)
                    { key: 'o', time: 3300 },    // Tabla - Earthy na
                    { key: '2', time: 3450 },    // Dholak - Folk layer
                    { key: 'l', time: 3600 },    // Dhol - Power stroke
                    { key: 'o', time: 3750 },    // Tabla - Quick accent
                    { key: '3', time: 3900 },    // Kanjira - Frame texture
                    { key: '1', time: 4050 },    // Manjira - Shimmer
                    { key: 'l', time: 4200 },    // Dhol - Continuous power
                    { key: 'o', time: 4350 },    // Tabla - Folk pattern
                    { key: 'p', time: 4500 },    // Nagada - Deep boom
                    { key: 'l', time: 4650 },    // Dhol - Response
                    { key: '2', time: 4800 },    // Dholak - Wood resonance
                    { key: 'o', time: 4950 },    // Tabla - Quick fill
                    { key: '1', time: 5100 },    // Manjira - Bright
                    { key: 'l', time: 5250 },    // Dhol - Building
                    { key: '3', time: 5400 },    // Kanjira - Texture
                    { key: 'o', time: 5550 },    // Tabla - Folk accent
                    { key: 'l', time: 5700 },    // Dhol - Power
                    { key: '2', time: 5850 },    // Dholak - Folk drive

                    // === Dance Section (6-9s) ===
                    { key: 'l', time: 6000 },    // Dhol - Dance rhythm
                    { key: 'o', time: 6120 },    // Tabla - Quick folk
                    { key: 'l', time: 6240 },    // Dhol - Dance power
                    { key: 'o', time: 6360 },    // Tabla - Response
                    { key: '1', time: 6480 },    // Manjira - Dance shimmer
                    { key: 'l', time: 6600 },    // Dhol - Driving beat
                    { key: '3', time: 6720 },    // Kanjira - Jingle cascade
                    { key: 'o', time: 6840 },    // Tabla - Folk rhythm
                    { key: '2', time: 6960 },    // Dholak - Wood accent
                    { key: 'l', time: 7080 },    // Dhol - Power stroke
                    { key: 'o', time: 7200 },    // Tabla - Quick
                    { key: '1', time: 7320 },    // Manjira - Bright
                    { key: 'l', time: 7440 },    // Dhol - Folk beat
                    { key: '3', time: 7560 },    // Kanjira - Texture
                    { key: 'o', time: 7680 },    // Tabla - Accent
                    { key: 'p', time: 7800 },    // Nagada - Build power
                    { key: 'l', time: 7920 },    // Dhol - Response
                    { key: '2', time: 8040 },    // Dholak - Folk layer
                    { key: 'o', time: 8160 },    // Tabla - Quick fill
                    { key: '1', time: 8280 },    // Manjira - Shimmer
                    { key: 'l', time: 8400 },    // Dhol - Building
                    { key: '3', time: 8520 },    // Kanjira - Cascade
                    { key: 'o', time: 8640 },    // Tabla - Folk
                    { key: 'l', time: 8760 },    // Dhol - Power
                    { key: '2', time: 8880 },    // Dholak - Wood

                    // === Grand Festival Finale (9-12s) ===
                    { key: 'p', time: 9000 },    // Nagada - MASSIVE festival power
                    { key: 'l', time: 9000 },    // Dhol - Layer thunder
                    { key: '1', time: 9100 },    // Manjira - Cymbal wash
                    { key: 'o', time: 9200 },    // Tabla - Folk fill
                    { key: 'l', time: 9300 },    // Dhol - Driving
                    { key: '3', time: 9400 },    // Kanjira - Jingle texture
                    { key: '2', time: 9500 },    // Dholak - Folk power
                    { key: 'o', time: 9600 },    // Tabla - Quick accent
                    { key: 'p', time: 9700 },    // Nagada - Thunder boom
                    { key: 'l', time: 9700 },    // Dhol - Double impact
                    { key: '1', time: 9800 },    // Manjira - Bright finale
                    { key: 'o', time: 9900 },    // Tabla - Folk flourish
                    { key: 'l', time: 10000 },   // Dhol - Power stroke
                    { key: '3', time: 10100 },   // Kanjira - Final cascade
                    { key: 'p', time: 10200 },   // Nagada - Earth-shaking finale
                    { key: 'l', time: 10200 },   // Dhol - Perfect ending
                    { key: '1', time: 10300 },   // Manjira - Golden shimmer
                    { key: '2', time: 10400 },   // Dholak - Final wood resonance
                    { key: 'p', time: 10500 }    // Nagada - GRAND FINALE BOOM!
                ]
            }

        ];

        this.currentSample = null;
        this.sampleInterval = null;

        this.init();
    }

    async loadAudioFile(url) {
        try {
            // Ensure audio context is created
            if (!this.audioContext) {
                this.createAudioContext();
            }

            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return audioBuffer;
        } catch (error) {
            console.error('Error loading audio file:', error);
            return null;
        }
    }

    async preloadSampleAudio() {
        // You can add your M4A file path here
        const audioFilePaths = {
            'singha-baja': './assets/gen_audio_sample.m4a'
        };

        for (const [key, path] of Object.entries(audioFilePaths)) {
            try {
                this.audioFiles[key] = await this.loadAudioFile(path);
                console.log(`Loaded audio file: ${key}`);
            } catch (error) {
                console.warn(`Failed to load audio file ${key}:`, error);
            }
        }
    }



    async init() {
        this.setupAudio();
        this.createAudioContext(); // Create audio context early
        this.setupUI();
        this.setupVisualizer();
        this.setupEventListeners();
        this.generateAdvancedSounds();
        this.startBPMCalculation();
        this.startPeriodicCleanup();
        await this.preloadSampleAudio();
    }

    setupAudio() {
        const resumeAudioContext = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('Audio context resumed');
                });
            }
            // Remove the event listener after first interaction
            document.removeEventListener('click', resumeAudioContext);
            document.removeEventListener('keydown', resumeAudioContext);
        };

        // Add listeners for user interaction
        document.addEventListener('click', resumeAudioContext);
        document.addEventListener('keydown', resumeAudioContext);
    }

    createAudioContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

                // Handle suspended state (Chrome requirement)
                if (this.audioContext.state === 'suspended') {
                    // Audio context will be resumed on first user interaction
                    console.log('Audio context created but suspended. Will resume on user interaction.');
                }
            } catch (error) {
                console.error('Failed to create audio context:', error);
            }
        }
    }

    setupUI() {
        const beatGrid = document.getElementById('beatGrid');
        const keyBindings = document.getElementById('keyBindings');
        const samplesGrid = document.getElementById('samplesGrid');

        this.beatPads.forEach(pad => {
            const padElement = document.createElement('div');
            padElement.className = 'beat-pad';
            padElement.dataset.key = pad.key;
            padElement.dataset.sound = pad.sound;
            padElement.style.borderColor = pad.color;

            padElement.innerHTML = `
                        <div class="key-display">${pad.key.toUpperCase()}</div>
                        <div class="beat-name">${pad.name}</div>
                        <div class="sound-description">${pad.description}</div>
                    `;

            beatGrid.appendChild(padElement);

            const bindingElement = document.createElement('div');
            bindingElement.className = 'key-binding';
            bindingElement.innerHTML = `<strong>${pad.key.toUpperCase()}</strong>: ${pad.name} - ${pad.description}`;
            keyBindings.appendChild(bindingElement);
        });

        // Sample cards
        this.sampleBeats.forEach((sample, index) => {
            const sampleCard = document.createElement('div');
            sampleCard.className = 'sample-card';
            sampleCard.dataset.sampleId = index;

            sampleCard.innerHTML = `
            <div class="sample-title">${sample.name}</div>
            <div class="sample-genre">${sample.genre}</div>
            <div class="sample-description">${sample.description}</div>
            <div class="sample-bpm">♪ ${sample.bpm} BPM</div>
        `;

            sampleCard.addEventListener('click', () => this.playSample(index));
            samplesGrid.appendChild(sampleCard);
        });
        this.setupSliders();
    }

    setupSliders() {
        const volumeSlider = document.getElementById('volumeSlider');
        const tempoSlider = document.getElementById('tempoSlider');
        const volumeValue = document.getElementById('volumeValue');
        const tempoValue = document.getElementById('tempoValue');

        volumeSlider.addEventListener('input', (e) => {
            this.masterVolume = e.target.value / 100;
            volumeValue.textContent = e.target.value + '%';
        });

        tempoSlider.addEventListener('input', (e) => {
            this.currentTempo = parseInt(e.target.value);
            tempoValue.textContent = e.target.value + ' BPM';
        });
    }

    setupVisualizer() {
        const container = document.getElementById('frequencyVisualizer');
        if (!container) return;

        container.innerHTML = '';
        this.visualizerBars = [];
        const barCount = 48;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'freq-bar';
            const hue = (i * 7.5) % 360; // 360/48 = 7.5
            bar.style.background = `linear-gradient(to top, 
            hsl(${hue}, 90%, 50%), 
            hsl(${(hue + 60) % 360}, 80%, 60%), 
            hsl(${(hue + 120) % 360}, 85%, 65%))`;

            fragment.appendChild(bar);
            this.visualizerBars.push(bar);
        }

        container.appendChild(fragment);

        const canvas = document.getElementById('waveformCanvas');
        if (canvas) {
            this.setupCanvas(canvas);
        }

        this.visualizerData = {
            frequencies: new Array(barCount).fill(5),
            lastBeatTime: 0,
            beatDecay: 0,
            animationSpeed: 0.003
        };

        this.isVisualizerActive = true;
        this.startVisualizer();
    }


    setupCanvas(canvas) {
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            const rect = container.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';

            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            this.canvasContext = ctx;
            this.canvasWidth = rect.width;
            this.canvasHeight = rect.height;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(resizeCanvas);
            resizeObserver.observe(canvas.parentElement);
            this.resizeObserver = resizeObserver;
        }
    }

    startVisualizer() {
        if (this.visualizerRunning) return;
        this.visualizerRunning = true;
        this.updateVisualizer();
    }
    updateVisualizer() {
        if (!this.isVisualizerActive || !this.visualizerRunning) return;

        const now = performance.now();
        this.updateFrequencyBars(now);
        this.updateWaveform(now);
        requestAnimationFrame(() => this.updateVisualizer());
    }


    setVisualizerQuality(quality) {
        switch (quality) {
            case 'low':
                this.visualizerFPS = 24;
                break;
            case 'medium':
                this.visualizerFPS = 30;
                break;
            case 'high':
                this.visualizerFPS = 60;
                break;
            default:
                this.visualizerFPS = 60;
        }
        this.visualizerInterval = 1000 / this.visualizerFPS;
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (!this.isPlaying[key] && this.beatPads.find(pad => pad.key === key)) {
                this.playBeat(key);
                this.isPlaying[key] = true;
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.isPlaying[key] = false;
            this.removeActiveState(key);
        });

        // Beat pad clicks
        document.querySelectorAll('.beat-pad').forEach(pad => {
            pad.addEventListener('mousedown', (e) => {
                const key = pad.dataset.key;
                this.playBeat(key);
                e.preventDefault();
            });

            pad.addEventListener('mouseup', () => {
                const key = pad.dataset.key;
                this.removeActiveState(key);
            });

            pad.addEventListener('mouseleave', () => {
                const key = pad.dataset.key;
                this.removeActiveState(key);
            });

            pad.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent default touch behavior
                const key = pad.dataset.key;
                this.playBeat(key);
            });

            pad.addEventListener('touchend', (e) => {
                e.preventDefault();
                const key = pad.dataset.key;
                this.removeActiveState(key);
            });
        });

        // Recording controls
        document.getElementById('recordBtn').addEventListener('click', () => this.toggleRecording());
        document.getElementById('playBtn').addEventListener('click', () => this.playLoop());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopLoop());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearLoop());
        document.getElementById('panicBtn').addEventListener('click', () => this.panicStop());
    }

    generateAdvancedSounds() {
        this.sounds = {
            // kick: this.createAdvancedKick(),
            // snare: this.createAdvancedSnare(),
            // hihat: this.createAdvancedHiHat(),
            // openhat: this.createAdvancedOpenHat(),
            // flute: this.createEtherealFlute(),
            // emajor: this.createEMajorChord(),
            // aminor: this.createAMinorChord(),
            // clap: this.createAdvancedClap(),
            // crash: this.createAdvancedCrash(),
            // ride: this.createAdvancedRide(),
            // perc: this.createAdvancedPerc(),
            // choir: this.createAngelicChoir(),
            // aurora: this.createAuroraPad(),
            // fmaj7: this.createFMaj7Chord(),
            // dminor: this.createDMinorChord(),
            // bass: this.createAdvanced808(),
            // piano: this.createPianoChord(),
            // strings: this.createStringEnsemble(),
            // gmajor: this.createGMajorChord(),
            // bells: this.createCrystalBells(),
            // cmaj9: this.createCMaj9Chord(),
            // power: this.createPowerChord(),
            // trap808: this.createTrap808Snare(),
            dhol: this.createDhol(),
            tabla: this.createTabla(),
            nagada: this.createNagada(),
            manjira: this.createManjira(),
            dholak: this.createDholak(),
            kanjira: this.createKanjira(),
        };
    }

    createDhol() {
        return () => {
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;

            // Create that deep, thunderous DHOL sound like in Singha Baja

            // 1. Ultra-deep sub bass (the earth-shaking foundation)
            const subOsc = this.audioContext.createOscillator();
            const subGain = this.audioContext.createGain();
            const subFilter = this.audioContext.createBiquadFilter();

            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(28, now);  // Very deep like in the track
            subOsc.frequency.exponentialRampToValueAtTime(15, now + 0.3);

            subFilter.type = 'lowpass';
            subFilter.frequency.setValueAtTime(60, now);
            subFilter.Q.setValueAtTime(8, now);

            subGain.gain.setValueAtTime(this.masterVolume * 3.5, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            // 2. Wood barrel body resonance (authentic dhol character)
            const woodOsc = this.audioContext.createOscillator();
            const woodGain = this.audioContext.createGain();
            const woodFilter = this.audioContext.createBiquadFilter();

            woodOsc.type = 'square';
            woodOsc.frequency.setValueAtTime(70, now);
            woodOsc.frequency.exponentialRampToValueAtTime(35, now + 0.15);

            woodFilter.type = 'bandpass';
            woodFilter.frequency.setValueAtTime(180, now);
            woodFilter.Q.setValueAtTime(12, now);

            woodGain.gain.setValueAtTime(this.masterVolume * 0.8, now);
            woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

            // 3. Sharp attack transient (the "DHAD" hit)
            const attackOsc = this.audioContext.createOscillator();
            const attackGain = this.audioContext.createGain();
            const attackFilter = this.audioContext.createBiquadFilter();

            attackOsc.type = 'sawtooth';
            attackOsc.frequency.setValueAtTime(350, now);
            attackOsc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

            attackFilter.type = 'bandpass';
            attackFilter.frequency.setValueAtTime(400, now);
            attackFilter.Q.setValueAtTime(6, now);

            attackGain.gain.setValueAtTime(this.masterVolume * 0.5, now);
            attackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            // 4. Leather membrane slap (surface texture)
            const membraneOsc = this.audioContext.createOscillator();
            const membraneGain = this.audioContext.createGain();
            const membraneFilter = this.audioContext.createBiquadFilter();

            membraneOsc.type = 'triangle';
            membraneOsc.frequency.setValueAtTime(220, now);
            membraneOsc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

            membraneFilter.type = 'highpass';
            membraneFilter.frequency.setValueAtTime(200, now);
            membraneFilter.Q.setValueAtTime(3, now);

            membraneGain.gain.setValueAtTime(this.masterVolume * 0.3, now);
            membraneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            // Connect all layers for authentic dhol sound
            subOsc.connect(subFilter);
            subFilter.connect(subGain);
            subGain.connect(this.audioContext.destination);

            woodOsc.connect(woodFilter);
            woodFilter.connect(woodGain);
            woodGain.connect(this.audioContext.destination);

            attackOsc.connect(attackFilter);
            attackFilter.connect(attackGain);
            attackGain.connect(this.audioContext.destination);

            membraneOsc.connect(membraneFilter);
            membraneFilter.connect(membraneGain);
            membraneGain.connect(this.audioContext.destination);

            // Start all layers
            subOsc.start(now);
            woodOsc.start(now);
            attackOsc.start(now);
            membraneOsc.start(now);

            // Stop at different times for realistic decay
            subOsc.stop(now + 0.8);
            woodOsc.stop(now + 0.4);
            attackOsc.stop(now + 0.08);
            membraneOsc.stop(now + 0.12);
        };
    }

    createTabla() {
        return () => {
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;

            // Sambalpuri folk tabla with earthy, rustic character

            // 1. Clay pot body (earthy foundation)
            const clayOsc = this.audioContext.createOscillator();
            const clayGain = this.audioContext.createGain();
            const clayFilter = this.audioContext.createBiquadFilter();

            clayOsc.type = 'triangle';
            clayOsc.frequency.setValueAtTime(140, now);
            clayOsc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

            clayFilter.type = 'lowpass';
            clayFilter.frequency.setValueAtTime(350, now);
            clayFilter.Q.setValueAtTime(4, now);

            clayGain.gain.setValueAtTime(this.masterVolume * 0.9, now);
            clayGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            // 2. Metallic ring (traditional tabla resonance)
            const ringOsc = this.audioContext.createOscillator();
            const ringGain = this.audioContext.createGain();
            const ringFilter = this.audioContext.createBiquadFilter();

            ringOsc.type = 'sine';
            ringOsc.frequency.setValueAtTime(1100, now);
            ringOsc.frequency.exponentialRampToValueAtTime(700, now + 0.12);

            ringFilter.type = 'bandpass';
            ringFilter.frequency.setValueAtTime(900, now);
            ringFilter.Q.setValueAtTime(8, now);

            ringGain.gain.setValueAtTime(this.masterVolume * 0.4, now);
            ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

            // 3. Folk attack (rustic character)
            const folkOsc = this.audioContext.createOscillator();
            const folkGain = this.audioContext.createGain();

            folkOsc.type = 'sawtooth';
            folkOsc.frequency.setValueAtTime(1600, now);
            folkOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);

            folkGain.gain.setValueAtTime(this.masterVolume * 0.25, now);
            folkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

            // Connect layers
            clayOsc.connect(clayFilter);
            clayFilter.connect(clayGain);
            clayGain.connect(this.audioContext.destination);

            ringOsc.connect(ringFilter);
            ringFilter.connect(ringGain);
            ringGain.connect(this.audioContext.destination);

            folkOsc.connect(folkGain);
            folkGain.connect(this.audioContext.destination);

            clayOsc.start(now);
            ringOsc.start(now);
            folkOsc.start(now);

            clayOsc.stop(now + 0.5);
            ringOsc.stop(now + 0.4);
            folkOsc.stop(now + 0.06);
        };
    }

    createNagada() {
        return () => {
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;

            // Massive ceremonial nagada - the earth-shaking festival drum

            // 1. Ultra-deep sub bass (festival power)
            const subOsc = this.audioContext.createOscillator();
            const subGain = this.audioContext.createGain();
            const subFilter = this.audioContext.createBiquadFilter();

            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(20, now);  // Extremely deep
            subOsc.frequency.exponentialRampToValueAtTime(10, now + 0.5);

            subFilter.type = 'lowpass';
            subFilter.frequency.setValueAtTime(50, now);
            subFilter.Q.setValueAtTime(6, now);

            subGain.gain.setValueAtTime(this.masterVolume * 4.0, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

            // 2. Thunder-like boom (ceremonial power)
            const thunderOsc = this.audioContext.createOscillator();
            const thunderGain = this.audioContext.createGain();
            const thunderFilter = this.audioContext.createBiquadFilter();

            thunderOsc.type = 'triangle';
            thunderOsc.frequency.setValueAtTime(35, now);
            thunderOsc.frequency.exponentialRampToValueAtTime(18, now + 0.4);

            thunderFilter.type = 'lowpass';
            thunderFilter.frequency.setValueAtTime(90, now);
            thunderFilter.Q.setValueAtTime(5, now);

            thunderGain.gain.setValueAtTime(this.masterVolume * 2.5, now);
            thunderGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

            // 3. Attack punch (ceremonial strike)
            const punchOsc = this.audioContext.createOscillator();
            const punchGain = this.audioContext.createGain();
            const punchFilter = this.audioContext.createBiquadFilter();

            punchOsc.type = 'square';
            punchOsc.frequency.setValueAtTime(70, now);
            punchOsc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

            punchFilter.type = 'bandpass';
            punchFilter.frequency.setValueAtTime(120, now);
            punchFilter.Q.setValueAtTime(8, now);

            punchGain.gain.setValueAtTime(this.masterVolume * 1.2, now);
            punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            // Connect layers
            subOsc.connect(subFilter);
            subFilter.connect(subGain);
            subGain.connect(this.audioContext.destination);

            thunderOsc.connect(thunderFilter);
            thunderFilter.connect(thunderGain);
            thunderGain.connect(this.audioContext.destination);

            punchOsc.connect(punchFilter);
            punchFilter.connect(punchGain);
            punchGain.connect(this.audioContext.destination);

            subOsc.start(now);
            thunderOsc.start(now);
            punchOsc.start(now);

            subOsc.stop(now + 2.0);
            thunderOsc.stop(now + 1.5);
            punchOsc.stop(now + 0.25);
        };
    }

    createManjira() {
        return () => {
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;

            // Traditional brass cymbals with authentic shimmer
            const frequencies = [2800, 4500, 7200, 11500, 18000]; // Metallic harmonics

            frequencies.forEach((freq, index) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq + (Math.random() * 30 - 15), now); // Slight random detuning

                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(freq, now);
                filter.Q.setValueAtTime(4 + index, now);

                const gainValue = this.masterVolume * (0.5 / (index + 1));
                gain.gain.setValueAtTime(gainValue, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

                // Add shimmer LFO
                const lfo = this.audioContext.createOscillator();
                const lfoGain = this.audioContext.createGain();

                lfo.type = 'sine';
                lfo.frequency.setValueAtTime(6 + index * 2, now);
                lfoGain.gain.setValueAtTime(8, now);

                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.audioContext.destination);

                osc.start(now);
                lfo.start(now);

                osc.stop(now + 0.7);
                lfo.stop(now + 0.7);
            });
        };
    }

    createDholak() {
        return () => {
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;

            // Folk dholak with warm, woody character

            // 1. Main wooden body
            const bodyOsc = this.audioContext.createOscillator();
            const bodyGain = this.audioContext.createGain();
            const bodyFilter = this.audioContext.createBiquadFilter();

            bodyOsc.type = 'triangle';
            bodyOsc.frequency.setValueAtTime(85, now);
            bodyOsc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

            bodyFilter.type = 'lowpass';
            bodyFilter.frequency.setValueAtTime(280, now);
            bodyFilter.Q.setValueAtTime(3, now);

            bodyGain.gain.setValueAtTime(this.masterVolume * 1.0, now);
            bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            // 2. Wood resonance chamber
            const woodOsc = this.audioContext.createOscillator();
            const woodGain = this.audioContext.createGain();
            const woodFilter = this.audioContext.createBiquadFilter();

            woodOsc.type = 'square';
            woodOsc.frequency.setValueAtTime(180, now);
            woodOsc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

            woodFilter.type = 'bandpass';
            woodFilter.frequency.setValueAtTime(500, now);
            woodFilter.Q.setValueAtTime(8, now);

            woodGain.gain.setValueAtTime(this.masterVolume * 0.5, now);
            woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

            // 3. Surface slap
            const slapOsc = this.audioContext.createOscillator();
            const slapGain = this.audioContext.createGain();
            const slapFilter = this.audioContext.createBiquadFilter();

            slapOsc.type = 'sawtooth';
            slapOsc.frequency.setValueAtTime(700, now);
            slapOsc.frequency.exponentialRampToValueAtTime(350, now + 0.04);

            slapFilter.type = 'highpass';
            slapFilter.frequency.setValueAtTime(500, now);

            slapGain.gain.setValueAtTime(this.masterVolume * 0.3, now);
            slapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            // Connect layers
            bodyOsc.connect(bodyFilter);
            bodyFilter.connect(bodyGain);
            bodyGain.connect(this.audioContext.destination);

            woodOsc.connect(woodFilter);
            woodFilter.connect(woodGain);
            woodGain.connect(this.audioContext.destination);

            slapOsc.connect(slapFilter);
            slapFilter.connect(slapGain);
            slapGain.connect(this.audioContext.destination);

            bodyOsc.start(now);
            woodOsc.start(now);
            slapOsc.start(now);

            bodyOsc.stop(now + 0.3);
            woodOsc.stop(now + 0.2);
            slapOsc.stop(now + 0.08);
        };
    }

    createKanjira() {
        return () => {
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;

            // Frame drum with traditional jingle pattern

            // 1. Frame drum hit
            const frameOsc = this.audioContext.createOscillator();
            const frameGain = this.audioContext.createGain();
            const frameFilter = this.audioContext.createBiquadFilter();

            frameOsc.type = 'triangle';
            frameOsc.frequency.setValueAtTime(160, now);
            frameOsc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

            frameFilter.type = 'bandpass';
            frameFilter.frequency.setValueAtTime(220, now);
            frameFilter.Q.setValueAtTime(4, now);

            frameGain.gain.setValueAtTime(this.masterVolume * 0.7, now);
            frameGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

            frameOsc.connect(frameFilter);
            frameFilter.connect(frameGain);
            frameGain.connect(this.audioContext.destination);

            frameOsc.start(now);
            frameOsc.stop(now + 0.18);

            // 2. Realistic jingle cascade
            const jingleDelays = [35, 65, 95, 125, 155, 185]; // Natural jingle timing
            const jingleFreqs = [3200, 4100, 5300, 6800, 8500, 10200];

            jingleDelays.forEach((delay, i) => {
                setTimeout(() => {
                    if (!this.audioContext) return;

                    const jingleOsc = this.audioContext.createOscillator();
                    const jingleGain = this.audioContext.createGain();
                    const jingleFilter = this.audioContext.createBiquadFilter();

                    jingleOsc.type = 'sawtooth';
                    jingleOsc.frequency.setValueAtTime(jingleFreqs[i], this.audioContext.currentTime);

                    jingleFilter.type = 'highpass';
                    jingleFilter.frequency.setValueAtTime(2800, this.audioContext.currentTime);
                    jingleFilter.Q.setValueAtTime(1.5, this.audioContext.currentTime);

                    jingleGain.gain.setValueAtTime(this.masterVolume * (0.18 - i * 0.025), this.audioContext.currentTime);
                    jingleGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);

                    jingleOsc.connect(jingleFilter);
                    jingleFilter.connect(jingleGain);
                    jingleGain.connect(this.audioContext.destination);

                    jingleOsc.start();
                    jingleOsc.stop(this.audioContext.currentTime + 0.12);
                }, delay);
            });
        };
    }

    createAdvancedKick() {
        return () => {
            if (!this.audioContext) return;

            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const oscillator3 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            const compressor = this.audioContext.createDynamicsCompressor();

            oscillator1.type = 'sine';
            oscillator1.frequency.setValueAtTime(80, this.audioContext.currentTime);
            oscillator1.frequency.exponentialRampToValueAtTime(35, this.audioContext.currentTime + 0.1);

            oscillator2.type = 'triangle';
            oscillator2.frequency.setValueAtTime(120, this.audioContext.currentTime);
            oscillator2.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.08);

            oscillator3.type = 'square';
            oscillator3.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator3.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.05);

            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(400, this.audioContext.currentTime);
            filterNode.Q.setValueAtTime(1, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(this.masterVolume * 4.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);

            oscillator1.connect(filterNode);
            oscillator2.connect(filterNode);
            oscillator3.connect(filterNode);
            filterNode.connect(compressor);
            compressor.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator1.start();
            oscillator2.start();
            oscillator3.start();
            oscillator1.stop(this.audioContext.currentTime + 0.25);
            oscillator2.stop(this.audioContext.currentTime + 0.25);
            oscillator3.stop(this.audioContext.currentTime + 0.15);
        };
    }
    createTrap808Snare() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const sources = [];
            const gainNodes = [];

            // Layer 1: Deep 808 Sub Bass
            const sub808 = this.audioContext.createOscillator();
            const sub808Gain = this.audioContext.createGain();
            const sub808Filter = this.audioContext.createBiquadFilter();

            sub808.connect(sub808Filter);
            sub808Filter.connect(sub808Gain);
            sub808Gain.connect(this.audioContext.destination);

            sub808.frequency.setValueAtTime(60, now); // Deep sub frequency
            sub808.frequency.exponentialRampToValueAtTime(40, now + 0.1);
            sub808.type = 'triangle';

            // Sub bass filter (low-pass for warmth)
            sub808Filter.type = 'lowpass';
            sub808Filter.frequency.setValueAtTime(120, now);
            sub808Filter.Q.setValueAtTime(2, now);

            // Sub bass envelope
            const subGain = this.masterVolume * 0.4;
            sub808Gain.gain.setValueAtTime(0, now);
            sub808Gain.gain.linearRampToValueAtTime(subGain, now + 0.005);
            sub808Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            sub808.start(now);
            sub808.stop(now + 0.8);
            sources.push(sub808);

            // Layer 2: Punchy Mid-Range Knock
            const midKnock = this.audioContext.createOscillator();
            const midKnockGain = this.audioContext.createGain();
            const midKnockFilter = this.audioContext.createBiquadFilter();

            midKnock.connect(midKnockFilter);
            midKnockFilter.connect(midKnockGain);
            midKnockGain.connect(this.audioContext.destination);

            midKnock.frequency.setValueAtTime(200, now);
            midKnock.frequency.exponentialRampToValueAtTime(80, now + 0.05);
            midKnock.type = 'square';

            // Mid-range filter for punch
            midKnockFilter.type = 'bandpass';
            midKnockFilter.frequency.setValueAtTime(150, now);
            midKnockFilter.Q.setValueAtTime(3, now);

            // Mid knock envelope (shorter and punchier)
            const midGain = this.masterVolume * 0.25;
            midKnockGain.gain.setValueAtTime(0, now);
            midKnockGain.gain.linearRampToValueAtTime(midGain, now + 0.002);
            midKnockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            midKnock.start(now);
            midKnock.stop(now + 0.15);
            sources.push(midKnock);

            // Layer 3: Crispy High-End Snap
            const highSnap = this.audioContext.createOscillator();
            const highSnapGain = this.audioContext.createGain();
            const highSnapFilter = this.audioContext.createBiquadFilter();

            highSnap.connect(highSnapFilter);
            highSnapFilter.connect(highSnapGain);
            highSnapGain.connect(this.audioContext.destination);

            highSnap.frequency.setValueAtTime(8000, now);
            highSnap.frequency.exponentialRampToValueAtTime(12000, now + 0.01);
            highSnap.type = 'sawtooth';

            // High-end filter for crispiness
            highSnapFilter.type = 'highpass';
            highSnapFilter.frequency.setValueAtTime(6000, now);
            highSnapFilter.Q.setValueAtTime(0.7, now);

            // High snap envelope (very short and crispy)
            const highGain = this.masterVolume * 0.15;
            highSnapGain.gain.setValueAtTime(0, now);
            highSnapGain.gain.linearRampToValueAtTime(highGain, now + 0.001);
            highSnapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            highSnap.start(now);
            highSnap.stop(now + 0.08);
            sources.push(highSnap);

            // Layer 4: Vinyl Crackle/Texture (Hip-Hop Flavor)
            const crackle = this.audioContext.createBufferSource();
            const crackleGain = this.audioContext.createGain();
            const crackleFilter = this.audioContext.createBiquadFilter();

            // Generate noise buffer for vinyl crackle
            const crackleBuffer = this.audioContext.createBuffer(1, 4410, this.audioContext.sampleRate); // 0.1 seconds
            const crackleData = crackleBuffer.getChannelData(0);

            for (let i = 0; i < crackleData.length; i++) {
                // Create vinyl-like crackle pattern
                const noise = (Math.random() - 0.5) * 2;
                const envelope = Math.exp(-i / (crackleData.length * 0.3)); // Exponential decay
                crackleData[i] = noise * envelope * 0.1;
            }

            crackle.buffer = crackleBuffer;
            crackle.connect(crackleFilter);
            crackleFilter.connect(crackleGain);
            crackleGain.connect(this.audioContext.destination);

            // Filter crackle for vintage sound
            crackleFilter.type = 'bandpass';
            crackleFilter.frequency.setValueAtTime(4000, now);
            crackleFilter.Q.setValueAtTime(2, now);

            // Crackle envelope
            const crackleGainValue = this.masterVolume * 0.08;
            crackleGain.gain.setValueAtTime(crackleGainValue, now);
            crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            crackle.start(now);
            crackle.stop(now + 0.1);
            sources.push(crackle);

            // Layer 5: Tape Saturation (Analog Warmth)
            const saturation = this.audioContext.createWaveShaper();
            const saturationGain = this.audioContext.createGain();

            // Create saturation curve for analog warmth
            const samples = 44100;
            const curve = new Float32Array(samples);
            for (let i = 0; i < samples; i++) {
                const x = (i * 2) / samples - 1;
                // Smooth tape saturation curve
                curve[i] = Math.tanh(x * 2) * 0.5;
            }
            saturation.curve = curve;
            saturation.oversample = '2x';

            // Apply subtle saturation to the entire signal
            const masterSat = this.audioContext.createGain();
            masterSat.connect(saturation);
            saturation.connect(saturationGain);
            saturationGain.connect(this.audioContext.destination);

            // Connect previous layers to saturation
            sub808Gain.connect(masterSat);
            midKnockGain.connect(masterSat);

            saturationGain.gain.setValueAtTime(this.masterVolume * 0.3, now);

            setTimeout(() => {
                sources.forEach(source => {
                    if (source && typeof source.stop === 'function') {
                        try { source.stop(); } catch (e) { }
                    }
                });
                gainNodes.forEach(gain => {
                    try { gain.disconnect(); } catch (e) { }
                });
            }, 1000);

            return sources;
        };
    }

    createAdvancedSnare() {
        return () => {
            if (!this.audioContext) return;

            const bufferSize = this.audioContext.sampleRate * 0.15;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
            }

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            const reverb = this.audioContext.createConvolver();

            source.buffer = buffer;
            filterNode.type = 'highpass';
            filterNode.frequency.setValueAtTime(300, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(this.masterVolume * 0.6, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

            source.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.start();
        };
    }

    createAdvancedHiHat() {
        return () => {
            if (!this.audioContext) return;

            const bufferSize = this.audioContext.sampleRate * 0.08;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 4);
            }

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();

            source.buffer = buffer;
            filterNode.type = 'highpass';
            filterNode.frequency.setValueAtTime(10000, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);

            source.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.start();
        };
    }
    createPianoChord() {
        return () => {
            if (!this.audioContext) return;

            // C Major 7th chord (C, E, G, B)
            const frequencies = [261.63, 329.63, 392.00, 493.88]; // C4, E4, G4, B4
            const masterGain = this.audioContext.createGain();
            const compressor = this.audioContext.createDynamicsCompressor();
            const reverb = this.audioContext.createConvolver();

            // Create impulse response for reverb (simulate concert hall)
            const reverbBuffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * 3, this.audioContext.sampleRate);
            for (let channel = 0; channel < 2; channel++) {
                const channelData = reverbBuffer.getChannelData(channel);
                for (let i = 0; i < channelData.length; i++) {
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / channelData.length, 2);
                }
            }
            reverb.buffer = reverbBuffer;

            // Stagger the notes slightly for a more natural piano attack
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    const filterNode = this.audioContext.createBiquadFilter();

                    // Piano-like sound using multiple harmonics
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);

                    // Subtle filtering for warmth
                    filterNode.type = 'lowpass';
                    filterNode.frequency.setValueAtTime(4000, this.audioContext.currentTime);
                    filterNode.Q.setValueAtTime(0.7, this.audioContext.currentTime);

                    // Piano-like envelope with extended sustain
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(this.masterVolume * 0.2, this.audioContext.currentTime + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(this.masterVolume * 0.15, this.audioContext.currentTime + 1.5);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 4.0); // Extended

                    oscillator.connect(filterNode);
                    filterNode.connect(gainNode);
                    gainNode.connect(compressor);
                    compressor.connect(reverb);
                    reverb.connect(masterGain);
                    gainNode.connect(masterGain); // Dry signal
                    masterGain.connect(this.audioContext.destination);

                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 4.0);
                }, index * 15); // Slight stagger for natural piano attack
            });

            // Master volume control
            masterGain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
            masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 4.5);
        };
    }

    createStringEnsemble() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const frequencies = [196.00, 246.94, 293.66, 349.23]; // G3, B3, D4, F4
            const sources = [];

            frequencies.forEach((freq, index) => {
                // Create multiple oscillators per note for richness
                for (let i = 0; i < 3; i++) {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    const filter = this.audioContext.createBiquadFilter();

                    oscillator.connect(filter);
                    filter.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);

                    const detune = (i - 1) * 0.5; // Slight detune spread
                    oscillator.frequency.setValueAtTime(freq * (1 + detune * 0.001), now);
                    oscillator.type = 'sawtooth';

                    // String-like filter
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(800 + (index * 200), now);
                    filter.Q.setValueAtTime(0.8, now);

                    const baseGain = this.masterVolume * 0.05; // Quieter due to multiple oscillators
                    gainNode.gain.setValueAtTime(0, now);
                    gainNode.gain.linearRampToValueAtTime(baseGain, now + 0.3);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

                    oscillator.start(now);
                    oscillator.stop(now + 4.5);

                    sources.push(oscillator);
                }
            });

            return sources;
        };
    }

    createAdvancedOpenHat() {
        return () => {
            if (!this.audioContext) return;

            const bufferSize = this.audioContext.sampleRate * 0.4;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.2);
            }

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();

            source.buffer = buffer;
            filterNode.type = 'highpass';
            filterNode.frequency.setValueAtTime(7000, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);

            source.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.start();
        };
    }

    createAdvancedClap() {
        return () => {
            if (!this.audioContext) return;

            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    const bufferSize = this.audioContext.sampleRate * 0.04;
                    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
                    const data = buffer.getChannelData(0);

                    for (let j = 0; j < bufferSize; j++) {
                        data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / bufferSize, 3);
                    }

                    const source = this.audioContext.createBufferSource();
                    const gainNode = this.audioContext.createGain();
                    const filterNode = this.audioContext.createBiquadFilter();

                    source.buffer = buffer;
                    filterNode.type = 'bandpass';
                    filterNode.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                    filterNode.Q.setValueAtTime(3, this.audioContext.currentTime);

                    gainNode.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.04);

                    source.connect(filterNode);
                    filterNode.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);

                    source.start();
                }, i * 15);
            }
        };
    }

    createAdvancedCrash() {
        return () => {
            if (!this.audioContext) return;

            const bufferSize = this.audioContext.sampleRate * 2;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.5);
            }

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();

            source.buffer = buffer;
            filterNode.type = 'highpass';
            filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(this.masterVolume * 0.5, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);

            source.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.start();
        };
    }

    createAdvancedRide() {
        return () => {
            if (!this.audioContext) return;

            // Create multiple oscillators for richer harmonic content
            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const oscillator3 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            const delayNode = this.audioContext.createDelay();
            const delayGain = this.audioContext.createGain();

            // Harmonic frequencies for a musical ride sound
            oscillator1.type = 'triangle';
            oscillator1.frequency.setValueAtTime(800, this.audioContext.currentTime); // Fundamental

            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(1200, this.audioContext.currentTime); // Perfect fifth

            oscillator3.type = 'sawtooth';
            oscillator3.frequency.setValueAtTime(1600, this.audioContext.currentTime); // Octave

            // Gentle filtering for warmth
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(3000, this.audioContext.currentTime);
            filterNode.Q.setValueAtTime(0.5, this.audioContext.currentTime);

            // Subtle delay for shimmer effect
            delayNode.delayTime.setValueAtTime(0.05, this.audioContext.currentTime);
            delayGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);

            // Smoother envelope
            gainNode.gain.setValueAtTime(this.masterVolume * 0.25, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);

            oscillator1.connect(filterNode);
            oscillator2.connect(filterNode);
            oscillator3.connect(filterNode);
            filterNode.connect(gainNode);
            filterNode.connect(delayNode);
            delayNode.connect(delayGain);
            delayGain.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator1.start();
            oscillator2.start();
            oscillator3.start();
            oscillator1.stop(this.audioContext.currentTime + 0.8);
            oscillator2.stop(this.audioContext.currentTime + 0.8);
            oscillator3.stop(this.audioContext.currentTime + 0.8);
        };
    }

    createAdvancedPerc() {
        return () => {
            if (!this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

            filterNode.type = 'bandpass';
            filterNode.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            filterNode.Q.setValueAtTime(5, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        };
    }



    createEMajorChord() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const frequencies = [329.63, 415.30, 493.88]; // E4, G#4, B4
            const sources = [];

            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, now);
                oscillator.type = 'sine';

                const baseGain = this.masterVolume * 0.15;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(baseGain, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 4);

                oscillator.start(now);
                oscillator.stop(now + 4);

                sources.push(oscillator);
            });

            return sources;
        };
    }

    createAMinorChord() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const frequencies = [220.00, 261.63, 329.63]; // A3, C4, E4
            const sources = [];

            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, now);
                oscillator.type = 'sine';

                const baseGain = this.masterVolume * 0.15;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(baseGain, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 4);

                oscillator.start(now);
                oscillator.stop(now + 4);

                sources.push(oscillator);
            });

            return sources;
        };
    }

    // 3. F Major 7th Chord (J key) - Jazz and sophisticated
    createFMaj7Chord() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const frequencies = [174.61, 220.00, 261.63, 329.63]; // F3, A3, C4, E4
            const sources = [];

            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, now);
                oscillator.type = 'triangle';

                const baseGain = this.masterVolume * 0.12;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(baseGain, now + 0.15);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

                oscillator.start(now);
                oscillator.stop(now + 4.5);

                sources.push(oscillator);
            });

            return sources;
        };
    }

    // 4. D Minor Chord (K key) - Sad and haunting
    createDMinorChord() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const frequencies = [146.83, 174.61, 220.00]; // D3, F3, A3
            const sources = [];

            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, now);
                oscillator.type = 'sine';

                const baseGain = this.masterVolume * 0.16;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(baseGain, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 4);

                oscillator.start(now);
                oscillator.stop(now + 4);

                sources.push(oscillator);
            });

            return sources;
        };
    }

    // 5. C Major 9th Chord (N key) - Extended and lush
    createCMaj9Chord() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const frequencies = [130.81, 164.81, 196.00, 246.94, 293.66]; // C3, E3, G3, B3, D4
            const sources = [];

            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, now);
                oscillator.type = 'sine';

                const baseGain = this.masterVolume * 0.1; // Quieter due to more notes
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(baseGain, now + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 5);

                oscillator.start(now);
                oscillator.stop(now + 5);

                sources.push(oscillator);
            });

            return sources;
        };
    }

    // 6. Power Chord (M key) - Rock and powerful (keep short for punch)
    createPowerChord() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const frequencies = [82.41, 123.47, 164.81]; // E2, B2, E3 (power chord)
            const sources = [];

            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const distortion = this.audioContext.createWaveShaper();

                // Create distortion curve for rock sound
                const samples = 44100;
                const curve = new Float32Array(samples);
                const deg = Math.PI / 180;
                for (let i = 0; i < samples; i++) {
                    const x = (i * 2) / samples - 1;
                    curve[i] = ((3 + 20) * x * 20 * deg) / (Math.PI + 20 * Math.abs(x));
                }
                distortion.curve = curve;
                distortion.oversample = '4x';

                oscillator.connect(distortion);
                distortion.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, now);
                oscillator.type = 'sawtooth';

                const baseGain = this.masterVolume * 0.2;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(baseGain, now + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

                oscillator.start(now);
                oscillator.stop(now + 2.5);

                sources.push(oscillator);
            });

            return sources;
        };
    }
    createAdvanced808() {
        return () => {
            if (!this.audioContext) return;

            const oscillator1 = this.audioContext.createOscillator();
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            const distortion = this.audioContext.createWaveShaper();

            oscillator1.type = 'sine';
            oscillator1.frequency.setValueAtTime(60, this.audioContext.currentTime);
            oscillator1.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.15);

            oscillator2.type = 'triangle';
            oscillator2.frequency.setValueAtTime(120, this.audioContext.currentTime);
            oscillator2.frequency.exponentialRampToValueAtTime(60, this.audioContext.currentTime + 0.1);

            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(200, this.audioContext.currentTime);
            filterNode.Q.setValueAtTime(2, this.audioContext.currentTime);

            const curve = new Float32Array(256);
            for (let i = 0; i < 256; i++) {
                const x = (i - 128) / 128;
                curve[i] = Math.tanh(x * 5) * 0.9;
            }
            distortion.curve = curve;

            // Shorter, tighter envelope
            gainNode.gain.setValueAtTime(this.masterVolume * 5.0, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.35);

            oscillator1.connect(distortion);
            oscillator2.connect(distortion);
            distortion.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator1.start();
            oscillator2.start();
            oscillator1.stop(this.audioContext.currentTime + 0.35);
            oscillator2.stop(this.audioContext.currentTime + 0.25);
        };
    }

    createGMajorChord() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const frequencies = [196.00, 246.94, 293.66]; // G3, B3, D4
            const sources = [];

            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, now);
                oscillator.type = 'sine';

                const baseGain = this.masterVolume * 0.15;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(baseGain, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 4);

                oscillator.start(now);
                oscillator.stop(now + 4);

                sources.push(oscillator);
            });

            return sources;
        };
    }

    // 2. Angelic Choir (S key) - Heavenly voices - I really don't know how an angel sounds, but this is my best guess
    createAngelicChoir() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
            const sources = [];

            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();

                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, now);
                oscillator.type = 'sine';

                // Subtle vibrato for choir effect
                const lfo = this.audioContext.createOscillator();
                const lfoGain = this.audioContext.createGain();
                lfo.connect(lfoGain);
                lfoGain.connect(oscillator.frequency);
                lfo.frequency.setValueAtTime(4.5, now); // Slow vibrato
                lfoGain.gain.setValueAtTime(2, now); // Subtle depth
                lfo.start(now);
                lfo.stop(now + 5);

                // Low-pass filter for warmth
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, now);
                filter.Q.setValueAtTime(0.5, now);

                const baseGain = this.masterVolume * 0.08;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(baseGain, now + 0.5);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 5);

                oscillator.start(now);
                oscillator.stop(now + 5);

                sources.push(oscillator, lfo);
            });

            return sources;
        };
    }

    // 3. Crystal Bells (D key) - Pure magic
    createCrystalBells() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            const sources = [];

            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();

                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, now);
                oscillator.type = 'sine';

                // Bell-like filter with resonance
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(freq * 1.5, now);
                filter.Q.setValueAtTime(10, now);

                const baseGain = this.masterVolume * 0.12;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(baseGain, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3);

                oscillator.start(now);
                oscillator.stop(now + 3);

                sources.push(oscillator);
            });

            return sources;
        };
    }

    // 4. Ethereal Flute (F key) - Floating melody - I tried to capture the essence of a flute
    // with a soft, airy sound and gentle vibrato
    createEtherealFlute() {
        return () => {
            if (!this.audioContext) return;

            // Beautiful melodic phrase in A minor
            const notes = [440, 523.25, 493.88, 440, 392, 329.63]; // A4-C5-B4-A4-G4-E4
            const masterGain = this.audioContext.createGain();
            const reverb = this.audioContext.createConvolver();
            const delay = this.audioContext.createDelay();
            const delayGain = this.audioContext.createGain();

            // Setup effects
            const reverbBuffer = this.audioContext.createBuffer(2, this.audioContext.sampleRate * 3, this.audioContext.sampleRate);
            for (let channel = 0; channel < 2; channel++) {
                const channelData = reverbBuffer.getChannelData(channel);
                for (let i = 0; i < channelData.length; i++) {
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / channelData.length, 1.5);
                }
            }
            reverb.buffer = reverbBuffer;

            delay.delayTime.setValueAtTime(0.25, this.audioContext.currentTime);
            delayGain.gain.setValueAtTime(0.25, this.audioContext.currentTime);

            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    const filterNode = this.audioContext.createBiquadFilter();
                    const lfo = this.audioContext.createOscillator();
                    const lfoGain = this.audioContext.createGain();

                    // Flute-like sine wave
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);

                    // Vibrato LFO
                    lfo.type = 'sine';
                    lfo.frequency.setValueAtTime(4.5, this.audioContext.currentTime);
                    lfoGain.gain.setValueAtTime(8, this.audioContext.currentTime);

                    // Gentle filtering
                    filterNode.type = 'lowpass';
                    filterNode.frequency.setValueAtTime(4000, this.audioContext.currentTime);
                    filterNode.Q.setValueAtTime(0.8, this.audioContext.currentTime);

                    // Flute breath envelope
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + 0.1);
                    gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.25, this.audioContext.currentTime + 0.4);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);

                    lfo.connect(lfoGain);
                    lfoGain.connect(oscillator.frequency);
                    oscillator.connect(filterNode);
                    filterNode.connect(gainNode);
                    gainNode.connect(reverb);
                    gainNode.connect(delay);
                    delay.connect(delayGain);
                    reverb.connect(masterGain);
                    delayGain.connect(masterGain);
                    masterGain.connect(this.audioContext.destination);

                    oscillator.start();
                    lfo.start();
                    oscillator.stop(this.audioContext.currentTime + 0.8);
                    lfo.stop(this.audioContext.currentTime + 0.8);
                }, index * 300); // Beautiful melodic timing
            });

            masterGain.gain.setValueAtTime(1, this.audioContext.currentTime);
            masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 3);
        };
    }

    // 5. Aurora Pad (V key) - Cosmic beauty
    createAuroraPad() {
        return () => {
            if (!this.audioContext) return null;

            const now = this.audioContext.currentTime;
            const frequencies = [130.81, 164.81, 196.00, 246.94]; // C3, E3, G3, B3
            const sources = [];

            frequencies.forEach((freq, index) => {
                const oscillator1 = this.audioContext.createOscillator();
                const oscillator2 = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                const delay = this.audioContext.createDelay();
                const delayFeedback = this.audioContext.createGain();
                const delayWet = this.audioContext.createGain();

                // Create rich pad sound with detuned oscillators
                oscillator1.connect(gainNode);
                oscillator2.connect(gainNode);
                gainNode.connect(filter);

                // Add delay effect
                filter.connect(delay);
                delay.connect(delayFeedback);
                delayFeedback.connect(delay);
                delay.connect(delayWet);
                delayWet.connect(this.audioContext.destination);
                filter.connect(this.audioContext.destination);

                oscillator1.frequency.setValueAtTime(freq, now);
                oscillator2.frequency.setValueAtTime(freq * 1.002, now);
                oscillator1.type = 'sawtooth';
                oscillator2.type = 'sine';

                // Filter sweep
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(400, now);
                filter.frequency.linearRampToValueAtTime(1200, now + 4);
                filter.Q.setValueAtTime(1, now);

                // Delay settings
                delay.delayTime.setValueAtTime(0.3, now);
                delayFeedback.gain.setValueAtTime(0.3, now);
                delayWet.gain.setValueAtTime(0.2, now);

                const baseGain = this.masterVolume * 0.1;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(baseGain, now + 1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 5);

                oscillator1.start(now);
                oscillator2.start(now);
                oscillator1.stop(now + 5);
                oscillator2.stop(now + 5);

                sources.push(oscillator1, oscillator2);
            });

            return sources;
        };
    }

    startVisualizerPerformanceMonitoring() {
        let frameCount = 0;
        let lastFPSCheck = performance.now();

        const checkPerformance = () => {
            frameCount++;
            const now = performance.now();

            if (now - lastFPSCheck >= 1000) {
                const actualFPS = frameCount;
                frameCount = 0;
                lastFPSCheck = now;

                // Adaptive quality based on performance
                if (actualFPS < 30) {
                    this.visualizerFPS = 30;
                    this.visualizerInterval = 1000 / 30;
                    console.warn('Visualizer: Reduced quality for better performance');
                } else if (actualFPS > 55 && this.visualizerFPS < 60) {
                    // Restore quality if performance improves
                    this.visualizerFPS = 60;
                    this.visualizerInterval = 1000 / 60;
                    console.log('Visualizer: Restored full quality');
                }
            }

            if (this.isVisualizerActive) {
                requestAnimationFrame(checkPerformance);
            }
        };

        requestAnimationFrame(checkPerformance);
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            this.isVisualizerActive = !document.hidden;

            if (this.isVisualizerActive) {
                // Resume visualizer when tab becomes active
                this.updateAdvancedVisualizer();
            } else {
                // Pause visualizer when tab is hidden
                if (this.animationFrameId) {
                    cancelAnimationFrame(this.animationFrameId);
                    this.animationFrameId = null;
                }
            }
        });
    }

    stopVisualizer() {
        this.visualizerRunning = false;
        this.isVisualizerActive = false;

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }


    playBeat(key) {
        const pad = this.beatPads.find(p => p.key === key);
        if (!pad || !this.sounds[pad.sound]) return;

        if (this.longDurationSounds.includes(pad.sound)) {
            this.stopSound(pad.sound);
        }

        const audioSources = this.sounds[pad.sound]();

        if (this.longDurationSounds.includes(pad.sound) && audioSources) {
            this.trackSound(pad.sound, audioSources);
        }

        // Visual feedback
        this.addActiveState(key);
        this.showBeatIndicator(key.toUpperCase());

        this.visualizerData.lastBeatTime = performance.now();

        this.createParticles(key);

        this.updateStats(key);

        if (this.isRecording) {
            this.recordedLoop.push({
                key: key,
                time: Date.now(),
                relativeTime: Date.now() - this.recordStartTime
            });
        }
    }

    trackSound(soundKey, audioSources) {
        const sources = Array.isArray(audioSources) ? audioSources : [audioSources];
        const stopTime = Date.now() + 5000; // Assume max 5 seconds duration

        this.activeSounds.set(soundKey, {
            sources: sources,
            stopTime: stopTime
        });

        // Auto-cleanup after sound duration
        setTimeout(() => {
            this.activeSounds.delete(soundKey);
        }, 5000);
    }

    stopSound(soundKey) {
        if (this.activeSounds.has(soundKey)) {
            const soundData = this.activeSounds.get(soundKey);

            // Stop all sources for this sound
            soundData.sources.forEach(source => {
                if (source && typeof source.stop === 'function') {
                    try {
                        source.stop();
                    } catch (e) {
                        // Source might already be stopped
                    }
                }
            });

            // Remove from tracking
            this.activeSounds.delete(soundKey);
        }
    }

    stopAllLongSounds() {
        this.longDurationSounds.forEach(soundKey => {
            this.stopSound(soundKey);
        });
    }

    // playSample(sampleId) {
    //     // Stop current sample if playing
    //     if (this.currentSample !== null) {
    //         this.stopSample();
    //     }

    //     // Stop any current loop
    //     if (this.isLoopPlaying) {
    //         this.stopLoop();
    //     }

    //     const sample = this.sampleBeats[sampleId];
    //     if (!sample) return;

    //     this.currentSample = sampleId;

    //     // Add visual feedback
    //     const sampleCard = document.querySelector(`[data-sample-id="${sampleId}"]`);
    //     sampleCard.classList.add('playing');

    //     // Calculate pattern duration
    //     const patternDuration = Math.max(...sample.pattern.map(beat => beat.time)) + 1000;

    //     // Play the pattern
    //     const playSamplePattern = () => {
    //         sample.pattern.forEach(beat => {
    //             setTimeout(() => {
    //                 if (this.currentSample === sampleId) {
    //                     this.playBeat(beat.key);
    //                 }
    //             }, beat.time);
    //         });
    //     };

    //     playSamplePattern();

    //     // Set up loop
    //     this.sampleInterval = setInterval(() => {
    //         if (this.currentSample === sampleId) {
    //             playSamplePattern();
    //         }
    //     }, patternDuration);

    //     // Update tempo display to match sample
    //     const tempoSlider = document.getElementById('tempoSlider');
    //     const tempoValue = document.getElementById('tempoValue');
    //     tempoSlider.value = sample.bpm;
    //     tempoValue.textContent = sample.bpm + ' BPM';
    //     this.currentTempo = sample.bpm;
    // }
    playSample(sampleId) {
        // Stop current sample if playing
        if (this.currentSample !== null) {
            this.stopSample();
        }

        // Stop any current loop
        if (this.isLoopPlaying) {
            this.stopLoop();
        }

        const sample = this.sampleBeats[sampleId];
        if (!sample) return;

        this.currentSample = sampleId;

        // Add visual feedback to sample card
        const sampleCard = document.querySelector(`[data-sample-id="${sampleId}"]`);
        sampleCard.classList.add('playing');

        // Check if this is the Sambalpuri sample and we have the audio file
        if (sample.name.includes('Singha Baja') && this.audioFiles['singha-baja']) {
            this.playRealAudioWithVisuals(sampleId);
        } else {
            // Fallback to synthesized pattern
            this.playSynthesizedPattern(sampleId);
        }
    }
    createSampleProgressIndicator(sampleCard, duration) {
        // Remove existing progress bar if any
        const existingProgress = sampleCard.querySelector('.sample-progress');
        if (existingProgress) {
            existingProgress.remove();
        }

        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'sample-progress';
        progressBar.innerHTML = `
        <div class="progress-fill"></div>
        <div class="progress-text">Playing...</div>
    `;

        sampleCard.appendChild(progressBar);

        // Animate progress bar
        const progressFill = progressBar.querySelector('.progress-fill');
        progressFill.style.width = '0%';

        // Use CSS animation for smooth progress
        setTimeout(() => {
            progressFill.style.transition = `width ${duration}ms linear`;
            progressFill.style.width = '100%';
        }, 50);
    }
    showSampleInfo(sample) {
        // Create or update sample info display
        let sampleInfo = document.getElementById('currentSampleInfo');
        if (!sampleInfo) {
            sampleInfo = document.createElement('div');
            sampleInfo.id = 'currentSampleInfo';
            sampleInfo.className = 'current-sample-info';
            document.body.appendChild(sampleInfo);
        }

        sampleInfo.innerHTML = `
        <div class="sample-info-content">
            <div class="sample-info-title">${sample.name}</div>
            <div class="sample-info-details">
                <span class="sample-genre">${sample.genre}</span>
                <span class="sample-bpm">${sample.bpm} BPM</span>
            </div>
            <div class="sample-info-description">${sample.description}</div>
            <div class="sample-info-progress">
                <div class="info-progress-bar">
                    <div class="info-progress-fill"></div>
                </div>
            </div>
        </div>
    `;

        sampleInfo.classList.add('show');

        // Animate progress for the info display too
        const infoProgressFill = sampleInfo.querySelector('.info-progress-fill');
        const patternDuration = Math.max(...sample.pattern.map(beat => beat.time)) + 1000;

        setTimeout(() => {
            infoProgressFill.style.transition = `width ${patternDuration}ms linear`;
            infoProgressFill.style.width = '100%';
        }, 100);
    }

    playRealAudioWithVisuals(sampleId) {
        const sample = this.sampleBeats[sampleId];
        const audioBuffer = this.audioFiles['singha-baja'];

        if (!audioBuffer) {
            console.warn('Audio file not loaded, falling back to synthesized pattern');
            this.playSynthesizedPattern(sampleId);
            return;
        }

        // Create audio source
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);

        // Store reference to stop later
        this.currentAudioFile = {
            source: source,
            gainNode: gainNode,
            startTime: this.audioContext.currentTime
        };

        // Start playing the real audio
        source.start(0);

        // Create sample info display
        this.createSampleProgressIndicator(
            document.querySelector(`[data-sample-id="${sampleId}"]`),
            audioBuffer.duration * 1000
        );
        this.showSampleInfo(sample);

        // Play visual pattern synchronized with real audio
        this.playVisualPatternWithAudio(sample);

        // Handle audio end
        source.onended = () => {
            if (this.currentSample === sampleId) {
                this.stopSample();
            }
        };

        // Update tempo display
        const tempoSlider = document.getElementById('tempoSlider');
        const tempoValue = document.getElementById('tempoValue');
        tempoSlider.value = sample.bpm;
        tempoValue.textContent = sample.bpm + ' BPM';
        this.currentTempo = sample.bpm;
    }
    playVisualPatternWithAudio(sample) {
        // Play visual interactions according to the pattern timing
        sample.pattern.forEach(beat => {
            setTimeout(() => {
                if (this.currentSample !== null) {
                    // Only show visual effects, don't play synthesized sounds
                    this.showVisualBeatOnly(beat.key, sample.name);
                }
            }, beat.time);
        });

        // Loop the visual pattern while audio is playing
        const patternDuration = Math.max(...sample.pattern.map(beat => beat.time)) + 1000;

        this.sampleInterval = setInterval(() => {
            if (this.currentSample !== null && this.currentAudioFile) {
                // Check if audio is still playing
                const elapsed = this.audioContext.currentTime - this.currentAudioFile.startTime;
                if (elapsed < this.currentAudioFile.source.buffer.duration) {
                    sample.pattern.forEach(beat => {
                        setTimeout(() => {
                            if (this.currentSample !== null) {
                                this.showVisualBeatOnly(beat.key, sample.name);
                            }
                        }, beat.time);
                    });
                }
            }
        }, patternDuration);
    }
    createSampleParticles(key, sampleName) {
        const pad = document.querySelector(`[data-key="${key}"]`);
        if (!pad) return;

        const rect = pad.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Create more particles for sample playback
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'sample-particle';
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '999';

            // Golden color for Sambalpuri sample
            if (sampleName.includes('Singha Baja')) {
                particle.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
                particle.style.boxShadow = '0 0 6px #FFD700';
            } else {
                particle.style.background = this.beatPads.find(p => p.key === key)?.color || '#fff';
            }

            const angle = (i / 8) * Math.PI * 2;
            const distance = 60 + Math.random() * 40;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            // Animate particle
            particle.style.transition = 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            particle.style.transform = `translate(${endX}px, ${endY}px) scale(0)`;
            particle.style.opacity = '0';

            document.body.appendChild(particle);

            // Trigger animation
            setTimeout(() => {
                particle.style.transform = `translate(${endX}px, ${endY}px) scale(1)`;
                particle.style.opacity = '1';
            }, 10);

            setTimeout(() => {
                particle.remove();
            }, 1500);
        }
    }

    showVisualBeatOnly(key, sampleName) {
        const pad = document.querySelector(`[data-key="${key}"]`);
        if (!pad) return;

        // Add visual feedback
        this.addActiveState(key);
        setTimeout(() => this.removeActiveState(key), 150);

        // Enhanced visual feedback for real audio playback
        this.highlightKeyForRealAudio(key, sampleName);

        // Update visualizer
        this.visualizerData.lastBeatTime = performance.now();

        // Create particles
        this.createSampleParticles(key, sampleName);
    }
    highlightKeyForRealAudio(key, sampleName) {
        const pad = document.querySelector(`[data-key="${key}"]`);
        if (!pad) return;

        // Add special real-audio class for different styling
        pad.classList.add('real-audio-active');

        // Create floating indicator
        const indicator = document.createElement('div');
        indicator.className = 'real-audio-indicator';
        indicator.textContent = '♪ LIVE AUDIO ♪';
        indicator.style.position = 'absolute';
        indicator.style.zIndex = '1000';
        indicator.style.background = 'linear-gradient(45deg, #FFD700, #FF6B35)';
        indicator.style.color = '#000';
        indicator.style.padding = '6px 12px';
        indicator.style.borderRadius = '6px';
        indicator.style.fontSize = '11px';
        indicator.style.fontWeight = 'bold';
        indicator.style.pointerEvents = 'none';
        indicator.style.transform = 'translate(-50%, -100%)';
        indicator.style.marginTop = '-8px';
        indicator.style.animation = 'realAudioPulse 0.5s ease-out';

        const rect = pad.getBoundingClientRect();
        indicator.style.left = (rect.left + rect.width / 2) + 'px';
        indicator.style.top = rect.top + 'px';

        document.body.appendChild(indicator);

        // Enhanced particle effect for real audio
        this.createRealAudioParticles(key);

        // Remove effects
        setTimeout(() => {
            pad.classList.remove('real-audio-active');
            indicator.remove();
        }, 500);
    }
    createRealAudioParticles(key) {
        const pad = document.querySelector(`[data-key="${key}"]`);
        if (!pad) return;

        const rect = pad.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Create more vibrant particles for real audio
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'real-audio-particle';
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '999';

            // Golden gradient for real audio
            particle.style.background = 'radial-gradient(circle, #FFD700, #FF6B35)';
            particle.style.boxShadow = '0 0 10px #FFD700';

            const angle = (i / 12) * Math.PI * 2;
            const distance = 80 + Math.random() * 60;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            // Enhanced animation for real audio
            particle.style.transition = 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            particle.style.transform = `translate(${endX}px, ${endY}px) scale(0) rotate(360deg)`;
            particle.style.opacity = '0';

            document.body.appendChild(particle);

            // Trigger animation
            setTimeout(() => {
                particle.style.transform = `translate(${endX}px, ${endY}px) scale(1.5) rotate(720deg)`;
                particle.style.opacity = '1';
            }, 20);

            setTimeout(() => {
                particle.remove();
            }, 2000);
        }
    }
    highlightKeyForSample(key, sampleName) {
        const pad = document.querySelector(`[data-key="${key}"]`);
        if (!pad) return;

        // Add special sample-playing class
        pad.classList.add('sample-active');

        // Create floating indicator showing which sample is playing
        const indicator = document.createElement('div');
        indicator.className = 'sample-key-indicator';
        indicator.textContent = `${sampleName}`;
        indicator.style.position = 'absolute';
        indicator.style.zIndex = '1000';
        indicator.style.background = 'rgba(255, 215, 0, 0.9)';
        indicator.style.color = '#000';
        indicator.style.padding = '4px 8px';
        indicator.style.borderRadius = '4px';
        indicator.style.fontSize = '10px';
        indicator.style.fontWeight = 'bold';
        indicator.style.pointerEvents = 'none';
        indicator.style.transform = 'translate(-50%, -100%)';
        indicator.style.marginTop = '-5px';

        const rect = pad.getBoundingClientRect();
        indicator.style.left = (rect.left + rect.width / 2) + 'px';
        indicator.style.top = rect.top + 'px';

        document.body.appendChild(indicator);

        // Enhanced particle effect for sample playback
        this.createSampleParticles(key, sampleName);

        // Remove indicator and sample-active class after a short time
        setTimeout(() => {
            pad.classList.remove('sample-active');
            indicator.remove();
        }, 400);
    }
    playSynthesizedPattern(sampleId) {
        const sample = this.sampleBeats[sampleId];
        const patternDuration = Math.max(...sample.pattern.map(beat => beat.time)) + 1000;

        this.createSampleProgressIndicator(
            document.querySelector(`[data-sample-id="${sampleId}"]`),
            patternDuration
        );
        this.showSampleInfo(sample);

        // Play synthesized pattern
        const playSamplePattern = () => {
            sample.pattern.forEach(beat => {
                setTimeout(() => {
                    if (this.currentSample === sampleId) {
                        this.playBeat(beat.key);
                        this.highlightKeyForSample(beat.key, sample.name);
                    }
                }, beat.time);
            });
        };

        playSamplePattern();

        this.sampleInterval = setInterval(() => {
            if (this.currentSample === sampleId) {
                playSamplePattern();
            }
        }, patternDuration);

        // Update tempo display
        const tempoSlider = document.getElementById('tempoSlider');
        const tempoValue = document.getElementById('tempoValue');
        tempoSlider.value = sample.bpm;
        tempoValue.textContent = sample.bpm + ' BPM';
        this.currentTempo = sample.bpm;
    }

    // stopSample() {
    //     if (this.currentSample !== null) {
    //         clearInterval(this.sampleInterval);
    //         this.sampleInterval = null;

    //         // Stop all long-duration sounds when stopping sample
    //         this.stopAllLongSounds();

    //         const sampleCard = document.querySelector(`[data-sample-id="${this.currentSample}"]`);
    //         if (sampleCard) {
    //             sampleCard.classList.remove('playing');
    //         }

    //         this.currentSample = null;
    //     }
    // }

    stopSample() {
        if (this.currentSample !== null) {
            clearInterval(this.sampleInterval);
            this.sampleInterval = null;

            // Stop real audio if playing
            if (this.currentAudioFile) {
                try {
                    this.currentAudioFile.source.stop();
                } catch (e) {
                    // Audio might already be stopped
                }
                this.currentAudioFile = null;
            }

            // Stop all long-duration sounds when stopping sample
            this.stopAllLongSounds();

            const sampleCard = document.querySelector(`[data-sample-id="${this.currentSample}"]`);
            if (sampleCard) {
                sampleCard.classList.remove('playing');

                // Remove progress bar
                const progressBar = sampleCard.querySelector('.sample-progress');
                if (progressBar) {
                    progressBar.remove();
                }
            }

            // Hide sample info
            const sampleInfo = document.getElementById('currentSampleInfo');
            if (sampleInfo) {
                sampleInfo.classList.remove('show');
                setTimeout(() => {
                    sampleInfo.remove();
                }, 300);
            }

            // Clean up visual elements
            document.querySelectorAll('.sample-key-indicator, .real-audio-indicator').forEach(indicator => {
                indicator.remove();
            });

            document.querySelectorAll('.beat-pad').forEach(pad => {
                pad.classList.remove('sample-active', 'real-audio-active');
            });

            this.currentSample = null;
        }
    }

    startPeriodicCleanup() {
        setInterval(() => {
            const now = Date.now();
            const expiredSounds = [];

            this.activeSounds.forEach((soundData, soundKey) => {
                if (now > soundData.stopTime) {
                    expiredSounds.push(soundKey);
                }
            });

            expiredSounds.forEach(soundKey => {
                this.activeSounds.delete(soundKey);
            });
        }, 1000); // Check every second
    }


    addActiveState(key) {
        const pad = document.querySelector(`[data-key="${key}"]`);
        if (pad) {
            pad.classList.add('active', 'triggered');
            setTimeout(() => pad.classList.remove('triggered'), 300);
        }
    }

    removeActiveState(key) {
        const pad = document.querySelector(`[data-key="${key}"]`);
        if (pad) {
            pad.classList.remove('active');
        }
    }

    showBeatIndicator(key) {
        const indicator = document.getElementById('beatIndicator');
        const pad = this.beatPads.find(p => p.key === key.toLowerCase());

        indicator.textContent = pad ? pad.name : key;
        indicator.style.color = pad ? pad.color : '#fff';
        indicator.classList.add('show');

        setTimeout(() => {
            indicator.classList.remove('show');
        }, 400);
    }



    updateFrequencyBars(currentTime) {
        if (!this.visualizerBars || this.visualizerBars.length === 0) return;

        const timeSinceLastBeat = currentTime - this.visualizerData.lastBeatTime;
        const beatDecay = Math.max(0, 1 - (timeSinceLastBeat / 3000));

        this.visualizerBars.forEach((bar, index) => {
            if (!bar) return;

            // Create wave patterns
            const baseFreq = 0.001 + (index * 0.0002);
            const wave1 = Math.sin(currentTime * baseFreq + index * 0.2) * 20;
            const wave2 = Math.cos(currentTime * baseFreq * 1.3 + index * 0.1) * 15;
            const noise = (Math.random() - 0.5) * 5 * beatDecay;

            // Frequency-based response simulation
            const freq = index / this.visualizerBars.length;
            let frequencyResponse = 1;

            if (freq < 0.3) { // Bass
                frequencyResponse = 1 + (beatDecay * 2);
            } else if (freq < 0.7) { // Mids
                frequencyResponse = 1 + (beatDecay * 1.5);
            } else { // Highs
                frequencyResponse = 1 + (beatDecay * 1.2);
            }

            // Calculate height
            let height = 8 + // Base height
                (wave1 * beatDecay * frequencyResponse) +
                (wave2 * beatDecay * frequencyResponse) +
                noise;

            // Smooth transitions
            const currentHeight = parseFloat(bar.style.height) || 8;
            height = currentHeight * 0.7 + height * 0.3; // Smooth interpolation

            // Clamp values
            height = Math.max(3, Math.min(85, height));

            bar.style.height = height + '%';
        });
    }

    updateWaveform(currentTime) {
        const canvas = document.getElementById('waveformCanvas');
        if (!canvas || !this.canvasContext) return;

        const ctx = this.canvasContext;
        const width = this.canvasWidth;
        const height = this.canvasHeight;

        const timeSinceLastBeat = currentTime - this.visualizerData.lastBeatTime;
        const beatDecay = Math.max(0, 1 - (timeSinceLastBeat / 2000));

        // Clear canvas with trail effect
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);

        if (beatDecay < 0.01) return;

        // Draw main waveform
        ctx.globalCompositeOperation = 'lighter';
        ctx.beginPath();
        ctx.strokeStyle = `rgba(64, 224, 208, ${beatDecay * 0.8})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const amplitude = height * 0.15 * beatDecay;
        const frequency = 0.02;
        const time = currentTime * 0.002;
        const centerY = height / 2;

        let firstPoint = true;

        for (let x = 0; x <= width; x += 2) {
            const progress = x / width;

            // Create complex waveform with multiple sine waves
            const wave1 = Math.sin(progress * Math.PI * 4 + time * 2) * 0.6;
            const wave2 = Math.sin(progress * Math.PI * 8 + time * 3) * 0.3;
            const wave3 = Math.sin(progress * Math.PI * 2 + time * 1.5) * 0.4;
            const noise = (Math.random() - 0.5) * 0.1 * beatDecay;

            const combinedWave = (wave1 + wave2 + wave3 + noise) * amplitude;
            const y = centerY + combinedWave;

            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw secondary waveform (higher frequency)
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 0, 128, ${beatDecay * 0.5})`;
        ctx.lineWidth = 1;

        firstPoint = true;

        for (let x = 0; x <= width; x += 3) {
            const progress = x / width;
            const wave = Math.cos(progress * Math.PI * 12 + time * 4) * 0.5;
            const y = centerY + wave * amplitude * 0.6;

            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw particle-like effects when beat is strong
        if (beatDecay > 0.3) {
            ctx.fillStyle = `rgba(255, 255, 255, ${beatDecay * 0.3})`;

            for (let i = 0; i < 8; i++) {
                const x = Math.random() * width;
                const y = centerY + (Math.random() - 0.5) * amplitude * 2;
                const size = Math.random() * 3 + 1;

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
    }

    drawWaveform() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'rgba(64, 224, 208, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        const amplitude = 50;
        const frequency = 0.02;
        const time = Date.now() * 0.005;

        for (let x = 0; x < this.canvas.width; x++) {
            const y = this.canvas.height / 2 + Math.sin(x * frequency + time) * amplitude * Math.random();
            if (x === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
    }

    createParticles(key) {
        const pad = document.querySelector(`[data-key="${key}"]`);
        if (!pad) return;

        const rect = pad.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.background = this.beatPads.find(p => p.key === key)?.color || '#fff';

            const angle = (i / 6) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;

            particle.style.setProperty('--end-x', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--end-y', Math.sin(angle) * distance + 'px');

            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 2000);
        }
    }

    updateStats(key) {
        const currentTime = Date.now();

        // Update beat count
        this.stats.totalBeats++;
        document.getElementById('beatsCount').textContent = this.stats.totalBeats;

        // Update combo
        if (currentTime - this.stats.lastBeatTime < 1000) {
            this.stats.combo++;
        } else {
            this.stats.combo = 1;
        }

        if (this.stats.combo > this.stats.maxCombo) {
            this.stats.maxCombo = this.stats.combo;
        }

        document.getElementById('combo').textContent = this.stats.combo;

        // Show combo indicator
        if (this.stats.combo > 1) {
            const comboIndicator = document.getElementById('comboIndicator');
            comboIndicator.textContent = `COMBO x${this.stats.combo}`;
            comboIndicator.classList.add('show');

            setTimeout(() => {
                comboIndicator.classList.remove('show');
            }, 1000);
        }

        // Update score
        this.stats.score += this.stats.combo * 10;
        document.getElementById('score').textContent = this.stats.score;

        // Track beat times for BPM calculation
        this.stats.beatTimes.push(currentTime);
        if (this.stats.beatTimes.length > 10) {
            this.stats.beatTimes.shift();
        }

        this.stats.lastBeatTime = currentTime;
    }

    startBPMCalculation() {
        setInterval(() => {
            if (this.stats.beatTimes.length >= 2) {
                const timeDiffs = [];
                for (let i = 1; i < this.stats.beatTimes.length; i++) {
                    timeDiffs.push(this.stats.beatTimes[i] - this.stats.beatTimes[i - 1]);
                }

                const avgTimeDiff = timeDiffs.reduce((a, b) => a + b) / timeDiffs.length;
                const bpm = Math.round(60000 / avgTimeDiff);

                if (bpm > 0 && bpm < 300) {
                    this.stats.bpm = bpm;
                    document.getElementById('bpm').textContent = bpm;
                }
            }
        }, 1000);
    }

    toggleRecording() {
        this.stopSample(); // Stop any playing sample when recording

        const recordBtn = document.getElementById('recordBtn');

        if (!this.isRecording) {
            this.isRecording = true;
            this.recordedLoop = [];
            this.recordStartTime = Date.now();
            recordBtn.textContent = '⏹️ Stop Recording';
            recordBtn.classList.add('recording');
        } else {
            this.isRecording = false;
            recordBtn.textContent = '🎙️ Record Loop';
            recordBtn.classList.remove('recording');
        }
    }

    playLoop() {
        if (this.recordedLoop.length === 0 || this.isLoopPlaying) return;

        this.isLoopPlaying = true;
        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = '⏸️ Pause Loop';

        const totalLoopTime = Math.max(...this.recordedLoop.map(beat => beat.relativeTime)) + 1000;

        const playRecordedBeats = () => {
            this.recordedLoop.forEach(beat => {
                setTimeout(() => {
                    if (this.isLoopPlaying) {
                        this.playBeat(beat.key);
                    }
                }, beat.relativeTime);
            });
        };

        playRecordedBeats();

        this.loopInterval = setInterval(() => {
            if (this.isLoopPlaying) {
                playRecordedBeats();
            }
        }, totalLoopTime);
    }

    stopLoop() {
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
            this.isLoopPlaying = false;

            // Stop all long-duration sounds when stopping loop
            this.stopAllLongSounds();

            document.getElementById('playBtn').textContent = '▶️ Play Loop';
        }
    }

    clearLoop() {
        this.stopLoop();
        this.recordedLoop = [];

        const recordBtn = document.getElementById('recordBtn');
        recordBtn.textContent = '🎙️ Record Loop';
        recordBtn.classList.remove('recording');
        this.isRecording = false;
    }

    panicStop() {
        // Stop all tracked long-duration sounds
        this.stopAllLongSounds();

        // Also stop any loops or samples
        this.stopLoop();
        this.stopSample();

        console.log('All sounds stopped');
    }

}

window.addEventListener('beforeunload', () => {
    if (game) {
        game.panicStop();
        game.stopVisualizer();

        // Clean up audio context
        if (game.audioContext && game.audioContext.state !== 'closed') {
            game.audioContext.close();
        }
    }
});


document.addEventListener('DOMContentLoaded', () => {
    game = new AdvancedBeatboxGame();
});
