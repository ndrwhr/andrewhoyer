# Building the Zoetrope

Building a [Zoetrope][links.experiment] using web technologies was an idea that had been festering for many months. It wasn't until I saw Google's tribute to Jim Hensen that I actually decided to sit down and do it. The implimentation turned out to be relatively simple and allowed me to really play around with some of my favorite features of CSS3.

### Construction

The [basic structure][links.index] of the Zoetrope is quite simple. The outer wrapper div (`div.zoetrope`) is only used to do things like rotate about the x-axis. The inner div (`div.frames`) is the container that actually does the rotation about the y-axis and facilitates the animation. All the divs inside of `div.frames` are the individual frames of the animation.

```html
<div class="zoetrope">
    <div class="frames">
        <div></div>
        <!-- 22 other divs left out for brevity -->
        <div></div>
    </div>
</div>
```

#### Building the ring

The idea behind the ring shape was actually taken from one of surfin' safari's CSS3 examples. The basic idea is that you take a single div, rotate it about the y-axis and then translate it out of the page slightly. You then continue to do this until you have a complete circle.

In my case I wanted to be able to create some pretty smooth animations so I decided to go with 24 frames, which meant 24 divs all rotated slightly. This as it turned out was extremely tedious and boring, so I ended up writing a small ruby script that generated a css (I could have also done it with a SASS function or two) file that contained something like this:

```css
.frames > div:nth-child(1) {
    transform: rotateY(0deg) translateZ(380px);
}

/* 22 other declarations left out */

.frames > div:nth-child(24) {
    transform: rotateY(345deg) translateZ(380px);
}
```

The gist of it is that each div inside of the frames container is rotated 15 degrees, then translated out of the page 380 pixels. Doing this 24 times results in a complete circle:

![images.basic][images.basic]

#### Different colors on different sides

A key feature of the zoetrope is that the inside of the ring contains the animation while the outside is generally plain. I assume this is done so that the eye can focus on the frames flipping by when it begins rotating. There were two obvious options to do this.

The first would be to just add a bunch more html such that every frame div had a corresponding "outer" div. This would work fine, but would also require a ton more html and css. The second approach, which I ended up using, was to just use a `:before` selector and position a pseudo element slightly away from the original div which actually houses the animation frame.

```css
/* Shared Styles */
.frames > div, .frames > div:before {
    position: absolute;
    height: 100px;
    width: 100px;
}

/* Animation frame (inside the ring) */
.frames > div {
    background-color: white;
    background-image: url("../images/muybridge.jpg");
    backface-visibility: visible;
}

/* Outside the ring) */
.frames > div:before {
    content: "";
    background: black;
    width: 102px;
    /* HACK getting the :before positioned outside the wheel... */
    transform: translateZ(1px);
}
```

At this point we would end up with something looking like this:

![images.dual][images.dual]

#### The slits

The slits used a similar approach as the outer dark ring. Although this time it was just an :after selector with a couple special properties set.

```css
.frames > div:after {
    content: "";
    top: -98px;
    width: 102px;
    height: 100px;
    border-left: 35px solid black;
    border-right: 35px solid black;
    border-top: 15px solid black;
    border-bottom: 15px solid black;
    box-sizing: border-box;
    transform: translateZ(1px);
}
```

The key thing to note here is the `box-sizing` property. This switches the way that the size of an element is calculated. Normally the size is calculated independantly of things like padding and borders. By setting `box-sizing: border-box` we're telling the browser to include borders and padding in the width calculation. This allows me to then set a really thick border on the sides and top in order to make the center of the element open.

That is pretty much it as far as the construction goes, at this point you essentially have the Zoetrope as seen in the experiment:

![images.complete][images.complete]

If you're interested in more details, or just have questions, as always feel free to [email](mailto:me@andrew-hoyer.com) me. Also, all the source of the experiment is up on [GitHub][links.github], so feel free to peruse and hack things up.


[links.experiment]: http://andrew-hoyer.com/experiments/zoetrope/
[links.github]:     https://github.com/ndrwhr/zoetrope
[links.ruby]:       https://github.com/ndrwhr/zoetrope/blob/master/generator.rb
[links.index]:      https://github.com/ndrwhr/zoetrope/blob/master/index.html
[links.frames]:     https://github.com/ndrwhr/zoetrope/blob/master/assets/css/frames.css
[images.basic]:     https://raw.github.com/ndrwhr/andrewhoyer/master/blog_archive/images/zoetrope-basic.jpg
[images.dual]:      https://raw.github.com/ndrwhr/andrewhoyer/master/blog_archive/images/zoetrope-dual-side.jpg
[images.complete]:  https://raw.github.com/ndrwhr/andrewhoyer/master/blog_archive/images/zoetrope-complete.jpg
