var andrew = {
    fullName: "Andrew Hoyer",

    title: "Computer Scientist (Extraordinaire)",

    homeTown: "Edmonton, AB, Canada",

    currentLocation: "San Francisco, CA",

    employment: {
        company: "Inkling",
        position: "Web Application Engineer"
    },

    education: {
        undergraduate: {
            location: "University of Alberta",
            degree: "BSc. Specialization in Computing Science",
            completionDate: "2010-04-23"
        }
    },

    likes: ["maths", "peanut butter", "bowling", "taking pictures", "reading",
            "Smultzy Music", "Walking", "Sudokus", "W(p)GtR", "Programming",
            "Nerdy Jokes"],

    loves: ["Javascript", "Snow", "Dogs"],

    dislikes: ["Naps", "The word 'cyberspace'",  "Angry Music", "Liver Sausage", "Emoticons", "Pickles", "Drama", "One up-ers"],

    hates: ["People chewing with their mouth open"],

    afewThingsIKnow: ["Javascript", "C", "Ruby", "CSS", "HTML", "ASL"],

    afewDavesIKnow: ["Dave Hoyer", "David Wahlstrom", "David Maidens", "David Bonar", "David Russell", "David McClelland"],

    preferedContact: "<a href=\"mailto:me@andrew-hoyer.com\">me@andrew-hoyer.com</a>",

    voted: "Best"
};

// Convert the above json object into a pretty printed version (string highlighted).
(function(object){

    // Parse the json into nicely spaced lines.
    var lines = JSON.stringify(object, function(key, value){
        if ('string' == typeof value)
            value = '<span class="string">' + value + '</span>';
        return value;
    }, 4).split('\n');

    // Add 'var andrew = ' to the first line.
    lines[0] = '<span class="var">var</span> andrew = ' + lines[0];

    // Unescape strings that were previously escaped by JSON, as well as fill out the gutter.
    var gutter = '';
    lines = lines.map(function(line, index){
        gutter += (index < 9 ? '0' : '') + (index + 1) + '\n';
        return line.replace(/\\"/g, '"');
    });

    // Add the closing semicolon to the last line.
    lines[lines.length - 1] += ';';

    // Dump out onto the page.
    document.getElementById('gutter').innerHTML = gutter;
    document.getElementById('main').innerHTML = lines.join('\n');

})(andrew);
