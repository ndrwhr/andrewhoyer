
window.loadCommits = function(result){
    try {
        var container = document.getElementById('latest-commit'),
            recentCommit = result.commits[0],
            dateDiff = new Date() - new Date(recentCommit.committed_date);

        // Convert to days (truncating instead of rounding).
        dateDiff = (dateDiff / (1000 * 60 * 60 * 24)) | 0;

        if (dateDiff < 1){
            dateDiff = 'today';
        } else if (dateDiff == 1){
            dateDiff = 'yesterday';
        } else {
            dateDiff += ' days ago';
        }

        var html = [
            'Last update pushed ', dateDiff, ': <a href="http://github.com', recentCommit.url, '">',
            recentCommit.message, '</a>...'
        ];

        container.innerHTML = html.join('');
    }
    catch (e) {
        // Don't do anything...
    };
};
