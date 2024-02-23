/* Simplified sample codec properties */
const codecs = { 
    audioInCodecSamplingRate: {
        0: 8000,
        1: 8000,
        2: 16000,
        3: 16000
    },

    audioOutCodecProperties: {
        0: {
            compression: 16,
            bandwidth: null,
            isStereo: true
        },
        1: {
            compression: 8,
            bandwidth: null,
            isStereo: true
        },
        2: {
            compression: 4,
            bandwidth: null,
            isStereo: true
        },
        3: {
            compression: 8,
            bandwidth: null,
            isStereo: true
        },
        4: {
            compression: null,
            bandwidth: 8,
            isStereo: true
        },
        5: {
            compression: null,
            bandwidth: 6,
            isStereo: true
        },
        6: {
            compression: null,
            bandwidth: 13.3,
            isStereo: false
        },
        7: {
            compression: null,
            bandwidth: 8,
            isStereo: false
        },
    },

    tpInBandwidth: {
        ctp: {
            0: 2000,
            1: 2000,
            2: 2000,
            3: 6000,
            4: 6000,
        },
        video: 400,
        audio: 64,
        resolutionMultiplier: {
            1: 2,
            0: 1
        }
    },

    storageBandwidth: {
        0: 384,
        1: 512,
        2: 768,
        3: 1024,
        4: 1500,
        5: 2048
    },

    codecRanking: {
        mostEfficient: {
            audio: 5, video: 1, tp: 1
        },
        highestQuality: {
            audio: 0, video: 0, tp: 0
        }
    }
}