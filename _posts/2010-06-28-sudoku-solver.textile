---
layout: post
title: The Sudoku Solver
---

After a bad run of making mistakes while marking up sudokus I thought I would try my hand at creating something to do the marking up for me. But as it turns out, I ended up writing something that would not only mark up the puzzles, but would more often than not entirely solve them.

h2. Which strategies does the solver use?

I like my sudokus to be tricky, but not impossible. This means I don't believe you should ever have to guess a number to solve a sudoku. I also don't like all of the exotic named strategies that only work once in a million puzzles (jellyfish, swordfish, &amp;c.). That in mind, I wrote this program to use only the strategies that I would use to solve a puzzle:

* Row, Column or Block Singles
* Naked Pairs
* Naked Triples
* Hidden Pairs
* Hidden Triples
* Pointing Pairs (or triples)

As I said before, I have absolutely no intention of implementing the silly named strategies.

h2. Hasn't this been done before?

Oh definitely! Everyone and their dog appears to have written one (a quick google search will reveal this). What I feel like other solvers don't provide is an easy to use interface. So even though other solvers may be more powerful, mine is at least easy to use.

h2. Updates:

* Pretty much rewrote the entire application:
** Switched from jquery to mootools.
** Now uses sets instead of strings to represent candidates.
** Consolidated state information.
** Improved efficiency across the board by throttling the amount of looping for most strategies.
** Fixed the horrible bugginess when demoing.
* Added hidden pairs/triples strategies.
* Slight (in looks) interface change.

<div style='width: 640px; margin: 0 auto'><object width="640" height="385"><param name="movie" value="http://www.youtube.com/v/9cHRJ3smwrU&amp;hl=en_US&amp;fs=1?rel=0"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/9cHRJ3smwrU&amp;hl=en_US&amp;fs=1?rel=0" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="640" height="385"></embed></object></div>

