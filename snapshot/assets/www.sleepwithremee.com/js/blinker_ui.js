'use strict';

var
    // Remee Blinker instance
      Blinker = new Remee.Blinker()

    , BLINK_START_DELAY = 4400
    , BLINK_STEP_1_DELAY = 65
    , BLINK_STEP_2_DELAY = 60
    , FINISH_BLINK_DELAY = 2000
    , GET_SHORT_URL = './get_short_url.php'

    // globals
    , sequence
    , sequence_index
    , sequence_timer = null
    , blinker_clock
    , blinker_data;

$(function()
{
    var   params, param
        , i, j, idx;

    // Add pattern and loop selections to pattern sections
    for (i = 1; i <= Blinker.MAX_PATTERN_LOOPS; i++)
    {
        $('select.loop_select').append($('<option value="' + i + '">' + i + '</option>'));
    }
    for (i = 0; i < Blinker.PATTERNS.length; i++)
    {
        $('select.pattern_select').append($('<option value="' + i + '">' + Blinker.PATTERNS[i] + '</option>'));
    }
    for (i = 1; i < Blinker.PATTERNS.length - 1; i++)
    {
        (new Image()).src = './img/' + i + 'f.gif';
        (new Image()).src = './img/' + i + 's.gif';
    }

    // Hide config sections
    var hide_containers = ['initial_delay', 'nap_delay', 'signal_interval', 'brightness', 'signal_0', 'signal_1', 'signal_2'];

    params = [
          ['id', 'initial_delay']
        , ['nd', 'nap_delay']
        , ['si', 'signal_interval']
        , ['sw', 'signal_wiggle', 'signal_interval']
        , ['bl', 'brightness_low', 'brightness']
        , ['bm', 'brightness_mid', 'brightness']
        , ['bh', 'brightness_high', 'brightness']
        , ['br', 'brightness_ramping', 'brightness']
        , ['dm', 'demo_mode']
    ];
    for (i in params)
    {
        param = get_url_parameter(params[i][0]);
        if (param !== null && param !== 'null')
        {
            Blinker[params[i][1]] = parseFloat(param);
            idx = hide_containers.indexOf(params[i][params[i].length - 1]);
            if (idx > -1)
            {
                hide_containers.splice(idx, 1);
            }
        }
    }
    params = [
          ['i', 'id']
        , ['l', 'loops']
        , ['f', 'fast']
    ]
    for (i = 0; i < 3; i++)
    {
        for (j in params)
        {
            param = get_url_parameter('s' + i + params[j][0]);
            if (param !== null && param !== "null")
            {
                Blinker.signals[i][params[j][1]] = parseFloat(param);
                idx = hide_containers.indexOf('signal_' + i);
                if (idx > -1)
                {
                    hide_containers.splice(idx, 1);
                }
            }
        }
    }

    for (i in hide_containers)
    {
        $('#' + hide_containers[i]).hide();
    }

    // Initialize form input helpers
    $('button').button();
    $('#configs_select').menu();
    for (i = 0; i < 3; i++)
    {
        var onSelected = (function(idx) { return function(data) { refresh_signal_value(idx); } })(i);
        $('#signal_' + i + ' .pattern_select').dumbselect({
            width: 180,
            onSelected: onSelected
        });
        $('#signal_' + i + ' .loop_select').dumbselect({
            width: 50,
            onSelected: onSelected
        });
    }

    $('#blinker_info .countdown').hide();
    $('#blinker_info .post_message').hide();

    // Init form elements
    reset_all();
    blinker_clock = $('#blinker_clock');
    blinker_data = $('#blinker_data');

    $('#short_url_text').hide();
    $('#short_url_button').click(get_short_url);
    $('#update_button').click(start_blink);
});

function reset_all()
{
    reset_initial_delay();
    reset_nap_delay();
    reset_signal_interval();
    reset_brightness();
    reset_signal(0);
    reset_signal(1);
    reset_signal(2);
    refresh_values();
}

function refresh_values()
{
    refresh_initial_delay_value();
    refresh_nap_delay_value();
    refresh_signal_interval_value();
    refresh_brightness_value();
    refresh_signal_value(0);
    refresh_signal_value(1);
    refresh_signal_value(2);
}


function reset_initial_delay()
{
    $('#initial_delay_slider').slider({
        value: Blinker.initial_delay,
        range: 'min', step: 10,
        min: Blinker.INITIAL_DELAY_RANGE[0], max: Blinker.INITIAL_DELAY_RANGE[1],
        slide: on_initial_delay_slide,
        create: refresh_initial_delay_value
    });
}
function on_initial_delay_slide(e, o)
{
    $('#initial_delay_value').html(minutes_to_value_str(o.value));
}
function refresh_initial_delay_value()
{
    $('#initial_delay_value').html(minutes_to_value_str($('#initial_delay_slider').slider('value')));
    $('#short_url_text').hide('blind');
}

function reset_nap_delay()
{
    $('#nap_delay_slider').slider({
        value: Blinker.nap_delay,
        range: 'min', step: 2.5,
        min: Blinker.NAP_DELAY_RANGE[0], max: Blinker.NAP_DELAY_RANGE[1],
        slide: on_nap_delay_slide
    });
}
function on_nap_delay_slide(e, o)
{
    $('#nap_delay_value').html(minutes_to_value_str(o.value));
}
function refresh_nap_delay_value()
{
    $('#nap_delay_value').html(minutes_to_value_str($('#nap_delay_slider').slider('value')));
    $('#short_url_text').hide('blind');
}

function reset_signal_interval()
{
    $('#signal_interval_slider').slider({
        value: Blinker.signal_interval,
        range: 'min', step: 1,
        min: Blinker.SIGNAL_INTERVAL_RANGE[0], max: Blinker.SIGNAL_INTERVAL_RANGE[1],
        slide: on_signal_interval_slide
    });
    $('#signal_wiggle_off_radio').prop('checked', Blinker.signal_wiggle === 0);
    $('#signal_wiggle_light_radio').prop('checked', Blinker.signal_wiggle === 1);
    $('#signal_wiggle_heavy_radio').prop('checked', Blinker.signal_wiggle === 2);
    $('#signal_wiggle_off_radio').change(refresh_signal_interval_value);
    $('#signal_wiggle_light_radio').change(refresh_signal_interval_value);
    $('#signal_wiggle_heavy_radio').change(refresh_signal_interval_value);
}
function on_signal_interval_slide(e, o)
{
    $('#signal_interval_value').html(minutes_to_value_str(o.value));
}
function refresh_signal_interval_value()
{
    var   str;

    $('#signal_interval_value').html(minutes_to_value_str($('#signal_interval_slider').slider('value')));

    str = 'Off';
    if ($('#signal_wiggle_light_radio').prop('checked'))
    {
        str = 'Light';
    }
    else if ($('#signal_wiggle_heavy_radio').prop('checked'))
    {
        str = 'Heavy';
    }
    $('#signal_wiggle_value').html(str);
    $('#short_url_text').hide('blind');
}

function reset_brightness()
{
    var   names = ['low', 'mid', 'high']
        , i;

    for (i in names)
    {
        $('#brightness_' + names[i] + '_slider').slider({
            value: Blinker['brightness_' + names[i]] * 100,
            range: 'min', step: 5,
            min: Blinker.BRIGHTNESS_RANGE[0] * 100, max: Blinker.BRIGHTNESS_RANGE[1] * 100,
            slide: (function(name) { return function(e, o) { on_brightness_slide(e, o, name); }})(names[i])
        });
    }
    $('#brightness_ramping_off_radio').prop('checked', !Blinker.brightness_ramping);
    $('#brightness_ramping_on_radio').prop('checked', Blinker.brightness_ramping);
    $('#brightness_ramping_off_radio').change(refresh_brightness_value);
    $('#brightness_ramping_on_radio').change(refresh_brightness_value);
}
function on_brightness_slide(e, o, name)
{
    $('#brightness_' + name + '_value').html(o.value + '%');
}
function refresh_brightness_value()
{
    var  str;

    $('#brightness_low_value').html($('#brightness_low_slider').slider('value') + '%');
    $('#brightness_mid_value').html($('#brightness_mid_slider').slider('value') + '%');
    $('#brightness_high_value').html($('#brightness_high_slider').slider('value') + '%');

    str = $('#brightness_ramping_on_radio').prop('checked') ? 'On' : 'Off';
    $('#brightness_ramping_value').html(str);
    $('#short_url_text').hide('blind');
}

function reset_signal(i)
{
    var   p = '#signal_' + i
        , f = function() { refresh_signal_value(i); };

    $(p + '_pattern_select').dumbselect('select', { id: Blinker.signals[i].id });
    $(p + '_speed_slow_radio').prop('checked', !Blinker.signals[i].fast);
    $(p + '_speed_fast_radio').prop('checked', Blinker.signals[i].fast);
    $(p + '_loops_select').dumbselect('select', { id: Blinker.signals[i].loops });
    $(p + '_pattern_select').change(f);
    $(p + '_speed_slow_radio').change(f);
    $(p + '_speed_fast_radio').change(f);
    $(p + '_loops_select').change(f);
}
function refresh_signal_value(i)
{
    var   p = '#signal_' + i
        , id, fast, loops
        , str;

    if ($(p + '_loops_select').data('dumbselect') === undefined)
    {
        return;
    }

    id = $(p + '_pattern_select').data('dumbselect').selectedData.value
    fast = $(p + '_speed_fast_radio').prop('checked')
    loops = $(p + '_loops_select').data('dumbselect').selectedData.value
    str = Blinker.PATTERNS[id];

    if (id > 0)
    {
        $(p + '_pattern_options').show();
        $(p + '_pattern_image').show();
        // str += fast ? ' (fast)' : ' (slow)';
        str += ' x ' + loops;
        $(p + '_image').attr('src', './img/' + id + (fast ? 'f' : 's') + '.gif');
    }
    else
    {
        $(p + '_pattern_options').hide();
        $(p + '_pattern_image').hide();
    }
    $(p + '_value').html(str);
    $('#short_url_text').hide('blind');
}

function add_config(section_name)
{
    var   d = $('#' + section_name);

    if (!d.is(':visible'))
    {
        $('#configs_select').menu('collapseAll')
        $('#configs').append(d);
        d.show('blind', { easing: 'easeInQuad', direction: 'down' }, 600, function()
            {
                $('html, body').animate(
                    {
                        scrollTop: d.position().top
                    },
                    600,
                    "easeOutQuint"
                );
            });
        $('#' + section_name + '_add').addClass('ui-state-disabled');
    }
}

function remove_config(section_name)
{
    var   d = $('#' + section_name);

    if (d.is(':visible'))
    {
        d.hide('blind', { easing: 'easeOutQuad', direction: 'up' }, 600);
        $('#' + section_name + '_add').removeClass('ui-state-disabled');
    }
}

function update_blinker_config()
{
    var   i
        , p;

    Blinker.initial_delay = $('#initial_delay').is(':visible') ? $('#initial_delay_slider').slider('value') : null;
    Blinker.nap_delay = $('#nap_delay').is(':visible') ? $('#nap_delay_slider').slider('value') : null;
    if ($('#signal_interval').is(':visible'))
    {
        Blinker.signal_interval = $('#signal_interval_slider').slider('value');
        Blinker.signal_wiggle = $('input[name="signal_wiggle"]:checked').val()|0;
    }
    else
    {
        Blinker.signal_interval = null;
        Blinker.signal_wiggle = null;
    }
    if ($('#brightness').is(':visible'))
    {
        Blinker.brightness_low = $('#brightness_low_slider').slider('value') / 100;
        Blinker.brightness_mid = $('#brightness_mid_slider').slider('value') / 100;
        Blinker.brightness_high = $('#brightness_high_slider').slider('value') / 100;
        Blinker.brightness_ramping = $('#brightness_ramping_on_radio').is(':checked');
    }
    else
    {
        Blinker.brightness_low = null;
        Blinker.brightness_mid = null;
        Blinker.brightness_high = null;
        Blinker.brightness_ramping = null;
    }
    for (i = 0; i < 3; i++)
    {
        p = '#signal_' + i;
        if ($(p).is(':visible'))
        {
            Blinker.signals[i].id = $(p + '_pattern_select').data('dumbselect').selectedData.value|0;
            Blinker.signals[i].loops = $(p + '_loops_select').data('dumbselect').selectedData.value|0;
            Blinker.signals[i].fast = $(p + '_speed_fast_radio').is(':checked');
        }
        else
        {
            Blinker.signals[i].id = null;
        }
    }
}


function start_blink()
{
    
    



    $('#blinker_clock').animate({ opacity: 1 }, 800);
    $('#blinker_data').animate({ opacity: 1 }, 800);
    $('#blinker_info .message').fadeOut();
    blinker_data.css('background', '#fff');
    blinker_clock.css('background', '#000');
    $('html, body').animate(
        {
            scrollTop: $('#blinker').position().top
        },
        600,
        'easeOutQuint'
    );
    $('#blinker_clock, #blinker_data').css('position', 'relative').fadeIn();
    $('#tint_overlay').width($(window).width()).height($(window).height()).animate(
        {
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
        },
        600,
        'linear',
        function()
        {
            $('#blinker_info .countdown').css('zIndex', 101).fadeIn();
            $('#blinker_info .countdown .bar .inner').width('100%').animate(
                {
                    width: '0%'
                },
                3500,
                'linear'
            );
        }
    );

    update_blinker_config();
    sequence = Blinker.sequence();
    sequence_index = 0;

    if (sequence_timer !== null)
    {
        clearInterval(sequence_timer);
    }

    sequence_timer = setTimeout(blink_next_in_sequence_step_1, BLINK_START_DELAY);
}

function blink_next_in_sequence_step_1()
{
    blinker_data.css('background', sequence.charAt(sequence_index) === '0' ? '#000' : '#fff');
    sequence_timer = setTimeout(blink_next_in_sequence_step_2, BLINK_STEP_1_DELAY);
}

function blink_next_in_sequence_step_2()
{
    blinker_clock.css('background', sequence_index % 2 ? '#000' : '#fff');

    sequence_index++;
    if (sequence_index < sequence.length)
    {
        sequence_timer = setTimeout(blink_next_in_sequence_step_1, BLINK_STEP_2_DELAY);
    }
    else
    {
        finish_blink();
    }
}

function finish_blink()
{
    sequence_timer = null;
//    blinker_clock.css('background', '#fff');
    $('#blinker_clock, #blinker_data').css('position', 'static').fadeOut();
    $('#blinker_info .countdown').fadeOut(
        400,
        function()
        {
            $('#blinker_info .countdown').css('zIndex', 'inherit');
            $('#blinker_info .post_message').fadeIn();
            $('#tint_overlay').animate(
                {
                    backgroundColor: 'rgba(0, 0, 0, 0.0)'
                },
                800,
                'linear',
                function()
                {
                    $('#tint_overlay').width(0).height(0);
                }
            );
        }
    );
}

function minutes_to_value_str(total_minutes)
{
    var hours, minutes, str = '';
    hours = (total_minutes / 60)|0;
    minutes = (total_minutes - (hours * 60))|0;

    if (hours > 0)
    {
        str = hours + 'hr ';
    }

    if (minutes < 10)
    {
        minutes = '0' + minutes;
    }
    str += minutes + 'min';

    return str;
}

function get_url_parameter(name)
{
    return decodeURIComponent(
        (location.search.match(RegExp("[?&]"+name+"=([^&]*)"))||[,null])[1]
    );
}

function get_short_url()
{
    update_blinker_config();
    $.ajax({
        url: GET_SHORT_URL,
        dataType: 'json',
        data: {
            'id': Blinker.initial_delay,
            'nd': Blinker.nap_delay,
            'si': Blinker.signal_interval,
            'sw': Blinker.signal_wiggle,
            'bl': Blinker.brightness_low,
            'bm': Blinker.brightness_mid,
            'bh': Blinker.brightness_high,
            'br': Blinker.brightness_ramping,
            's0i': Blinker.signals[0].id,
            's0l': Blinker.signals[0].loops,
            's0f': Blinker.signals[0].fast,
            's1i': Blinker.signals[1].id,
            's1l': Blinker.signals[1].loops,
            's1f': Blinker.signals[1].fast,
            's2i': Blinker.signals[2].id,
            's2l': Blinker.signals[2].loops,
            's2f': Blinker.signals[2].fast
        },
        success: function(data)
        {
            if (data['success'])
            {
                $('#short_url_text').val(data.url).show('blind');
            }
            else
            {
                $('#short_url_text').hide('blind');
            }
        },
        error: function(jqXHR, textStatus, errorThrown)
        {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
}
