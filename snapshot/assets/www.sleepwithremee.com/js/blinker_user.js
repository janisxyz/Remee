'use strict';
var
      GET_USER_INFO_URL = './json_user_info.php'
    , USER_LOGIN_URL = './json_user_login.php'
    , USER_LOGOUT_URL = './json_user_logout.php'
    , GO_SHORT_URL = 'http://remee.me'
    , SAVE_CONFIG_URL = './json_save_config.php'
    , DELETE_CONFIG_URL = './json_delete_config.php'
    , login_section = null
    , user_section = null
    , user_info = null;

$(function()
{
    'use strict';
    login_section = $('#user_info .login_section');
    user_section = $('#user_info .user_section');

    $('#user_info .login_section, #user_info .user_section').hide();

    $('#login_submit').button();
    $('#login_username').watermark('Username');
    $('#login_password').watermark('Password');
    $('#login_form').submit(login_form_submit);
    $('#save_config_submit').button();
    $('#save_config_name').watermark('New config name');
    $('#save_config_form').submit(save_config_submit);
    $('#saved_configs_select').menu();
    refresh_user_info();
});

function refresh_user_info()
{
    $.ajax({
        url: GET_USER_INFO_URL,
        dataType: 'json',
        success: function(data)
        {
            if (data['logged_in'])
            {
                user_info = {
                    'username': data['username'],
                    'configs': data['configs']
                };
                if (login_section.is(':visible'))
                {
                    login_section.hide('blind', function()
                    {
                        user_section.show('blind');
                    });
                }
                else if (!user_section.is(':visible'))
                {
                    user_section.show();
                }
                draw_user_info();
            }
            else
            {
                user_info = null;
                if (user_section.is(':visible'))
                {
                    user_section.hide('blind', function()
                    {
                        login_section.show('blind');
                    });
                }
                else if (!login_section.is(':visible'))
                {
                    login_section.show();
                }
                draw_login_ui();
            }
        }
    });
}

function draw_user_info()
{
    update_saved_config_select();
}

function update_saved_config_select()
{
    var   i
        , cstr = '';

    for (i in user_info['configs'])
    {
        cstr += '<li><a href="javascript:load_saved_config(\'' + user_info['configs'][i][1] + '\');return false;">' + user_info['configs'][i][0] + '</a>';
        cstr += '<a class="delete" href="javascript:delete_saved_config(\'' + user_info['configs'][i][0] + '\')">x</a></li>';
    }
    $('#saved_configs_options').html(cstr);
    $('#saved_configs_options').menu();
    $('#saved_configs_options').menu('refresh');
}

function draw_login_ui()
{
    var cstr = '';
}

function login_form_submit()
{
    $('#login_username, #login_password, #login_submit').attr('disabled', 'disabled');
    $('.errors', login_section).html('');
    $.ajax({
        url: USER_LOGIN_URL,
        type: 'POST',
        dataType: 'json',
        data: {
            'username': $('#login_username').val(),
            'password': $('#login_password').val()
        },
        success: function(data)
        {
            if (data['success'])
            {
                refresh_user_info();
            }
            else
            {
                $('#login_password').val('');
                $('.errors', login_section).html('Could not log in with that username and password.');
                console.log('Failed login');
            }
        },
        error: function(jqXHR, textStatus, errorThrown)
        {
            console.log(jqXHR, textStatus, errorThrown);
        },
        complete: function(jqXHR, textStatus)
        {
            $('#login_username, #login_password, #login_submit').removeAttr('disabled');
        }
    });
    return false;
}

function user_logout()
{
    $.ajax({
        url: USER_LOGOUT_URL,
        dataType: 'json',
        success: function(data)
        {
            if (data['success'])
            {
                refresh_user_info();
            }
        }
    });
    refresh_user_info();
}

function save_config_submit()
{
    $('#save_config_submit, #save_config_name').attr('disabled', 'disabled');
    $('.errors', user_section).html('');
    update_blinker_config();
    $.ajax({
        url: SAVE_CONFIG_URL,
        dataType: 'json',
        data: {
            'name': $('#save_config_name').val(),
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
                refresh_user_info();
            }
            else
            {
                $('.errors', user_section).html('Could not save config.');
                console.log('Failed config save');
            }
        },
        error: function(jqXHR, textStatus, errorThrown)
        {
            console.log(jqXHR, textStatus, errorThrown);
        },
        complete: function(jqXHR, textStatus)
        {
            $('#save_config_submit, #save_config_name').removeAttr('disabled');
            $('#save_config_name').val('');
        }
    });
    return false;
}

function delete_saved_config(name)
{
    $('.errors', user_section).html('');
    $.ajax({
        url: DELETE_CONFIG_URL,
        dataType: 'json',
        data: {
            'name': name
        },
        success: function(data)
        {
            if (data['success'])
            {
                refresh_user_info();
            }
            else
            {
                $('.errors', user_section).html('Could not delete config.');
                console.log('Failed config delete');
            }
        },
        error: function(jqXHR, textStatus, errorThrown)
        {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
    return false;
}

function load_saved_config(id)
{
    window.location = GO_SHORT_URL + '/' + id;
    return false;
}
