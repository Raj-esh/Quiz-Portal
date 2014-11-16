/*

 * Author - Harshen Amarnath Pandey
 * Version - 1.0.4
 * Release - 13th January 2014
 * Copyright (c) 2014 - 2018 Harshen Pandey
*/

(function( $ ) {

    $.fn.countdowntimer = function( options ) {
        return this.each( function() {
            countdown( $(this), options );
        });
    };

    //Definition of private function countdown.
    function countdown( $this , options ) {
        var opts = $.extend( {}, $.fn.countdowntimer.defaults, options );
        var $this = $this;

            if(options.hours == undefined && options.minutes != undefined && options.seconds == undefined) {
                hours_M = "";
                minutes_M = "";
                seconds_M = "";
                timer_M = "";
                window.hours_M = opts.hours;
                window.minutes_M = opts.minutes;
                window.seconds_M = opts.seconds;
                window.timer_M = setInterval(function(){
                    onlyMinutes($this, opts)
                },1000);
            }
    };

    

    //Function for only minutes are set when invoking plugin.
    function onlyMinutes($this, opts) {
        if(window.minutes_M == opts.minutes && window.seconds_M == opts.seconds) {
            if(window.minutes_M.toString().length < 2) {
                window.minutes_M = "0" + window.minutes_M;
            }
            $this.html(window.minutes_M+":"+"00");
            window.seconds_M = 59;
            if(window.minutes_M != 0) {
                window.minutes_M--;
            } else {
                delete window.hours_M;
                delete window.minutes_M;
                delete window.seconds_M;
                clearInterval(window.timer_M);
                document.myform.submit();
            }
        } else {
            if(window.minutes_M.toString().length < 2) {
                window.minutes_M = "0" + window.minutes_M;
            }
            if(window.seconds_M.toString().length < 2) {
                window.seconds_M = "0" + window.seconds_M;
            }
            $this.html(window.minutes_M+":"+window.seconds_M);
            window.seconds_M--;
            if (window.minutes_M!=0 && window.seconds_M < 0){
                window.minutes_M--;
                window.seconds_M = 59
            }
			if(window.minutes_M== 0 && window.seconds_M <= 59)
			{
				$("#timeout").css("visibility","visible");
				
				$( "#timeout" ).html(function() {
					var remaining_time = window.seconds_M+1;
					return "Last " + remaining_time + " Seconds To Complete The Quiz...!!";
				});
				
				$("#m_timer").css("color","red");
				$("#timer").css("color","red");
			}
            if(window.minutes_M==0 && window.seconds_M==-1)
            {
                delete window.hours_M;
                delete window.minutes_M;
                delete window.seconds_M;
                clearInterval(window.timer_M);
                document.myform.submit();
            }
        }
    }

   //Giving default value for options.
    $.fn.countdowntimer.defaults = {
        hours   : 0,
        minutes : 0,
        seconds : 60,
        dateAndTime : new Date("0000/00/00 00:00:00"),
        currentTime : false,
        size : "sm",
        borderColor : "#F0068E",
        fontColor : "#FFFFFF",
        backgroundColor : "#000000"
    };

}(jQuery));