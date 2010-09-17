window.addEvent('domready', function(){
	var sudoku = Sudoku();
	
	document.addEvent('keydown', function(e){ 
		return sudoku.keyStroke(e.code);
	});
	
	document.id('sudoku').getElements('td').each(function(td){
		if (td.get('id')) td.addEvent('click', function(){
				sudoku.setSelected(+this.id.charAt(1), +this.id.charAt(2));
			});
	});
});


var Sudoku = function(){
	//private variables:
	var _cell,
		_candidates, //2d array that will conatain all the markup information
		_masks, //a quick hash to help ident. blocks, rows and col.
		bar_gradient = Gradient('F08080','90EE90',101),
		selected_row = 1, //the current row that is selected.
		selected_col = 1, //the current col that is selected.
		keyCodes, //an array of acceptible keycodes.
		demo_timer,
		demo_frame,
		demo_keys, //an array that will store all the demo keystrokes.
	
	//private methods:
		//methods for user interaction (key press and mouse events):
		keyPressed = function(c){
			switch(c){
				case "backspace":
					backspace();
					solve();
					break;
					
				case "left":
					moveSelected(selected_row, (selected_col == 1) ? 9 : selected_col - 1);
					break;
					
				case "up":
					moveSelected((selected_row == 1) ? 9 : selected_row - 1, selected_col);
					break;
					
				case "right":
					moveSelected(selected_row, (selected_col == 9) ? 1 : selected_col + 1);
					break;
					
				case "down":
					moveSelected((selected_row == 9) ? 1 : selected_row + 1, selected_col);
					break;
					
				case "1": case "2": case "3": case "4": case "5":
				case "6": case "7": case "8": case "9":
					writeNumberToSelected(c);
					solve();
					break;
					
				case "c":
					clear();
					break;
					
				case "d":
					toggleDemo();
					break;
			}
		},
		
		moveSelected = function(i, j){
			_cell[selected_row][selected_col].removeClass("selected");
			selected_row = i;
			selected_col = j;
			_cell[selected_row][selected_col].addClass("selected");
		},
		
		backspace = function(){
			_cell[selected_row][selected_col].removeClass('user-defined').erase('html');
		},
		
		writeNumberToSelected = function(num){
			_cell[selected_row][selected_col].set({
				'class': 'user-defined selected',
				'html': num
			});
		},
		
		
		//methods for when the demo is run.
		//just continuous step through an array
		//containing the keystrokes for the demo.
		stepDemo = function(){
			if (demo_frame < current_demo.length)
				keyPressed(keyCodes[current_demo[demo_frame++]]);
			else stopDemo();
		},
		
		toggleDemo = function(){
			if (!demo_timer){
				stopDemo();
				clear();
				current_demo = demo_keys[Math.floor(Math.random()*demo_keys.length)];
				demo_frame = 0;
				demo_timer = setInterval(stepDemo, 150);
			} else stopDemo();
		},
		
		stopDemo = function(){
			if (demo_timer) clearInterval(demo_timer);
			demo_timer = null;
		},
		
		isDemoRunning = function(){
			return !!demo_timer;
		},
		
		solve = function(){
			if (initialize()){
				while(findCandidates());
				errors();
			}
			output();
			return;
		},
		
		initialize = function(){
			for (var i = 1; i < 10; i++){
				for (var j = 1; j < 10; j++){
					var cell = _cell[i][j],
						candidates = _candidates[i][j];
					
					if (cell.hasClass('user-defined')) candidates.clear(+cell.get('html'));
					else candidates.add([1, 2, 3, 4, 5, 6, 7, 8, 9]);
					
					cell.erase('html');
				}
			}
			return !errors();
		},
		
		output = function(){
			var solved = 0,
				cell,
				candidates,
				num_candidates, 
				contents;
			
			for (var i = 1; i < 10; i++){
				for (var j = 1; j < 10; j++){
					cell = _cell[i][j];
					cell.erase('html');
					candidates = _candidates[i][j];
					num_candidates = candidates.length;
					
					if (num_candidates == 1){ 
						cell.set('html', candidates.toString(""));
						solved++;
					} else {
						contents = "";
						candidates = candidates.toArray();
						
						for (var k = 1, l = 0; k <= 9; k++){
							if (candidates[l] == k) contents += candidates[l++].toString();
							else contents += " ";
							
							contents += (k % 3 == 0) ? '\n' : ' ';
						}
						
						new Element("pre", {'text': contents}).inject(cell);
					}
				}
			}
			
			solved = Math.round((solved/81)*100);
			setBar(solved);

		},
		
		errors = function(){
			var i, j, 
				error = false;
			
			var check = function(mask){
				var unique = new Set(),
					count = 0,
					candidates, result;
				
				result = mask.some(function(info){
					candidates = info.candidates;
					if (candidates.length == 1){
						unique = unique.union(candidates);
						count++;
					}
					if (unique.length != count) return true;
					else return false;
				});
				
				if (result) for (var i = 0; i < 9; i++)
					mask[i].cell.addClass('error');
					
				return result;
			};
			
			//first clear all the previous errors
			for(i = 1; i <= 9; i++)
				for(j = 1; j <= 9; j++)
					_cell[i][j].removeClass("error");
			
			for(i = 1; i <= 3; i++)
				for(j = 1; j <= 3; j++)
					error = check(_masks['blocks'][i][j]) || error;
			
			for(i = 1; i <= 9; i++)
				error = check(_masks['rows'][i]) || check(_masks['cols'][i]) || error;

			return error;
		},
		
		findCandidates = function(){
			//return true of a change has occured false otherwise.
			
			var types = ['blocks', 'rows', 'cols'],
				fns = [cleanUp, singles, nakedPairs, nakedTriples, hiddenPairs, hiddenTriples],
				changed = false;
			
			changed = fns.some(function(fn){
				return types.some(function(type){
					return run(type, fn);
				});
			});
			
			if (changed) return true;
			
			if (pointingPairs()) return true;
			
			return false;
		},
		
		run = function(type, funct){
			var changed = false,
				i, j;
			
			if (type == 'blocks')
				for (i = 1; i <= 3; i++)
					for (j = 1; j <= 3; j++)
						changed = funct(_masks[type][i][j]) || changed;
			else for (i = 1; i <= 9; i++)
				changed = funct(_masks[type][i]) || changed;
			
			return changed;
		},
		
		cleanUp = function(mask){
			var removed = new Set(),
				changed = false,
				candidates, length, i;
			
			for (i = 0; i < 9; i++)
				if (mask[i].candidates.length == 1)
					removed = removed.union(mask[i].candidates);
			
			for (i = 0; i < 9; i++){
				candidates = mask[i].candidates;
				length = candidates.length;
				if (length != 1){
					candidates.difference(removed, true);
					changed = (candidates.length != length) || changed;
				}
			}
			
			return changed;
		},
		
		singles = function(mask){
			var changed = false,
				pointer, candidates,
				count, result;
			
			for (var n = 1; n <= 9; n++){
				count = 0;
				
				for (var i = 0; i < 9; i++){
					candidates = mask[i].candidates;
					
					if (candidates.length != 1 && candidates.contains(n)){
						pointer = candidates;
						count++;
					}
					
					if (count > 1) break;
				}
				
				if (count == 1){
					pointer.clear(n);
					changed = true;
				}
			}
			
			return changed;
		},
		
		nakedPairs = function(mask){
			var changed = false,
				candidates, i_candidates, j_candidates;
			
			for (var i = 0; i < 8; i++){  // try every combination
				i_candidates = mask[i].candidates;
				if (i_candidates.length != 2) continue;
				
				for (var j = i + 1; j < 9; j++){
					j_candidates = mask[j].candidates;
					if (j_candidates.length != 2 || !i_candidates.equals(j_candidates)) continue;
					
					for (var k = 0; k < 9; k++){
						candidates = mask[k].candidates;
						if (k == i || k == j || candidates.length <= 2) continue;
						
						if (candidates.intersection(i_candidates).length != 0){
							changed = true;
							candidates.difference(i_candidates, true);
						}
					}
				}
			}
			
			return changed;
		},
		
		nakedTriples = function(mask){
			var changed = false,
				candidates, i_candidates, j_candidates, k_candidates,
				triple;
				
			for (i = 0; i < 7; i++){
				i_candidates = mask[i].candidates;
				if (i_candidates.length < 2) continue;
				
				for (j = i + 1; j < 8; j++){
					j_candidates = mask[j].candidates;
					if (j_candidates.length < 2) continue;
					
					for (k = j + 1; k < 9; k++){
						k_candidates = mask[k].candidates;
						if (k_candidates.length < 2) continue;
						
						triple = i_candidates.union(j_candidates.union(k_candidates));
						if (triple.length != 3) continue;
						
						for (var l = 0; l < 9; l++){
							candidates = mask[l].candidates;
							if (l == i || l == j || l == k || candidates.length < 2) continue;
							
							if (candidates.intersection(triple).length != 0){
								changed = true;
								candidates.difference(triple, true);
							}
						}
					}
				}
			}

			return changed;
		},
		
		hiddenPairs = function(mask){
			var changed = false,
				positions = [],
				candidates, n, m, j;
			
			for (n = 1; n <= 9; n++){
				positions[n] = new Set();
				
				for (j = 0; j < 9; j++){
					candidates = mask[j].candidates;
					
					if (candidates.length != 1 && candidates.contains(n))
						positions[n].add(j + 1);
				}
			}
			
			for (n = 1; n <= 8; n++){
				if (positions[n].length != 2) continue;
				
				for (m = n + 1; m <= 9; m++){
					if (!positions[n].equals(positions[m])) continue;
					
					for (j = 0; j < 9; j++){
						candidates = mask[j].candidates;
						
						if (positions[n].contains(j + 1) && candidates.length > 2){
							changed = true;
							candidates.intersection(new Set([n, m]), true);
						}
					}
				}
			}
			
			return changed;
		},
		
		hiddenTriples = function(mask){
			var changed = false,
				positions = [],
				candidates, triple, jp1,
				testn, testm, testl,
				n, m, l, j;
			
			for (n = 1; n <= 9; n++){
				positions[n] = new Set();
				
				for (j = 0; j < 9; j++){
					candidates = mask[j].candidates;
					
					if (candidates.length != 1 && candidates.contains(n))
						positions[n].add(j + 1);
				}
			}
			
			for (n = 1; n <= 7; n++){
				if (positions[n].length <= 1) continue;
				
				for (m = n + 1; m <= 8; m++){
					if (positions[m].length <= 1) continue;
					
					for (l = m + 1; l <= 9; l++){
						if (positions[l].length <= 1) continue;
						
						triple = positions[n].union(positions[m].union(positions[l]));
						if (triple.length != 3) continue;
							
						for (j = 0; j < 9; j++){
							candidates = mask[j].candidates;
							testn = positions[n].contains(j + 1);
							testm = positions[m].contains(j + 1);
							testl = positions[l].contains(j + 1);
							
							if (candidates.length > 1 &&  (testn || testm || testl) && (candidates.length > (testn + testm + testl))){
								changed = true;
								candidates.intersection(new Set([n, m, l]), true);
							}
						}
						
					}
				}
			}
			
			return changed;
		},
		
		pointingPairs = function(){
			var rows = [],
				cols = [],
				pointers, mask;
			
			for (var I = 1; I <= 3; I++){  // foreach block
				for (var J = 1; J <= 3; J++){
					mask = _masks['blocks'][I][J];
					
					for (var n = 1; n <= 9; n++){
						pointers = [];
						
						for (var i = 0; i < 9; i++){
							var info = mask[i],
								candidates = info.candidates,
								contains = candidates.contains(n);
							
							if (contains && candidates.legnth == 1) break;
							
							if (contains){
								pointers.push(info.coords);
								if (pointers.length > 3) break;
							}
						} // for each cell
						
						pointers_length = pointers.length;
						
						if (candidates.legnth == 1 && contains) continue;
						if (pointers_length < 2 || pointers_length > 3) continue;
						var obj = {'n': n, 'pointers': pointers};
						
						if (pointers_length == 2){
							if (pointers[0].i == pointers[1].i) 
								rows.push(obj);
							else if (pointers[0].j == pointers[1].j) 
								cols.push(obj);
						} else {
							if (pointers[0].i == pointers[1].i && pointers[1].i == pointers[2].i){
								rows.push(obj);
							} else if (pointers[0].j == pointers[1].j && pointers[1].j == pointers[2].j){
								cols.push(obj);
							}
						}
							
					} // for 1 - 9
				}
			} // for each block
			
			if (rows.length == 0 && cols.length == 0) return false;
			
			var clean = function(pairs, type){
				var changed = false,
					coord = (type == 'rows') ? 'i' : 'j',
					icoord = (type == 'rows') ? 'j' : 'i',
					n, min_index, max_index,
					mask, candidates, index;

				for (var i = 0; i < pairs.length; i++){
					n = pairs[i].n;
					pointers = pairs[i].pointers;
					mask = _masks[type][pointers[0][coord]];
					min_index = 10;  max_index = -1;
					
					for (var k = 0; k < pointers.length; k++){
						min_index = Math.min(pointers[k][icoord], min_index);
						max_index = Math.max(pointers[k][icoord], max_index);
					}
					
					for (var j = 0; j < 9; j++){
						candidates = mask[j].candidates;
						index = mask[j].coords[icoord];
						
						if ((index < min_index || index > max_index) && candidates.contains(n)){
							candidates.remove(n);
							changed = true;
						}
					}
				}
				return changed;
			};
			
			return clean(rows, 'rows') || clean(cols, 'cols');
		},
		
		clear = function(){
			stopDemo();
			setBar(0);
			for(var i = 1; i <= 9; i++)
				for(var j = 1; j <= 9; j++)
					_cell[i][j].set({'class': '', 'html': ''});
			
			moveSelected(1,1);
		},
		
		setBar = function(percentage){
			document.id('bar').setStyles({
				'width': percentage + "%",
				'background-color': bar_gradient[percentage]
				
			});
		},
		
		toString = function(){
			var string = "",
				candidates, is_user;
			
			for (var i = 1; i <= 9; i++){
				for (var j = 1; j <= 9; j++){
					candidates = _candidates[i][j];
					is_user = _cell[i][j].hasClass('user-defined');
					if (candidates.length == 1 && is_user) string += candidates.toString();
					else  string += "0";
				}
			}
			return string;
		},
		
		fromString = function(string){
			string.replace(/^\s|\s$/, ''); // trim
			
			var regex = /[1-9]/,
				string_length = string.length,
				index, number;
			
			clear();
			
			for (var i = 1; i <= 9; i++){
				for (var j = 1; j <= 9; j++){
					number = string.charAt((j - 1) + ((i - 1)*9));
					if (regex.test(number)){
						moveSelected(i,j);
						writeNumberToSelected(number);
					}
				}
			}
			
			solve();
		};
		
		// initialize the hell out of everything
		var i, j, I, J;
		
		_cell = [];
		_candidates = [];
		for (i = 1; i <= 9; i++){
			_cell[i] = [];
			_candidates[i] = [];
			for (j = 1; j <= 9; j++){
				_cell[i][j] = document.id("c" + i.toString() + j.toString());
				_candidates[i][j] = new Set();
			}
		}
		
		_masks = [];
		_masks['rows'] = [];
		_masks['cols'] = [];
		for (i = 1; i <= 9; i++){
			_masks['rows'][i] = [];
			_masks['cols'][i] = [];
			
			for (j = 1; j <= 9; j++){
				_masks['rows'][i].push({
					'coords': {'i': i, 'j': j},
					'cell': _cell[i][j],
					'candidates': _candidates[i][j]
				});
				_masks['cols'][i].push({
					'coords': {'i': j, 'j': i},
					'cell': _cell[j][i],
					'candidates': _candidates[j][i]
				});
			}
		}
		
		_masks['blocks'] = [];
		for (I = 1; I <= 3; I++){
			_masks['blocks'][I] = [];
			
			for (J = 1; J <= 3; J++){
				_masks['blocks'][I][J] = [];
				
				for (i = 1; i <= 3; i++){
					var abs_i = i + (3 * (I - 1));
					for (j = 1; j <= 3; j++){
						var abs_j = j + (3 * (J - 1));
						_masks['blocks'][I][J].push({
							'cell': _cell[abs_i][abs_j],
							'coords': {'i': abs_i, 'j': abs_j},
							'candidates': _candidates[abs_i][abs_j]
						});
					}
				}
			}
		}
		
		//initialize the key codes array;
		keyCodes = [];
		
		keyCodes[8] = "backspace";
		
		keyCodes[37] = "left"; keyCodes[38] = "up"; 
		keyCodes[39] = "right"; keyCodes[40] = "down";
		
		keyCodes[67] = "c"; keyCodes[68] = "d";
		
		keyCodes[49] = keyCodes[97] = "1"; keyCodes[50] = keyCodes[98] = "2"; 
		keyCodes[51] = keyCodes[99] = "3"; keyCodes[52] = keyCodes[100] = "4"; 
		keyCodes[53] = keyCodes[101] = "5"; keyCodes[54] = keyCodes[102] = "6";
		keyCodes[55] = keyCodes[103] = "7"; keyCodes[56] = keyCodes[104] = "8"; 
		keyCodes[57] = keyCodes[105] = "9";
		
		//the demo stuff:
		demo_frame = 0;
		demo_timer = null;
		demo_keys = [
			[39,39,57,39,40,52,40,50,39,53,38,39,38,49,39,40,53,39,55,39,56,40,57,40,37,52,37,40,51,37,37,37,56,37,38,54,37,56,40,40,55,40,40,57,37,40,52,39,51,39,49,39,38,39,38,54,40,40,39,55,39,38,50,39,39,53],
			[53,39,39,57,39,51,40,56,39,39,39,39,39,38,55,40,40,49,37,53,37,54,40,39,39,53,40,37,49,37,55,40,50,37,37,54,38,50,38,39,49,37,37,37,37,37,52,40,40,49,40,39,52,39,56,40,53,37,54,40,57,39,39,38,52,39,56,38,39,57,39,39,55],
			[40,40,51,39,39,56,39,39,38,39,51,39,50,39,54,38,39,53,40,40,49,37,37,52,40,39,52,40,37,53,40,51,37,49,37,37,52,38,38,53,37,37,37,57,40,54,39,55,40,37,40,49,39,52,40,40,51,39,38,39,49,38,39,50,40,55,40,53,39,56],
			[40,56,39,57,39,52,39,40,57,39,39,53,38,38,54,39,39,50,40,37,53,40,39,49,39,52,40,40,49,37,53,37,37,51,38,50,37,37,56,37,37,37,53,40,40,52,40,40,40,51,39,38,38,50,38,54,39,51,40,56,39,38,49,39,40,55,40,37,50,40,39,39,39,50,39,57,39,38,53,38,37,37,49],
			[39,39,39,51,39,56,39,39,39,39,54,40,37,49,37,57,37,37,37,53,37,37,37,54,40,39,53,40,39,39,39,39,52,39,39,39,49,40,56,37,55,37,37,37,37,37,37,37,52,40,39,50,39,39,39,39,57,39,39,39,40,37,52,37,54,37,37,51,37,55,37,40,37,40,57,39,50,39,39,39,39,39,56],
			[49,40,51,39,38,39,55,39,40,40,49,39,39,38,50,39,52,39,57,39,40,51,40,52,37,37,37,37,49,37,37,54,40,39,52,40,39,53,39,39,39,50,40,40,40,37,53,37,38,56,38,37,54,37,55,40,51,40,37,37,52,37,38,53,39,38,57,38,56],
			[40,57,39,38,55,39,40,52,40,53,40,40,37,51,40,40,40,50,37,40,53,39,39,39,56,38,54,38,51,39,49,38,54,38,37,38,52,38,38,38,39,51,40,40,40,39,53,39,38,50,39,40,54,39,56,40,57,40,40,37,37,53,40,40,52,39,55]
		];
		
		clear();
		moveSelected(1, 1);
	return {
		'setSelected': function(i,j){
			if (isDemoRunning()) return;
			moveSelected(i, j);
		},
		'keyStroke': function(c){
			var key = keyCodes[c];
			
			if (!key) return true;
			
			if (isDemoRunning()) stopDemo();
			else keyPressed(key);
			
			return false;
		},
		'clear': clear,
		'fromString': fromString
	};
};
