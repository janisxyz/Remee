<script>console.log(null);</script><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
    <head>
        <title>Remee Customization App</title>
        <link rel="stylesheet" type="text/css" href="../fonts.googleapis.com/css.184f77828f.css">
        <link rel="stylesheet" type="text/css" href="css/custom-theme/jquery-ui-1.9.0.custom.css">
        <link rel="stylesheet" type="text/css" href="css/jquery.dumbselect.css">
        <link rel="stylesheet" type="text/css" href="css/toggle-switch.css">
        <link rel="stylesheet" type="text/css" href="css/base.css">
        <link rel="shortcut icon" href="favicon.png">
                <script type="text/javascript" src="js/jquery-1.9.1.js"></script>
        <script type="text/javascript" src="js/jquery-ui-1.10.1.custom.js"></script>
        <script type="text/javascript" src="js/jquery.dumbselect.js"></script>
        <script type="text/javascript" src="js/jquery.watermark.js"></script>
                    <script type="text/javascript" src="js/blinker.js"></script>
                    <script type="text/javascript" src="js/blinker_ui.js"></script>
                    <script type="text/javascript" src="js/blinker_user.js"></script>
                    <script type="text/javascript" src="js/jquery.ui.touch-punch.min.js"></script>
            </head>
    <body>


<script type="text/javascript">
	var lastUrl = document.referrer;
	console.log("hi")
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-32776075-1']);
    _gaq.push(['_trackPageview']);

    (function()
    {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[2]; s.parentNode.insertBefore(ga, s);
    })();
    
    function switchcolor(set, choice){
    
    switch(set)
{
case "wiggle":
document.getElementById("signal_wiggle_off_radio_label").style.color = "#444";
document.getElementById("signal_wiggle_heavy_radio_label").style.color = "#444";
document.getElementById("signal_wiggle_light_radio_label").style.color = "#444";
document.getElementById(choice).style.color = "white";
break;

case "ramping":
document.getElementById("brightness_ramping_on_radio_label").style.color = "#444";
document.getElementById("brightness_ramping_off_radio_label").style.color = "#444";
document.getElementById(choice).style.color = "white";
break; 

case "pattern0":
document.getElementById("signal_0_speed_fast_radio_label").style.color = "#444";
document.getElementById("signal_0_speed_slow_radio_label").style.color = "#444";
document.getElementById(choice).style.color = "white";
break;

case "pattern1":
document.getElementById("signal_1_speed_fast_radio_label").style.color = "#444";
document.getElementById("signal_1_speed_slow_radio_label").style.color = "#444";
document.getElementById(choice).style.color = "white";
break;

case "pattern2":
document.getElementById("signal_2_speed_fast_radio_label").style.color = "#444";
document.getElementById("signal_2_speed_slow_radio_label").style.color = "#444";
document.getElementById(choice).style.color = "white";
break;

default:
break;

} 

    
}
    
    
    
</script>
<div id="rotator"><center><p style="width:75%;color:#fff;font-size:64px;font-weight:600;margin-top:300px;">Please rotate your device to landscape mode to use this app.</p><img src="../img/rotate.png"></center></div>
<div id="tint_overlay"></div>

<div class="section">
    <div class="header">
        <div class="label">
            Customize your dream signal
        </div>
    </div>
    <div id="configs" class="content">

        <!-- INITIAL DELAY -->
        <div id="initial_delay" class="config">
            <div class="cancel">
                <a href="#" onclick="remove_config('initial_delay')"><img src="img/close.png"></a>
            </div>
            <div class="content">
                <div class="section">
                    <div class="header">
                        <div class="label">
                            Initial Delay<br>
                            <span class="description">Delay before Remee starts showing patterns</span>
                        </div>
                        <div id="initial_delay_value" class="value">
                            3h 30m
                        </div>
                    </div>
                    <div class="options">
                        <div class="label">2h 30m</div>
                        <div id="initial_delay_slider"></div>
                        <div class="label">7h 30m</div>
                    </div>
               </div>
            </div>
        </div>

        <!-- NAP DELAY -->
        <div id="nap_delay" class="config">
            <div class="cancel">
                <a href="#" onclick="remove_config('nap_delay')"><img src="img/close.png"></a>
            </div>
            <div class="content">
                <div class="section">
                    <div class="header">
                        <div class="label">
                            Nap Delay<br>
                            <span class="description">A shorter initial delay for naps</span>
                        </div>
                        <div id="nap_delay_value" class="value">
                            30m
                        </div>
                    </div>
                   <div class="options">
                        <div class="label">10m</div>
                        <div id="nap_delay_slider"></div>
                        <div class="label">1h 25m</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SIGNAL INTERVAL -->
        <div id="signal_interval" class="config">
            <div class="cancel">
                <a href="#" onclick="remove_config('signal_interval')"><img src="img/close.png"></a>
            </div>
            <div class="content">
                <div class="section">
                    <div class="header">
                        <div class="label">
                            Signal Interval<br>
                            <span class="description">How long Remee waits between signals</span>
                        </div>
                        <div id="signal_interval_value" class="value">
                           10m
                        </div>
                    </div>
                    <div class="options">
                        <div class="label">1m</div>
                        <div id="signal_interval_slider"></div>
                        <div class="label">31m</div>
                    </div>
                </div>
               <!--   <div class="section">  -->
                <div class="section offset_section">
                    <div class="header">
                        <div class="label">
                            Wiggle<br>
                            <span class="description">Adds random deviation to the signal interval</span>
                        </div>
                        <div id="signal_wiggle_value" class="value">
                            Off
                        </div>
                    </div>
                    <div style="width:200px;"> <!-- mine -->
                    <div class="options switch switch-three switch-remee">
                        <input id="signal_wiggle_off_radio" name="signal_wiggle" type="radio" value="0" checked="checked" onclick="switchcolor('wiggle', 'signal_wiggle_off_radio_label')"><label id="signal_wiggle_off_radio_label" for="signal_wiggle_off_radio" style="color:white;">Off</label>
                        <input id="signal_wiggle_light_radio" name="signal_wiggle" type="radio" value="1" onclick="switchcolor('wiggle', 'signal_wiggle_light_radio_label')" ><label id="signal_wiggle_light_radio_label" for="signal_wiggle_light_radio">Light</label>
                        <input id="signal_wiggle_heavy_radio" name="signal_wiggle" type="radio" value="2" onclick="switchcolor('wiggle', 'signal_wiggle_heavy_radio_label')"><label id="signal_wiggle_heavy_radio_label" for="signal_wiggle_heavy_radio">Heavy</label>
                        <span class="slide-button"></span>
                    </div>
                    </div>	<!-- mine -->
                </div>
            </div>
        </div>

        <!-- BRIGHTNESS -->
        <div id="brightness" class="config">
            <div class="cancel">
                <a href="#" onclick="remove_config('brightness')"><img src="img/close.png"></a>
            </div>
            <div class="content">
                <div class="section">
                    <div class="header">
                        <div class="label">
                            Brightness Levels<br>
                            <span class="description">Set three levels for Remee's lights.</span>
                        </div>
                    </div>
                    <div class="options">
                        <div class="label">Low</div>
                        <div id="brightness_low_slider"></div>
                        <div id="brightness_low_value" class="value">20%</div>
                    </div>
                    <div class="options">
                        <div class="label">Mid</div>
                        <div id="brightness_mid_slider"></div>
                        <div id="brightness_mid_value" class="value">40%</div>
                    </div>
                    <div class="options">
                        <div class="label">High</div>
                        <div id="brightness_high_slider"></div>
                        <div id="brightness_high_value" class="value">70%</div>
                    </div>
                </div>
                <div class="section offset_section">
                    <div class="header">
                        <div class="label">
                            Brightness Ramping<br>
                            <span class="description">Slowly increases brightness through the night.</span>
                        </div>
                        <div id="brightness_ramping_value" class="value">
                            Off
                        </div>
                    </div>
                    <div style="width:120px;"> <!-- mine -->
                    <div class="options switch switch-remee">
                        <input id="brightness_ramping_off_radio" name="brightness_ramping" type="radio" value="0" checked="checked" onclick="switchcolor('ramping', 'brightness_ramping_off_radio_label')">
                        <label for="brightness_ramping_off_radio" id="brightness_ramping_off_radio_label" style="color:white;">Off</label>
                        <input id="brightness_ramping_on_radio" name="brightness_ramping" type="radio" value="1" onclick="switchcolor('ramping', 'brightness_ramping_on_radio_label')">
                        <label for="brightness_ramping_on_radio" id="brightness_ramping_on_radio_label">On</label>
                        <span class="slide-button"></span>
                    </div>
                    </div> <!-- mine -->
                </div>
            </div>
        </div>

        <!-- SIGNAL 0 -->
        <div id="signal_0" class="config">
            <div class="cancel">
                <a href="#" onclick="remove_config('signal_0')"><img src="img/close.png"></a>
            </div>
            <div class="content">
                <div class="section">
                    <div class="header">
                        <div class="label">
                            Pattern 1<br>
                            <span class="description">The first pattern Remee will display</span>
                        </div>
                        <div id="signal_0_value" class="value">Pattern slow (0x)</div>
                    </div>
                    <div class="options">
                        <div class="pattern_options">
                            <select id="signal_0_pattern_select" class="pattern_select" data-mini="true" data-inline="true"></select>
                        </div>
                        <div class="pattern_suboptions" id="signal_0_pattern_options">
                            <select id="signal_0_loops_select" class="loop_select" data-mini="true" data-inline="true"></select>
                            <div class="switch switch-remee">
                                <input id="signal_0_speed_slow_radio" name="signal_0_speed" type="radio" value="0" checked="checked" onclick="switchcolor('pattern0', 'signal_0_speed_slow_radio_label')">
                                <label for="signal_0_speed_slow_radio" id="signal_0_speed_slow_radio_label">Slow</label>
                                <input id="signal_0_speed_fast_radio" name="signal_0_speed" type="radio" value="1" onclick="switchcolor('pattern0', 'signal_0_speed_fast_radio_label')">
                                <label for="signal_0_speed_fast_radio" id="signal_0_speed_fast_radio_label"  style="color:white;">Fast</label>
                                <div class="slide-button"></div>
                            </div>
                        </div>
                        <div class="pattern_image" id="signal_0_pattern_image">
                            <img id="signal_0_image">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SIGNAL 1 -->
        <div id="signal_1" class="config">
            <div class="cancel">
                <a href="#" onclick="remove_config('signal_1')"><img src="img/close.png"></a>
            </div>
            <div class="content">
                <div class="section">
                    <div class="header">
                        <div class="label">
                            Pattern 2<br>
                            <span class="description">The second pattern Remee will display</span>
                        </div>
                        <div id="signal_1_value" class="value">Pattern slow (1x)</div>
                    </div>
                    <div class="options">
                        <div class="pattern_options">
                            <select id="signal_1_pattern_select" class="pattern_select" data-mini="true" data-inline="true"></select>
                        </div>
                        <div class="pattern_suboptions" id="signal_1_pattern_options">
                            <select id="signal_1_loops_select" class="loop_select" data-mini="true" data-inline="true"></select>
                            <div class="switch switch-remee">
                                <input id="signal_1_speed_slow_radio" name="signal_1_speed" type="radio" value="0" checked="checked" onclick="switchcolor('pattern1', 'signal_1_speed_slow_radio_label')">
                                <label for="signal_1_speed_slow_radio" id="signal_1_speed_slow_radio_label">Slow</label>
                                <input id="signal_1_speed_fast_radio" name="signal_1_speed" type="radio" value="1" onclick="switchcolor('pattern1', 'signal_1_speed_fast_radio_label')">
                                <label for="signal_1_speed_fast_radio" id="signal_1_speed_fast_radio_label"  style="color:white;">Fast</label>
                                <div class="slide-button"></div>
                            </div>
                        </div>
                        <div class="pattern_image" id="signal_1_pattern_image">
                            <img id="signal_1_image">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SIGNAL 2 -->
        <div id="signal_2" class="config">
            <div class="cancel">
                <a href="#" onclick="remove_config('signal_2')"><img src="img/close.png"></a>
            </div>
            <div class="content">
                <div class="section">
                    <div class="header">
                        <div class="label">
                            Pattern 3<br>
                            <span class="description">The third pattern Remee will display</span>
                        </div>
                        <div id="signal_2_value" class="value">Pattern slow (2x)</div>
                    </div>
                    <div class="options">
                        <div class="pattern_options">
                            <select id="signal_2_pattern_select" class="pattern_select" data-mini="true" data-inline="true"></select>
                        </div>
                        <div class="pattern_suboptions" id="signal_2_pattern_options">
                            <select id="signal_2_loops_select" class="loop_select" data-mini="true" data-inline="true"></select>
                            <div class="switch switch-remee">
                                <input id="signal_2_speed_slow_radio" name="signal_2_speed" type="radio" value="0" checked="checked" onclick="switchcolor('pattern2', 'signal_2_speed_slow_radio_label')">
                                <label for="signal_2_speed_slow_radio"  id="signal_2_speed_slow_radio_label">Slow</label>
                                <input id="signal_2_speed_fast_radio" name="signal_2_speed" type="radio" value="1" onclick="switchcolor('pattern2', 'signal_2_speed_fast_radio_label')">
                                <label for="signal_2_speed_fast_radio" id="signal_2_speed_fast_radio_label"  style="color:white;">Fast</label>
                                <div class="slide-button"></div>
                            </div>
                        </div>
                        <div class="pattern_image" id="signal_2_pattern_image">
                            <img id="signal_2_image">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <ul id="configs_select">
            <li><a href="javascript:">Select a setting to edit</a>
                <ul>
                    <li id="initial_delay_add"><a href="javascript:add_config('initial_delay')">Initial Delay</a></li>
                    <li id="nap_delay_add"><a href="javascript:add_config('nap_delay')">Nap Delay</a></li>
                    <li id="signal_interval_add"><a href="javascript:add_config('signal_interval')">Signal Interval</a></li>
                    <li id="brightness_add"><a href="javascript:add_config('brightness')">Brightness</a></li>
                    <li id="signal_0_add"><a href="javascript:add_config('signal_0')">Pattern 1</a></li>
                    <li id="signal_1_add"><a href="javascript:add_config('signal_1')">Pattern 2</a></li>
                    <li id="signal_2_add"><a href="javascript:add_config('signal_2')">Pattern 3</a></li>
                </ul>
            </li>
        </ul>
        <div id="configs_note">
            Only settings that are modified will be updated, all others will remain the same.
        </div>
    </div>
</div>

<div class="section" id="blinker">
    <div class="header">
        <div class="label">
            Send updates to Remee
        </div>
        <div class="side">
            <button id="update_button">Update!</button>
        </div>
    </div>
    <div class="content">
        <div id="blinker_info">
            <div class="message pre_message" style="font-size:11pt;">
                Choose settings above. When finished, turn Remee on, expose
                light sensors, press and hold selection button for 7 seconds,
                then align light sensors with boxes below and click "Update!"
            </div>
            <div class="countdown">
                <div class="bar">
                    <div class="inner"></div>
                </div>
            </div>
            <div class="message post_message">
                Settings sent! Remee will sweep its lights if they were transferred successfully, and blink one light if they weren't. Click "Update Remee!" to try again!
                <div class="success">
                    <img src="img/icon_success.png"><br>
                    <img src="img/mask_success.gif"><br>
                    Success!
                </div>
                <div class="failure">
                    <img src="img/icon_fail.png"><br>
                    <img src="img/mask_fail.gif"><br>
                    Try again.<br>
                    
                </div>
            </div>
        </div>
        <div id="blinker_clock" style="border-right:0px;"></div><div id="blinker_data"></div>
    </div>
</div>

<div id="user_info">
    <div class="inner">

        <div class="login_section">
            <img class ="headerimg" src="img/logo.png">
            <form id="login_form">
                <input id="login_username" type="text">
                <input id="login_password" type="password">
                <input id="login_submit" type="submit" value="Login">
            </form>
            <div class="centered">
                <a href="./register.php">Register</a>
                <a href="./recover_password.php">Forgot Password?</a>
            </div>
            <div class="errors"></div>
        </div>
        <div class="user_section">
            <form id="save_config_form">
                <input id="save_config_submit" type="submit" value="Save">
                <input id="save_config_name" type="text">
            </form>
            <ul id="saved_configs_select">
                <li>
                    <a href="javascript:">Saved&nbsp;Settings</a>
                    <ul id="saved_configs_options">
                    </ul>
                </li>
            </ul>
            <div class="centered">
                <a href="edit_account.php">Edit Account</a>
                <a href="#" onclick="javascript:user_logout();">Logout</a>
            </div>
            <div class="errors"></div>
        </div>
    </div>
</div>

<div id="short_url">
    <div class="inner">
        <button id="short_url_button">Share Your Settings</button>
        <input id="short_url_text" input="text" readonly="readonly">
    </div>
</div>


    </body>
</html>
