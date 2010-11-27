

var Control = new Class({

    initialize: function(button, audio){
        button.addEvent('click', this.toggle.bind(this));

        this.button = button;
        this.audio = audio;

        if (!this.supportsAudio()) this.button.dispose();
    },

    toggle: function(){
        this.button.hasClass('playing') ? this.stop() : this.start();
    },

    start: function(){
        var previous = 0,
            button = this.button,
            audio = this.audio;

        button.addClass('playing');

        audio.currentTime = 0;
        audio.play();

        // stupid hack until the browsers implement events properly;
        this.timer = (function(){ 
            var current = audio.currentTime;
            if (previous == current) this.stop();
            else previous = current;
        }).periodical(100, this);
    },

    stop: function(){
        clearInterval(this.timer);
        this.button.removeClass('playing');
        this.audio.pause();
    },
    
    supportsAudio: function(){
        return !!document.createElement('audio').canPlayType;
    }

});

document.addEvent('domready', function(){
    new Control(document.getElement('div.mobeh'), document.getElement('audio'));
});

