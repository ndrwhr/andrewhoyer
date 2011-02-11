
document.addEventListener('DOMContentLoaded', function(){
    var colors = ['blue', 'orange', 'green', 'red', 'teal', 'purple', 'yellow'];
    Array.prototype.slice.call(document.querySelectorAll('a')).forEach(function(link){
        link.className += ' ' + colors[Math.floor(Math.random() * colors.length)];
    });
});
