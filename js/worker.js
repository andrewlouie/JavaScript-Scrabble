var points = [1,3,3,2,1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10,0];
var tripleWord = [0,7,14,105,119,210,217,224];
var doubleLetter = [3,11,36,38,45,52,59,92,96,98,102,108,116,122,126,128,132,165,172,179,186,188,213,221];
var doubleWord = [16,32,48,64,28,42,56,70,208,192,176,160,196,182,168,154];
var tripleLetter = [20,24,76,80,84,88,136,140,144,148,200,204];
var passed = false;
var trie = function() {
    this.head = {};
};

trie.prototype.validate = function(word) {
    if((word === undefined) || (word === null)) throw "The given word is invalid.";
    if (typeof word !== "string") throw "The given word is not a string";
}

trie.prototype.add = function(word) {
    this.validate(word);

    var current = this.head;

    for (var i = 0; i < word.length; i++) {
        if(!(word[i] in current)) {
            current[word[i]] = {};
        }

        current = current[word[i]]
    };

    current.$ = 1;  //word end marker
};
trie.prototype.hasWord = function(word) {
    this.validate(word);

    var current = this.head;

    for (var i = 0; i < word.length; i++) {
        if(!(word[i] in current)) {
            return false;
        }

        current = current[word[i]]
    };

    return current.$ === 1; //word end marker
};

trie.prototype.getLetters = function(avail,checkt,blanks) {
    var len = checkt.length;
    var result = [];
    var availLetters = avail.split("");
    var count = 0;
    this.validate(avail);
    var current = this.head;
    //for each letter in 'avail', at 0, call 'eachWord', see if it's possible to continue until the 'len'
    // passing letter we're at (0), remaining 'avail' and remaining 'checkt'
    if (checkt[0] == "?") {
      for (j=0;j<availLetters.length;j++) {
        var lett = availLetters[j];
        var remLett = availLetters.slice();
        remLett.splice(j,1);
        eachWord(lett,remLett,1,current,blanks);
      }
      if (blanks > 0) {
        for (var k=0;k<26;k++) {
          var remAgain = availLetters.slice();
          eachWord(String.fromCharCode(65 + k),remAgain,1,current,blanks-1);
        }
      }
    }
    else if (availLetters.indexOf(checkt[0]) > -1) {
      availLetters.splice(availLetters.indexOf(checkt[0]),1);
      eachWord(checkt[0],availLetters,1,current,blanks);
    }
    return result;

    function eachWord(first,remAvail,position,currentL,Blanks) {
      if (!(first.substr(first.length-1) in currentL)) {
        return;
      }
      //if position == length, only check current.$ === 1
      currentL = currentL[first.substr(first.length-1)];
      if (position == len) {
          if (currentL.$ === 1 && result.indexOf(first) == -1) result.push(first);
        return;
      }
      //if checkt has a letter at 'position', only check that.
      if (checkt[position] == "?") {
        for (var i=0;i<remAvail.length;i++) {
          var newFirst = first + remAvail[i];
          var remAgain = remAvail.slice();
          remAgain.splice(i,1);
          eachWord(newFirst,remAgain,position + 1,currentL,Blanks);
        }
        if (Blanks > 0) {
          for(var l=0;l<26;l++) {
            var remAgain2 = remAvail.slice();
            var newFirst3 = first + String.fromCharCode(65 + l);
            eachWord(newFirst3,remAgain2,position + 1,currentL,Blanks-1);
          }
        }
      }
      else if (remAvail.indexOf(checkt[position]) > -1) {
        var newFirst2 = first + checkt[position];
        remAvail.splice(remAvail.indexOf(checkt[position]),1);
        eachWord(newFirst2,remAvail,position+1,currentL);
      }
    };
};
var checker;
onmessage = function(e) {
  passed = false;
  response = {};
  var newTiles = e.data.newLetters;
  var solitaire = e.data.solitaire;
  var checkOnly = e.data.checkOnly;
  var currentGame = e.data.currentG;
  if (!checker) {
    var file = "../TWL06.txt";
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", file, false);
    xmlhttp.send();
    words = xmlhttp.responseText.split("\r\n");
    checker = new trie();
    for (w in words) {
      checker.add(words[w]);
    }
  }
  if (checkOnly) {
      if (currentGame.error) { response.Error = currentGame.error; postMessage(response); return; }
      var count = 0;
      for (i=0;i<newTiles.length;i++) {
        if (newTiles[i] != null) count++;
        if (newTiles[i] != null && currentGame.board[i] != null) { count = 0; break; }
      }
      var newLetters = [];
      var boardNewTiles = [];
      if (count) {
        var verify = verifyMove(currentGame,newTiles);
        if (!verify || !verify.newwords.length) { response.Score = 0; }
        else {
          var newwords = verify.newwords;
          var score = verify.score;
          if (!verifyWords(newwords)) { response.Score = 0; }
          else response.Score = score;
        }
      }
      postMessage(response);
      return;
  };
    if (currentGame != null && currentGame.error) { response.Error = currentGame.error; postMessage(response); return; }
    //if there are no newTiles we can go right to the computer's turn... gotta count them though I guess
    var count = 0;
    for (i=0;i<newTiles.length;i++) {
      if (newTiles[i] != null) count++;
      if (newTiles[i] != null && currentGame.board[i] != null) { count = 0; response.Error = "Oops, trying to place a tile on top of another"; break; }
    }
    var newLetters = [];
    var boardNewTiles = [];
    var message = "";
    if (count) {
      var verify = verifyMove(currentGame,newTiles);
      if (!verify || !verify.newwords.length) { response.Error = "Not a valid move"; }
      else {
        var newwords = verify.newwords;
        var score = verify.score;
        if (!verifyWords(newwords)) { response.Error = "Not a valid word"; }
        else {
          //add to the score
          currentGame.scores.you += score;
          //save tiles to the board, remove them from the player's tiles
          for (i=0;i<newTiles.length;i++) {
            if (newTiles[i] != null) {
              currentGame.board[i] = newTiles[i];
              var remtile;
              if (newTiles[i] >= 26) remtile = 26;
              else remtile = newTiles[i];
              currentGame.letters.myTiles.splice(currentGame.letters.myTiles.indexOf(remtile),1);
            }
          }
          var oldLetters = currentGame.letters.myTiles.slice();
          //assign new tiles, add them to yourNewTiles
          var redoLetters = getTiles(currentGame.letters,count,0);
          for (z=oldLetters.length;z<currentGame.letters.myTiles.length;z++) {
            newLetters.push(currentGame.letters.myTiles[z]);
          }
        }
      }
    }
    if (!response.Error) {
      if (!solitaire) {
        var comp = computerTurn(currentGame);
        boardNewTiles = comp.boardNewTiles;
        var count3 = 0;
        for (i=0;i<boardNewTiles.length;i++) {
          if (boardNewTiles[i] != null) {
            currentGame.board[i] = boardNewTiles[i];
            var remtile;
            if (boardNewTiles[i] >= 26) remtile = 26;
            else remtile = boardNewTiles[i];
            currentGame.letters.computerTiles.splice(currentGame.letters.computerTiles.indexOf(remtile),1);
            count3++;
          }
        }
        if (count3 > 0) { currentGame.letters = getTiles(currentGame.letters,0,count3); }
        else if (!passed) {
          var putBack = currentGame.letters.computerTiles;
          message = "Computer exchanged letters";
          currentGame.letters.computerTiles = [];
          currentGame.letters = getTiles(currentGame.letters,0,7);
          currentGame.letters.remaining = currentGame.letters.remaining.concat(putBack);
        }
        else message = "Computer passed";
        currentGame.scores.computer = comp.computerScore;
      }
    }
    if (currentGame.letters.remaining.length == 0 && (currentGame.letters.computerTiles.length == 0 || currentGame.letters.myTiles.length == 0)) response.gameOver = true;
    response.message = message;
    response.yourScore = currentGame.scores.you;
    response.computerScore = currentGame.scores.computer;
    response.boardNewTiles = boardNewTiles;
    response.yourNewTiles = newLetters;
    response.passed = passed;
    response.currentG = currentGame;
    postMessage(response);
};
function computerTurn(currentGame) {
  var boardNewTiles = [];
  var board = currentGame.board;
  var totalscore = currentGame.scores.computer;
  var cTiles = currentGame.letters.computerTiles;
  //put the computer tiles into a string
  var comptiles = "";
  var blanks = 0;
  for (b=0;b<cTiles.length;b++) {
    if (cTiles[b] == 26) blanks++;
    else comptiles += String.fromCharCode(cTiles[b] + 65);
  }
  var availableV = [];
  var availableH = [];
  if (!board.length) {
    availableH.push({position:112,lengths:[2,3,4,5,6,7]});
  }
  else {
    //for each square, check down & across if it connects with another tile on the board with the number of letters I have
  for (c=0;c<225;c++) {
      //steps is the minimum number of steps required to connect to another tile on the board from this tile
      var steps = 1;
      var used = 0;
      var possibilities = [];
      var goingDown = c;
      var connected = false;
      //if it's at the top of the board or the tile above it isn't taken
      if (goingDown > 15 || board[goingDown - 15] == null) {
        while (goingDown < 225) {
            //next tile has to be empty, or the edge of the board
            //we have to use at least one tile
            //it has to be connected on that tile or another one on the board
            if ((goingDown > 209 || board[goingDown + 15] == null) && (board[goingDown] == null || used > 0) && (connected || fourSides(goingDown)) ) {
              connected = true;
              if (steps > 1 && (used < cTiles.length || (used == cTiles.length && board[goingDown] != null))) possibilities.push(steps);
            }
            steps++;
            if (board[goingDown] == null) used++;
            goingDown += 15;
        }
      }
      if (possibilities.length) { availableV.push({position:c,lengths:possibilities}); }
      //same for horizontal
      var steps = 1;
      var used = 0;
      var possibilities = [];
      var goingRight = c;
      var connected = false;
      //if it's at the left of the board or the tile above it isn't taken
      if (goingRight % 15 == 0 || board[goingRight-1] == null) {
        while (goingRight <= rowEnd(c)) {
            //next tile has to be empty, or the edge of the board
            //we have to use at least one tile
            //it has to be connected on that tile or another one on the board
            if ((goingRight == rowEnd(goingRight)  || board[goingRight + 1] == null) && (board[goingRight] == null || used > 0) && (connected || fourSides(goingRight)) ) {
              connected = true;
              if (steps > 1 && (used < cTiles.length || (used == cTiles.length && board[goingRight] != null))) possibilities.push(steps);
            }
            if (board[goingRight] == null) used++; //1
            steps++;
            goingRight++;
        }
      }
      if (possibilities.length) { availableH.push({position:c,lengths:possibilities}); }
    }
  }
  var coptions = [];
  //start an down word with combination of letters that will fit on the board, starting with the minimum to the maximum
  for(aax=0;aax<availableV.length;aax++) {
    //getLetters will return all the words that have the characters on the board in the right place and are actual words
    boardtiles = "";
    for (aa=0;aa<availableV[aax].lengths[availableV[aax].lengths.length - 1];aa++) {
      var aabt;
      if (board[availableV[aax].position + (15*aa)] >= 26) aabt = board[availableV[aax].position + (15*aa)] - 26;
      else aabt = board[availableV[aax].position + (15*aa)];
      if (aabt != null) { boardtiles += String.fromCharCode(aabt + 65); }
      else boardtiles += "?";
    }
    for (ato=0;ato<availableV[aax].lengths.length;ato++) {
      var o = availableV[aax].lengths[ato];
      var checkt = boardtiles.substring(0,o);
      var aw = checker.getLetters(comptiles + checkt.replace(/[?]/g,""),checkt,blanks);
      //for each valid word, do the full check (checking other small words) and get the score for valid ones
      for (axy=0;axy<aw.length;axy++) {
        var newCTiles = [];
        var hh = 0;
        var pointer = availableV[aax].position;
        while (hh<aw[axy].length) {
          if (board[pointer] == null) {
            if (blanks > 0 && cTiles.indexOf(aw[axy].charCodeAt(hh) -65) == -1) newCTiles[pointer] = aw[axy].charCodeAt(hh) - 65 + 26;
            else newCTiles[pointer] = aw[axy].charCodeAt(hh) - 65;
          }
          hh++;
          pointer += 15;
        }
        var cverify = verifyMove(currentGame,newCTiles);
        if (cverify && verifyWords(cverify.newwords)) coptions.push({ points: cverify.score,move:newCTiles });
        //If it's valid:add an object to an array with the main word, starting position and down or across.
      }
    }
  }
  //do the same for across words
  for(aax=0;aax<availableH.length;aax++) {
    //getLetters will return all the words that have the characters on the board in the right place and are actual words
    boardtiles = "";
    for (aa=0;aa<availableH[aax].lengths[availableH[aax].lengths.length -1];aa++) {
      var aabt;
      if (board[availableH[aax].position + aa] >= 26) aabt = board[availableH[aax].position + aa] - 26;
      else aabt = board[availableH[aax].position + aa];
      if (aabt != null) { boardtiles += String.fromCharCode(aabt + 65); }
      else boardtiles += "?";
    }
    for (ato=0;ato<availableH[aax].lengths.length;ato++) {
      var o = availableH[aax].lengths[ato];
      var checkt = boardtiles.substring(0,o);
      var aw = checker.getLetters(comptiles + checkt.replace(/[?]/g,""),checkt,blanks);
      //for each valid word, do the full check (checking other small words) and get the score for valid ones
      for (ayy=0;ayy<aw.length;ayy++) {
        var newCTiles = [];
        var hh = 0;
        var pointer = availableH[aax].position;
        while (hh<aw[ayy].length) {
          if (board[pointer] == null) {
            if (blanks > 0 && cTiles.indexOf(aw[ayy].charCodeAt(hh) - 65) == -1) newCTiles[pointer] = aw[ayy].charCodeAt(hh) - 65 + 26;
            else newCTiles[pointer] = aw[ayy].charCodeAt(hh) - 65;
          }
          hh++;
          pointer++;
        }
        var cverify = verifyMove(currentGame,newCTiles);
        if (cverify && verifyWords(cverify.newwords)) coptions.push({ points: cverify.score,move:newCTiles });
        //If it's valid:add an object to an array with the main word, starting position and down or across.
      }
    }
  }
  if (coptions.length == 0) {
    //computer has to exchange all letters if possible, otherwise pass
    if (currentGame.letters.remaining < 7) passed = true;
  }
  var highestscore = { points: 0,move: [] }
  //find the one with the most points, add to boardNewTiles, add score to totalscore
  for (fh=0;fh<coptions.length;fh++) {
    if (coptions[fh].points > highestscore.points || (coptions[fh].points == highestscore.points && Math.round(Math.random()))) { highestscore.points = coptions[fh].points; highestscore.move = coptions[fh].move; }

  }
  boardNewTiles = highestscore.move;
  totalscore += highestscore.points;

  function fourSides(r) {
    //right
    if (r<rowEnd(r) && board[r + 1] != null) return true;
    //left
    if (r%15 && board[r - 1] != null) return true;
    //up
    if (r > 14 && board[r - 15] != null) return true;
    //down
    if (r < 210 && board[r + 15] != null) return true;
    return false;
  }
  return {computerScore:totalscore,boardNewTiles:boardNewTiles}
}
function verifyMove(currentGame,newTiles) {
  var newwords = [];
  //check if new word is horizontal or vertical in new tiles... to verify all the letters placed are one way.
  var vertical = 0;
  var horizontal = 0;
  var doneh = false;
  var donev = false;
  var firsttile = true;
  var turnscore = 0;
  for (i=0;i<newTiles.length;i++){
    if (newTiles[i] != null) {
      //found the first tile
      if (firsttile) {
        //this variable to check if there is a space between new tiles in row/column
        var space = false;
        var space2 = false;
        var problem = false;
        //check if there are other new tiles in both the row and column, if so, it's invalid
        for (k=i+1;k<=rowEnd(i);k++) {
          if (newTiles[k] != null) { horizontal += 1; if (space) problem = true; }
          else if (tile(k) == null) space = true;
        }
        //check columns
        for (k=i+15;k<225;k+=15) {
          if (newTiles[k] != null) { vertical += 1; if (space2) problem = true; }
          else if (tile(k) == null) { space2 = true; }
        }
        if (horizontal > 0 && vertical > 0) return false;
        //count the total number of new tiles
        var count = 0;
        for (p=0;p<newTiles.length;p++) { if (newTiles[p] != null) count++; }
        //check if there are other new tiles in neither the row or the column of the first new tile, if so, it's invalid
        if (horizontal + vertical + 1 != count) return false;
        //check if any of the new tiles in the row or column are not connected to the others
        if (problem) return false;
        //count all the letters already on the board
        count2 = 0;
        var firstmove = false;
        for (q=0;q<currentGame.board.length;q++) { if (currentGame.board[q] != null) count2++; }
        //if there aren't any, make sure there is a newtile covering the star
        if (!count2) {
          if (newTiles[112] == null) return false;
          else firstmove = true;
        }
        //otherwise make sure it uses at least one board letter
        else {
          var check = false;
          //loop through new tiles again
          for (r=0;r<newTiles.length;r++){
            //find ones that aren't null
            if (newTiles[r] != null) {
              //check 4 sides for board tiles
              //right
              if (r<rowEnd(r) && currentGame.board[r + 1] != null) check = true;
              //left
              else if (r%15 && currentGame.board[r - 1] != null) check = true;
              //up
              else if (r > 14 && currentGame.board[r - 15] != null) check = true;
              //down
              else if (r < 210 && currentGame.board[r + 15] != null) check = true;
              if (check) break;
            }
          }
          if (!check) return false;
        }
        //don't need to do the firsttile verification again
        firsttile = false;
      }
      //if a horizontal word hasn't been made yet, or more than one new letter was placed vertically, we need to make a horizontal word:
      if (!doneh || !horizontal) {
        var score = 0;
        //make j the new pointer
        var j = i;
        //start the word blank
        var word = "";
        //go to the first letter horizontally but not to pass the beginning of the row
        while (tile(j-1) != null && j%15) j--;
        //if there is no horizon word for that letter, carry on and check vertical
        if (tile(j+1) != null && j < rowEnd(j)) {
          //otherwise, add each letter to a word
          var dw = 0;
          var tw = 0;
          while (tile(j) != null) {
            //if it's a blank tile, the character code is an extra 26. Mostly so we don't count points for it and so it can be removed from myTiles array
            if (tile(j) >= 26) word += String.fromCharCode(tile(j) + 65 - 26);
            else word += String.fromCharCode(tile(j) + 65);
            //we'll also get the score while doing this.  first score each tile
            score += getPoints(tile(j),j);
            //check for triple word scores
            if (tripleWord.indexOf(j) > -1) tw++;
            //check for double word scores
            if (doubleWord.indexOf(j) > -1) dw++;
            j++;
          }
          //for each double word score, multiply by 2
          for (y=0;y<dw;y++) score = score * 2;
          //for each triple word score, multiply by 3
          for (y=0;y<tw;y++) score = score * 3;
          //if it's the first play on the board, multiply by 2.
          if (firstmove) score = score * 2;
          //add to the turn score;
          turnscore += score;
          //add the word to an array
          newwords.push(word);
          //note that a horizontal word was made
          doneh = true;
        }
      }
      //if a vertical word hasn't been made yet, or more than one new letter was placed horizontally, we need to make a vertical word:
      if (!donev || !vertical) {
        var score = 0;
        //reset word variable
        var word = "";
        //reset pointer to initial new letter
        var j = i;
        //go to the first letter vertically but not to pass the beginning of the column
        while (j>14 && tile(j-15) != null) j -= 15;
        //if there is no vertical word for that letter, carry on
        if (tile(j+15) != null) {
            var dw = 0;
            var tw = 0;
            //otherwise, add each letter to a word
            while (tile(j) != null) {
              //if it's a blank tile, the character code is an extra 26. Mostly so we don't count points for it and so it can be removed from myTiles array
              if (tile(j) >= 26) word += String.fromCharCode(tile(j) + 65 - 26);
              else word += String.fromCharCode(tile(j) + 65);
              //we'll also get the score while doing this.  first score each tile
              score += getPoints(tile(j),j);
              //check for triple word scores
              if (tripleWord.indexOf(j) > -1) tw++;
              //check for double word scores
              if (doubleWord.indexOf(j) > -1) dw++;
              j += 15;
            }
            //for each double word score, multiply by 2
            for (y=0;y<dw;y++) score = score * 2;
            //for each triple word score, multiply by 3
            for (y=0;y<tw;y++) score = score * 3;
            //if it's the first play on the board, multiply by 2.
            if (firstmove) score = score * 2;
            //add the word to an array
            turnscore += score;
            //add the word to an array
            newwords.push(word);
            //note that a horizontal word was made
            donev = true;
        }
    }

  }
  //return either the new tile or the board tile
  function tile(pos) {
    if (newTiles[pos] != null) return newTiles[pos];
    return currentGame.board[pos];
  }
}
  //50 bonus points for using all 7 tiles
  if (count == 7) turnscore += 50;
  return { newwords:newwords,score:turnscore };
}
function verifyWords(newwords) {
  //check the new words are in the dictionary
  for (n=0;n<newwords.length;n++) {
    if (!checker.hasWord(newwords[n])) return false;
  }
  return true;
}
function getTiles(letters,youNum,computerNum) {
  for (i=0;i<youNum&&letters.remaining.length>0;i++) {
    var random = Math.floor(Math.random() * letters.remaining.length) + 0;
    letters.myTiles.push(letters.remaining[random]);
    letters.remaining.splice(random,1);
  }
  for (i=0;i<computerNum&&letters.remaining.length>0;i++) {
    var random = Math.floor(Math.random() * letters.remaining.length) + 0;
    letters.computerTiles.push(letters.remaining[random]);
    letters.remaining.splice(random,1);
  }
  return letters;
}
//return number of points
function getPoints(letter,position) {
  var pts;
  if (letter >= 26) pts = 0;
  else pts = points[letter];
  if (doubleLetter.indexOf(position) > -1) pts = pts * 2;
  else if (tripleLetter.indexOf(position) > -1) pts = pts * 3;
  return pts;
}
//return row end
function rowEnd(num) {
  if (num > 0) return Math.ceil((num + 1)/15.0) * 15 - 1;
  return 15;
}
