# Making it rain

If you haven't already seen my CSS/HTML Rain experiment I highly suggest you [check it out][links.rain] before reading more. Or if you're stuck using an older browser, you can just watch the video below.

Basically I built a rain simulation using only HTML, CSS and Javascript. No canvas, no images. Just a webpage.

<object width="640" height="390"><param name="movie" value="http://www.youtube.com/v/izxmHpuCeJ8?fs=1&amp;hl=en_US&amp;rel=0"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/izxmHpuCeJ8?fs=1&amp;hl=en_US&amp;rel=0" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="640" height="390"></embed></object>

Over the last few months I had been racking my brain for an idea worth fully implementing. I went through several iterations of this one, including ideas of having live twitter data flow over a waterfall or turning paragraphs of a novel into some kind of bound fluid simulation. It wasn't until about two weeks ago that I actually decided to take a big step back and just try to create something simple. In doing so, I found that the simpler idea would not only be easier to implement, but also probably look a lot better than something complicated.

### Y U NO Use Canvas?

![images.yuno][images.yuno]

Lately I've been kinda tired of the canvas. I know you can do some amazing things with it, but when it comes down to it, all you're doing is painting a flat image over and over again. I think when I started with this experiment I was interested in creating a simulation that would use actual objects as particles, not just circles or letters drawn to a surface that I would manually have to repaint every iteration.

Another major reason for doing this, is that I wanted to play around with inserting and removing large amounts of elements to and from the DOM and manipulating them via css transforms in realtime.

### The physics of it:

When this idea first started brewing, I spent quite a bit of time reading papers on how to do realtime fluid/waterfall simulations. This, as it would turn out, would all be in vain.

The calculations to accurately model a fluid, as you might guess, are extremely complicated. Each particle has to somehow interact with its surrounding particles, be it slightly tugging or pushing apart. This is what makes the effects of surface tension and viscosity look realistic. But what this also means, is that for every frame of your animation/simulation, you're expending a huge amount of computing power calculating things like distances and forces between all of the particles.

Doing that kind of computation is not really feasible in the current browser environment, as not only do I have to deal with Javascript not being as fast a C or C++ implementations, but I also have to worry about the cost of the DOM repainting. So instead of doing a full blown, completely accurate simulation, I opted to take a much simpler approach such that each particle (or drop as I call them in my code) acts independently of every other particle and only interacts with the mouse.

Each rain drop really only has two constraints then, one equation to govern how the particle moves over time, and another that make sure particles don't pass through the users cursor.

To do the updating of each particle, I employed a small amount of vector math in the following code:

```js

update: function(acceleration){
    var temp = this.current;

    // basically new_position = (current_position * 2) - previous_position + acceleration
    // where the acceleration is actually a gravity constant scaled by some factor.
    this.current = this.current.scale(2).subtract(this.previous).add(acceleration);
    this.previous = temp;

    // rotation is completely independent of everything and just
    // does whatever it wants based on random initial conditions.
    this.rotation += this.rotation_step;

    // apply the position and rotation we just calculated
    this.style();

    return this;
},

```

If you've seen some of my other work on things like the [cloth][links.cloth] and [particle simulation][links.particles], you know that I'm a fan of [Verlet integration][links.verlet] in my simulations. What Verlet gives you over [Euler][links.euler], is that you no longer need to store information about an objects velocity. Instead you can easily calculate a similar metric using the object's current and previous positions.

Lastly to take care of the mouse interaction I added the following method to my Cursor object, such that it can take a particle and move it if it happens to intersect with the cursors radius. The following code has been modified slightly from what is actually in the source, just for readabilities sake.

```js

adjustParticle: function(particle){
    // current position of the mouse.
    var position = this.position;

    // find out the distance between the cursor and the given particle.
    var diff = particle.current.subtract(position),
        distance = diff.length();

    if (distance < this.radius){

        // if the particle is inside the radius of the mouse, set the
        // current position of the particle so that it is some distance
        // in the opposite direction of entrance.
        particle.current = position.add(diff.scale(this.radius / distance));
    }
}

```

![images.cursor][images.cursor]

The above code is actually quite neat as it adds a tiny bit of bounce whenever a particle hits the cursor. This is because I change the position of conflicting particle so that it is reflected back on the direction it was coming from. If you watch the youtube video above, you can see me using this to bounce particles up and down.

### DOM Optimizations:

![images.fading][images.fading]

One problem that I was concerned about from the start, was how to deal with actually generating the rain drops. The general idea was that I would have some set number of drops in the simulation at any given iteration, then I could simply loop over this list to move the simulation ahead each time step.

My first approach was the simplest. The basic idea was: keep adding drops (read: keep dumping divs into the DOM) until I reach the at set limit. If a given drop is past some threshold (generally some distance off the page) then actually remove that drop from the DOM and generate a brand new one in it's place. This method actually got me pretty far in terms of getting the look and feel of the physics right, but it certainly wasn't all that efficient. The problems started when I tried adding more than 50 drops. Basically, the cost of updating the DOM was actually starting to slow down my simulation.

There were quite a few intermediate solutions that each provided their own benefits. But the final solution was actually quite similar to the first. Just like before I would keep adding elements to DOM until I reached my limit, I also used the same threshold idea for when elements fell out of sight. But instead of removing the element from the DOM, I would just hide it (with display:none), reset its position to the top, then show it at the start of the next iteration. This way, once the simulation is up and running with a lot of particles, there is no further DOM manipulation, just CSS updates.

You can actually see this when you drop the simulation down to very few particles, you'll see the same small subset of letters appearing over and over again. I also fade the drops out as they go down the page, so it's not obvious that I'm recycling.

Another thing I had to optimize was the generation of the clouds. Initially I was just going to draw up an image of a cloud and slap it on top of the simulation, but quickly realized it would be so much cooler if I could do it with text. The problem with that is that I would like to make sure it reasonably covers up the generation area, but doesn't slow down the page load time or overall simulation.

The basic idea behind the clouds, is that I strategically chose a set of points that I would like to have covered up, then generate a bunch of random letters in a circle around that point. In the end, I decided there were 15 points that I would like to be covered up. For each of these points I would then generate 25 random letters and inject them into a document fragment, before finally injecting that fragment into the actual DOM.

![images.cloud][images.cloud]

The speed of this is actually quite striking. Seeing as at every page load I'm dynamically creating and inserting 375 divs in just a few milliseconds. Pretty neat.

### CSS Optimizations:

Optimizing the CSS turned out to be a bit of a gong show.

One of the first ideas I had toyed around with, was using css transitions to tween between animation frames. The hope of this, was that I would be able to cram in more expensive computation at a lower frame rate while still maintaining smooth animations. In theory this could have been awesome, but instead it turned out to be the opposite.

It wasn't until I read [an article][links.facebook_games] from a developer at facebook that I realized I was doing it wrong. Basically the article goes through different ways of optimizing HTML5 games. One of the things they mention is that on desktop browsers, it is actually more efficient to turn off transitions and just manually move things on the page. I guess this kinda makes sense, as the browser probably has to do some serious math to try and tween something. Where as if I just tell it what to do, it doesn't really have to figure anything out. The down side of this approach is that you'll be killing performance on mobile devices, which are generally pretty good at transitions on certain properties, while not being good at executing javascript quickly.

The other relatively big struggle I had to deal with was figuring out what css transformations worked in which browsers. Initially I had been using the tranform `translate3d(x, y, 0)`, but that would cause Firefox 4 to barf. So instead I switched to using just the regular `translate(x, y)` which appeared to work. But when I went back to test in Safari, the performance was now horrible. I know this was mentioned in the above facebook article, but I didn't realize how big of an impact it would have.

Eventually I just fell to the level of writing another feature sniffer that would check if a browser supported 3d transforms. I should also note, that I learned that chrome pretends that it has support for 3d transforms, so it uses the `translate3d(x, y, z)` transform, but basically has the same performance of `translate(x, y)`.

The last little optimization I employed, was to use integer values in my transforms. I was honestly quite surprised by this. Simply truncating my numbers using `value | 0` made an actual significant difference in the overall performance.

### What I learned:

The biggest thing I took away from this experiment, is that it is most certainly possible to build interesting simulations using the DOM and css transforms. That being said, at the end of all this, I'm not terribly thrilled with how all the browsers are currently handling css transformations (with the exception of Safari).

All the browsers seem to have a lot of work to do in order to make developing easier. But when that day comes, I'm sure we'll see some really interesting and beautiful experiments.

By the way, if you're planning on delving into an experiment using some of the latest technologies, I highly suggest you take a look at some feature detection libraries (personally I think [modernizr][links.modernizr] is pretty cool). I didn't use one for this experiment as I was only dealing with a small subset of features, plus I was interested in learning how to do it myself.

### Links:

* Source for this experiment: [HTML][links.exp_html] and [everything else][links.exp_js_css]
* [Verlet Integration][links.verlet]
* [Euler Method][links.euler]
* [Facebook article about HTML5 games][links.facebook_games]
* [Modernizr, handy feature sniffer][links.modernizr]

[links.rain]:           http://andrew-hoyer.com/experiments/rain/
[links.particles]:      http://andrew-hoyer.com/experiments/particle_system/
[links.cloth]:          http://andrew-hoyer.com/experiments/cloth/
[links.euler]:          http://en.wikipedia.org/wiki/Euler_method
[links.verlet]:         http://en.wikipedia.org/wiki/Verlet_integration
[links.modernizr]:      http://www.modernizr.com/
[links.facebook_games]: https://developers.facebook.com/blog/post/460
[links.exp_html]:       https://github.com/ndrwhr/andrewhoyer/blob/master/experiments/rain.html
[links.exp_js_css]:     https://github.com/ndrwhr/andrewhoyer/tree/master/resources/exp_src/rain
[images.cloud]:         https://raw.github.com/ndrwhr/andrewhoyer/master/blog_archive/images/rain-simulation-cloud-screen.jpg
[images.cursor]:        https://raw.github.com/ndrwhr/andrewhoyer/master/blog_archive/images/rain-simulation-cursor-screen.jpg
[images.yuno]:          https://raw.github.com/ndrwhr/andrewhoyer/master/blog_archive/images/rain-simulation-yuno.jpg
[images.fading]:        https://raw.github.com/ndrwhr/andrewhoyer/master/blog_archive/images/rain-simulation-fading-screen.jpg
