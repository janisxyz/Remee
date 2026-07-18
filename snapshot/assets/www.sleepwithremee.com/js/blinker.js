'use strict';

var Remee = (function()
{
    return {
        Blinker: function()
        {
            this.demo_mode = false;
            this.initial_delay = (4.5 * 60)|0
            this.nap_delay = 20;
            this.signal_interval = 10;
            this.signal_wiggle = 0;
            this.brightness_low = 0.20;
            this.brightness_mid = 0.40;
            this.brightness_high = 0.70;
            this.brightness_ramping = false;
            this.signals = [
                  { id: 3, loops: 1, fast: true }
                , { id: 10, loops: 3, fast: true }
                , { id: 3, loops: 1, fast: true }
            ];
        },
        get_bit_str: function(val, len)
        {
            var str = Math.round(val).toString(2);
            while (str.length < len)
            {
                str = '0' + str;
            }
            return str.substr(-len);
        },
        clamp: function(v, r)
        {
            return Math.min(r[1], Math.max(r[0], v));
        },
        range: function(v, r)
        {
            return (this.clamp(v, r) - r[0]) / (r[1] - r[0]);
        }
    };
}());

Remee.Blinker.prototype.INITIAL_DELAY_RANGE = [150, 450];
Remee.Blinker.prototype.NAP_DELAY_RANGE = [10, 85];
Remee.Blinker.prototype.SIGNAL_INTERVAL_RANGE = [1, 31];
Remee.Blinker.prototype.BRIGHTNESS_RANGE = [0.05, 1.0];
Remee.Blinker.prototype.HANDSHAKE = '11010010';
Remee.Blinker.prototype.MAX_PATTERN_LOOPS = 4;
Remee.Blinker.prototype.MAX_WIGGLE = 2;
Remee.Blinker.prototype.PATTERNS = [
      'None'
    , 'Sweep Left'
    , 'Sweep Right'
    , 'Sweep Bounce'
    , 'Glow Left'
    , 'Glow Right'
    , 'Sparkle'
    , 'Alt Blink'
    , 'Outside In'
    , 'Split Bounce'
    , 'Glow Alt'
    // , 'Random'
];

Remee.Blinker.prototype.sequence = function()
{
    var   elements = [
              [this.initial_delay === null ? 0 : (Remee.range(this.initial_delay, this.INITIAL_DELAY_RANGE) * 30) + 1, 5]
            , [this.signal_interval === null ? 0 : Remee.clamp(this.signal_interval, this.SIGNAL_INTERVAL_RANGE), 5]
            , [this.nap_delay === null ? 0 : (Remee.range(this.nap_delay, this.NAP_DELAY_RANGE) * 30) + 1, 5]
            , [this.demo_mode === null ? 0 : Remee.clamp(this.demo_mode, [0, 1]), 1]
            , [this.brightness_low === null ? 0 : (Remee.range(this.brightness_low, this.BRIGHTNESS_RANGE) * 19) + 1, 5]
            , [this.brightness_mid === null ? 0 : (Remee.range(this.brightness_mid, this.BRIGHTNESS_RANGE) * 19) + 1, 5]
            , [this.brightness_high === null ? 0 : (Remee.range(this.brightness_high, this.BRIGHTNESS_RANGE) * 19) + 1, 5]
            , [this.brightness_ramping === null ? 0 : (!Remee.clamp(this.brightness_ramping, [0, 1])) + 1, 2]
            , [this.signals[0].id === null ? 15 : Remee.clamp(this.signals[0].id, [0, 14]), 4]
            , [this.signals[0].fast === null ? 0 : Remee.clamp(this.signals[0].fast, [0, 1]), 1]
            , [this.signals[0].loops === null ? 0 : Remee.clamp(this.signals[0].loops, [1, this.MAX_PATTERN_LOOPS]) - 1, 2]
            , [this.signals[1].id === null ? 15 : Remee.clamp(this.signals[1].id, [0, 14]), 4]
            , [this.signals[1].fast === null ? 0 : Remee.clamp(this.signals[1].fast, [0, 1]), 1]
            , [this.signals[1].loops === null ? 0 : Remee.clamp(this.signals[1].loops, [1, this.MAX_PATTERN_LOOPS]) - 1, 2]
            , [this.signals[2].id === null ? 15 : Remee.clamp(this.signals[2].id, [0, 14]), 4]
            , [this.signals[2].fast === null ? 0 : Remee.clamp(this.signals[2].fast, [0, 1]), 1]
            , [this.signals[2].loops === null ? 0 : Remee.clamp(this.signals[2].loops, [1, this.MAX_PATTERN_LOOPS]) - 1, 2]
            , [this.signal_wiggle === null ? 0 : Remee.clamp(this.signal_wiggle, [0, this.MAX_WIGGLE]) + 1, 2]
        ]
        , encoding = ''
        , checksum = ''
        , byte_sum = 0
        , byte_sums = [0, 0, 0, 0, 0, 0, 0]
        , i, j;

    // Encoding
    for (i = 0; i < elements.length; i++)
    {
        encoding += Remee.get_bit_str(elements[i][0], elements[i][1]);
    }


    // Checksum
    for (i = 0; i < 7; i++)
    {
        for (j = 0; j < 8; j++)
        {
            if (encoding[(i * 8) + j] === '1')
            {
                byte_sums[i] += Math.pow(2, 7 - j);
            }
        }
    }

    byte_sum = byte_sums[0];
    for (i = 1; i < 7; i++)
    {
        byte_sum ^= byte_sums[i];
    }

    checksum = Remee.get_bit_str(byte_sum, 8);

    console.log('Handshake: ' + this.HANDSHAKE)
    console.log('Sequence:  ' + encoding);
    console.log('Checksum:  ' + checksum);

    return this.HANDSHAKE + encoding + checksum;
};
