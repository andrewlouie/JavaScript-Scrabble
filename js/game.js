$(function() {
  $('.aaburger,li').click(function() {
    $('nav').slideToggle();
  });
  $('#direction').click(function() { $(this).toggleClass('rightArrow') });
  $('.pickatile').click(function() {
    beingdragged.style.left = beingdragged.putleft + 'px';
    beingdragged.style.top = beingdragged.puttop + 'px';
    beingdragged.setAttribute('data-board-position',beingdragged.putsquare);
    beingdragged.setAttribute('data-letter',$(this).html().charCodeAt(0) - 65 + 26);
    beingdragged.childNodes[1].innerHTML = $(this).html();
    $.fancybox.close();
    countScore();
  });

  $('#newgame').click(function() {
    $.fancybox.close()
    updateData(function(currentGame) {
      currentGame.letters.myTiles = [];
      currentGame.letters.computerTiles = [];
      currentGame.letters.remaining = [0,0,0,0,0,0,0,0,0,1,1,2,2,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,5,5,6,6,6,7,7,8,8,8,8,8,8,8,8,8,9,10,11,11,11,11,12,12,13,13,13,13,13,13,14,14,14,14,14,14,14,14,15,15,16,17,17,17,17,17,17,18,18,18,18,19,19,19,19,19,19,20,20,20,20,21,21,22,22,23,24,24,25,26,26];
      currentGame.scores = {};
      currentGame.scores.you = 0;
      currentGame.scores.computer = 0;
      currentGame.board = [];
      $('#doodlepic').attr('src','./include/m0122.gif');
      clearInterval(timer);
      $(".yourscore").text('0');
      $('.computerscore').text('0');
      localStorage.setItem('passes',0);
      localStorage.setItem('timeTaken',0);
      timer = setInterval(function() { localStorage.setItem('timeTaken',parseInt(localStorage.getItem('timeTaken')) + 1); $('.timer').html(localStorage.getItem('timeTaken').toString().toHHMMSS()) },1000);
      $('.timer').html(localStorage.getItem('timeTaken').toString().toHHMMSS());
      $('.tile:not(.pickatile)').remove();
      currentGame.letters = getTiles(currentGame.letters,7,7);
      receiveTiles(currentGame.letters.myTiles);
      $('.computerscore').css('border','1px solid white');
      $('.yourscore').css('border','1px solid green');
      if(typeof(Worker) !== "undefined") {
        if(typeof(w) != "undefined") {
          w.terminate();
        }
      }
      return currentGame;
    });
  });
  $('.exchange').click(function() {
    if (thinking) return;
    exchange = !exchange;
    if (exchange) {
      $('.status').html('Select letters to exchange and press confirm');
      $(this).html('Confirm');
      $('#circlebtn').html('Confirm');
    }
    else if (!$('.tile[data-sel="true"]').length) {
      $('.status').html(' ');
      $(this).html('Exchange');
      $('#circlebtn').html('Play');
    }
    else {
      updateData(function(currentGame) {
        var putBack = [];
        console.log("Before");
        console.log(JSON.stringify(currentGame.letters));
        if (currentGame.letters.remaining < 7) {
          $('.status').html("There aren't enough letters remaining");
          return currentGame;
        }
        $('.tile[data-sel="true"]').each(function() {
          var remtile;
          if (parseInt($(this).attr('data-letter')) >= 26) remtile = 26;
          else remtile = parseInt($(this).attr('data-letter'));
          putBack.push(remtile);
          currentGame.letters.myTiles.splice(currentGame.letters.myTiles.indexOf(remtile),1);
          $(this).remove();
        });
        newLetters = getTiles(currentGame.letters,putBack.length,0).myTiles.slice(currentGame.letters.myTiles.length - putBack.length,currentGame.letters.myTiles.length);
        receiveTiles(newLetters);
        currentGame.letters.remaining = currentGame.letters.remaining.concat(putBack);
        console.log("After");
        console.log(JSON.stringify(currentGame.letters));
        $('.status').html(' ');
        $('.exchange').html('Exchange');
        $('#circlebtn').html('Play');
        return currentGame;
      });
      //I couldn't get this to run onsuccess from the update for some reason so it was updating again from the worker before this was updated. uggh
      setTimeout(function() { if (!$('#solitaire').is(':checked')) confirmTurn(true);
      else countScore(); },500);
    }

  });
  $('td').click(function() {
    if (selectedSpace && selectedSpace.attr('data-table-position') == $(this).attr('data-table-position')) {
      selectedSpace = undefined;
      $(this).css('border-color','white');
    }
    else {
      selectedSpace = $(this);
      $('td').css('border-color','white');
      $(this).css('border-color','green');
    }
  });
  $('.pass').click(function() {
    if (thinking) return;
    if (!$('#solitaire').is(':checked')) confirmTurn(true);
    localStorage.setItem('passes',(parseInt(localStorage.getItem('passes')) || 0) + 1);
  });
  $('#solitaire').click(function() {
    var check = $(this).is(":checked");
    $('#solitaire2').prop('checked',check);
    $('.cscore').css({opacity: (check?"1.0":"0"), visibility: "visible"}).animate({opacity: (check?"0":"1.0")}, 200)
    localStorage.setItem('solitaire',check);
  });
  $('#solitaire2').click(function() { $('#solitaire').click(); })
  $('#main').on('dblclick','.tile',function() {
    if ($(this).attr('draggable') == 'true' && !exchange) {
      var left = parseInt($('#tiles').css('left'),10);
      var top = parseInt($('#tiles').css('top'),10);
      var taken = [];
      $('.tile[draggable="true"]').each(function() {
        taken.push(this.style.left + "-" + this.style.top);
      });
      while (taken.indexOf(left + 'px-' + top + 'px') > -1) {
        if (left > parseInt($('#tiles').css('width'),10) + parseInt($('#tiles').css('left'),10)) { left = parseInt($('#tiles').css('left'),10); top += 60; }
        else left +=60;
      }
      $(this).css('left',left + 'px').css('top',top + 'px').removeAttr('data-board-position');
      if ($(this).attr('data-letter') >= 26) {
        $(this).children().empty();
      }
      taken.push(left + 'px-' + top + 'px');
      countScore();
    }
  });
  $('#main').on('click','.tile',function() {
      if (exchange && $(this).attr('draggable') == 'true') {
        if ($(this).attr('data-sel') == 'true') {
          $(this).css('border','none').attr('data-sel','false');
        }
        else {
          $(this).attr('data-sel','true').css('border','2px solid blue');
        }
      }
      else if ($(this).attr('data-board-position')) {
        $('td[data-table-position="' + $(this).attr('data-board-position') + '"]').click();
      }
      else if (selectedSpace && $(this).attr('draggable') == 'true') {
        var start = parseInt(selectedSpace.attr('data-table-position'));
        var right = $('#direction').hasClass('rightArrow');
        if (right) {
          for (i=start;i<=rowEnd(start);i++) {
            if (!$('.tile[data-board-position="' + i + '"]').length) {
              var td = document.getElementsByTagName('td')[i];
              x = td.getBoundingClientRect().left + 2 + window.pageXOffset;
              y = td.getBoundingClientRect().top + 2 + window.pageYOffset;
              if ($(this).attr('data-letter') >= 26) {
                beingdragged = $(this)[0];
                $('#pickatile').click();
                beingdragged.putleft = x;
                beingdragged.puttop = y;
                beingdragged.putsquare = i;
                return false;
              }
              $(this).attr('data-board-position',i).css('left',x + 'px').css('top',y + 'px');
              countScore();
              break;
            }
          }
        }
        else {
          for (i=start;i<=225;i+=15) {
            if (!$('.tile[data-board-position="' + i + '"]').length) {
              var td = document.getElementsByTagName('td')[i];
              x = td.getBoundingClientRect().left + 2 + window.pageXOffset;
              y = td.getBoundingClientRect().top + 2 + window.pageYOffset;
              if ($(this).attr('data-letter') >= 26) {
                beingdragged = $(this)[0];
                $('#pickatile').click();
                beingdragged.putleft = x;
                beingdragged.puttop = y;
                beingdragged.putsquare = i;
                return false;
              }
              $(this).attr('data-board-position',i).css('left',x + 'px').css('top',y + 'px');
              countScore();
              break;
            }
          }
        }
      }
  });
  $('.undo').click(function() {
    var left = parseInt($('#tiles').css('left'),10);
    var top = parseInt($('#tiles').css('top'),10);
    var taken = [];
    $('.tile[draggable="true"]').each(function() {
      taken.push(this.style.left + "-" + this.style.top);
    });
    $('.tile[data-board-position][draggable="true"]').each(function() {
        while (taken.indexOf(left + 'px-' + top + 'px') > -1) {
          if (left > parseInt($('#tiles').css('width'),10) + parseInt($('#tiles').css('left'),10)) { left = parseInt($('#tiles').css('left'),10); top += 60; }
          else left +=60;
        }
        $(this).css('left',left + 'px').css('top',top + 'px').removeAttr('data-board-position');
        if ($(this).attr('data-letter') >= 26) {
          $(this).children().empty();
        }
        taken.push(left + 'px-' + top + 'px');
    });
    countScore();
  });
  $(".confirm").click(confirmTurn);
});
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
String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (isNaN(hours)) time = "00:00:00";
    else var time    = hours+':'+minutes+':'+seconds;
    return time;
}
function receiveTiles(tiles) {
  var left = parseInt($('#tiles').css('left'),10);
  var top = parseInt($('#tiles').css('top'),10);
  var taken = [];
  $('.tile[draggable="true"]').each(function() {
    taken.push(this.style.left + "-" + this.style.top);
  });
  for (j=0;j<tiles.length;j++) {
    while (taken.indexOf(left + 'px-' + top + 'px') > -1) {
      if (left > parseInt($('#tiles').css('width'),10) + parseInt($('#tiles').css('left'),10)) { left = parseInt($('#tiles').css('left'),10); top += 60; }
      else left +=60;
    }
    taken.push(left + 'px-' + top + 'px');
    var letter = String.fromCharCode(parseInt(tiles[j]) + 65);
    var value = points[tiles[j]];
    if (value == 0) value = "",letter="";
    $('<span/>', {
      class: 'no',
      text: value
    }).appendTo($('<div/>',{ class: 'card__front',text: letter }).appendTo($('<div/>', {
        class: 'tile effect__click flipped',
        draggable: 'true',
        'data-letter': tiles[j],
        'data-points': value,
        style: 'left:' + left + "px;top:" + top + 'px',
    }).append($('<div/>',{ class: 'card__back' })).appendTo("#main")));
  }
  $cards = $('.flipped');
  var time = 500;
  $cards.each(function() {
      var ugghthis = $(this);
      setTimeout( function(){ ugghthis.removeClass('flipped'); }, time)
      time += 500;
  });
}
function dbInit() {
  //saved in IndexedDB
  var board = [];
  var letters = { remaining : [],myTiles: [],computerTiles: [] };
  var scores = { you: 0,computer: 0 };
  var game = {key:"key",board:board,letters:letters,scores:scores};
  const dbName = "NewerScrabbleDB";
  var request = indexedDB.open(dbName, 2);
  request.onerror = function(event) {
    $('.status').html("Something went wrong " + event.target.errorCode);
  };
  request.onsuccess = function(event) {
    db = event.target.result;
    $('.status').html("Have fun!");
    getData(loadGame);
    var transaction = db.transaction(["game"], "readwrite")
    var objectStore = transaction.objectStore("game");
      var request = objectStore.add(game);
      request.onsuccess = function(event) {
        // event.target.result == customerData[i].ssn;
      };
      transaction.oncomplete = function(event) {
        console.log("DB created successfully")
        $('#newgame').click();
      };
      transaction.onerror = function(event) {
        //$('.status').html("Something went wrong, try reloading");
      }
  };
  request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("game", { keyPath: "key" });
    objectStore.createIndex("board", "board", { unique: false });
    objectStore.createIndex("letters", "letters", { unique: false });
    objectStore.createIndex("scores", "scores", { unique: false });
    $('.status').html("There may be a problem with your browser");
  };
}
function getData(callback) {
  var transaction = db.transaction(["game"]);
  var objectStore = transaction.objectStore("game");
  var request = objectStore.get("key");
  request.onerror = function(event) {
    $('.status').html("Error: Something went wrong");
  };
  request.onsuccess = function(event) {
    var game = request.result;
    if (game && game.letters.myTiles.length) callback(game);
    else $('#newgame').click();
  };
}
function updateData(updaterFunction) {
  var objectStore = db.transaction(["game"], "readwrite").objectStore("game");
  var request = objectStore.get("key");
  request.onerror = function(event) {
    $('.status').html('Something went wrong');
  };
  request.onsuccess = function(event) {
  var data = updaterFunction(request.result);
  var requestUpdate = objectStore.put(data);
   requestUpdate.onerror = function(event) {
     $('.status').html('Something went wrong');
   };
   requestUpdate.onsuccess = function(event) {

   };
};
}
function loadGame(savedGame) {
  $(".yourscore").text(savedGame.scores.you);
  $('.computerscore').text(savedGame.scores.computer);
  if (localStorage.getItem('timeTaken')) $('.timer').html(localStorage.getItem('timeTaken').toString().toHHMMSS());
  timer = setInterval(function() { localStorage.setItem('timeTaken',parseInt(localStorage.getItem('timeTaken')) + 1); $('.timer').html(localStorage.getItem('timeTaken').toString().toHHMMSS()) },1000);
  receiveTiles(savedGame.letters.myTiles);
  putTiles(savedGame.board);
  $('.tile').show();
  if (localStorage.getItem('solitaire') == 'true') $('#solitaire').click();
}
function putTiles(board) {
  for (i=0;i<board.length;i++) {
    if (board[i] != null) {
      var td = document.getElementsByTagName('td')[i];
      x = td.getBoundingClientRect().left + 2 + window.pageXOffset;
      y = td.getBoundingClientRect().top + 2 + window.pageYOffset;
      var letter;
      var value;
      if (board[i] >=26) { letter = String.fromCharCode(board[i] + 65 - 26); value = ""; }
      else { letter = String.fromCharCode(board[i] + 65); value = points[board[i]]; }
      $('<span/>', {
        class: 'no',
        text: value
      }).appendTo($('<div/>',{ class: 'card__front',text: letter }).appendTo($('<div/>', {
          class: 'tile effect__click',
          draggable: 'false',
          'data-letter': tiles[j],
          'data-points': value,
          'data-board-position': i,
          style: 'left:' + x + "px;top:" + y + 'px;display:none',
      }).append($('<div/>',{ class: 'card__back' })).appendTo("#main")));
    }
  }
}
function confirmTurn(pass) {
  if (exchange) { $('.exchange:eq(1)').click(); return; }
  if (thinking) return;
  if (pass === true || $('.tile[draggable="true"][data-board-position]').length) {
    newLetters = [];
    if (pass === true && !$('#solitaire').is(':checked')) {
      //take any tiles off the board before the computer plays
      $('.undo:eq(1)').click();
    }
    else {
      $('.tile[draggable="true"][data-board-position]').each(function() {
        newLetters[$(this).attr('data-board-position')] = parseInt($(this).attr('data-letter'));
      });
    }
    if(typeof(Worker) !== "undefined") {
      if(typeof(w) == "undefined") {
        w = new Worker("js/worker.js");
      }
       $('.status').html('Computer is thinking...');
       thinking = true;
       $('#doodlepic').attr('src','./include/m1708.gif');
       $('.computerscore').css('border','1px solid green');
       $('.yourscore').css('border','1px solid white');
       w.postMessage({ newLetters: newLetters,solitaire: $('#solitaire').is(':checked'),checkOnly:false });
       w.onmessage = function(event) {
          if (event.data.Error) $('.status').html(event.data.Error);
          else {
            $('.tile[draggable="true"][data-board-position]').each(function() {
              $(this).attr('draggable','false');
            });
            response = event.data;
            receiveTiles(response.yourNewTiles);
            $('.yourscore').html(response.yourScore);
            $('.computerscore').html(response.computerScore);
            putTiles(response.boardNewTiles);
            $cards = $('.tile:hidden:not(.pickatile)');
            var time = 500;
            $cards.each(function(index) {
                var ugghthis = $(this);
                if (index +1 == $cards.length) setTimeout(function(){ ugghthis.show(); $cards.children().addClass('highlight'); }, time)
                else setTimeout(function(){ ugghthis.show(); }, time)
                time += 500;
            });
            $('.status').html(response.message);
            countScore();
            if (response.passed) localStorage.setItem('passes',(parseInt(localStorage.getItem('passes')) || 0) + 1);
            else localStorage.setItem('passes',0);
            if (parseInt(localStorage.getItem('passes')) > 3 || response.gameOver == true) {
              gameOver();
            }
          }
          thinking = false;
          $('#doodlepic').attr('src','./include/m0122.gif');
          $('.computerscore').css('border','1px solid white');
          $('.yourscore').css('border','1px solid green');
      };
    }
    else {
      document.getElementById("status").innerHTML = "Sorry, your browser does not support Web Workers...";
    }
  }
  else $('.status').html("You haven't made a move");
}
function gameOver() {
  updateData(function(currentGame) {
    var extra = 0;
    for (i=0;i<currentGame.letters.computerTiles.length;i++) {
      var tile = (currentGame.letters.computerTiles[i] > 25 ? 26 : currentGame.letters.computerTiles[i]);
      extra += points[tile];
    }
    currentGame.scores.computer -= extra;
    var extrame = 0;
    for (i=0;i<currentGame.letters.myTiles.length;i++) {
      var tile = (currentGame.letters.myTiles[i] > 25 ? 26 : currentGame.letters.myTiles[i]);
      extrame += points[tile];
    }
    currentGame.scores.you -= extrame;
    if (currentGame.letters.computerTiles.length == 0) {
      currentGame.scores.computer += extrame;
    }
    else if (currentGame.letters.myTiles.length == 0) {
      currentGame.scores.you += extra;
    }
    $('.yourscore').html(currentGame.scores.you).css('border','1px solid white');
    $('.computerscore').html(currentGame.scores.computer).css('border','1px solid white');
    if (currentGame.scores.you > currentGame.scores.computer) $('#doodlepic').attr('src','./include/t2036.gif');
    else $('#doodlepic').attr('src','./include/m1522.gif');
    return currentGame;
  });
  $('.status').html("Game over");
}
function rowEnd(num) {
  if (num > 0) return Math.ceil((num + 1)/15.0) * 15 - 1;
  return 15;
}
