
document.addEventListener('DOMContentLoaded', function(){
    // Color links
    var colors = ['blue', 'orange', 'green', 'red', 'teal', 'purple', 'yellow'];
    Array.prototype.forEach.call(document.querySelectorAll('a'), function(link){
        link.className += ' ' + colors[Math.floor(Math.random() * colors.length)];
    });
    
    // Add more/less functionality to context menu.
    var context = document.querySelector('.context');
    if(context){
        var control = context.querySelector('a.context-control');
        
        control.addEventListener('click', function(){
            var text = control.textContent.toLowerCase();
            
            if (text == 'less...'){
                context.className += ' less';
                control.innerHTML = 'more...';
            } else {
                context.className = context.className.replace('less', '');
                control.innerHTML = 'less...';
            }
        }, false);
    }
}, false);
