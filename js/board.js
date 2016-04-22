function drawBoard() {
$.each(tripleWord,function(index,value) {
  $('td:eq(' + value + ')').css('background-color','#F65464').html("<span class='arrow_up arrowpink arrow a1of3'></span><span class='arrow_up arrowpink arrow a2of3'></span><span class='arrow_up arrowpink arrow a3of3'></span><span class='arrow_down arrowpink arrow a1of3'></span><span class='arrow_down arrowpink arrow a2of3'></span><span class='arrow_down arrowpink arrow a3of3'></span><span class='arrow_left arrowpink arrow a1of3'></span><span class='arrow_left arrowpink arrow a2of3'></span><span class='arrow_left arrowpink arrow a3of3'></span><span class='arrow_right arrowpink arrow a1of3'></span><span class='arrow_right arrowpink arrow a2of3'></span><span class='arrow_right arrowpink arrow a3of3'></span>TRIPLE WORD SCORE");
});
$.each(doubleLetter,function(index,value) {
  $('td:eq(' + value + ')').css('background-color','#C3E7F4').html("<span class='arrow_up arrowlb arrow a1of2'></span><span class='arrow_up arrowlb arrow a2of2'></span><span class='arrow_down arrowlb arrow a1of2'></span><span class='arrow_down arrowlb arrow a2of2'></span><span class='arrow_left arrowlb arrow a1of2'></span><span class='arrow_left arrowlb arrow a2of2'></span><span class='arrow_right arrowlb arrow a1of2'></span><span class='arrow_right arrowlb arrow a2of2'></span>DOUBLE LETTER SCORE");
});
$.each(doubleWord,function(index,value) {
  $('td:eq(' + value + ')').css('background-color','#F3AFBA').html("<span class='arrow_up arrowlp arrow a1of2'></span><span class='arrow_up arrowlp arrow a2of2'></span><span class='arrow_down arrowlp arrow a1of2'></span><span class='arrow_down arrowlp arrow a2of2'></span><span class='arrow_left arrowlp arrow a1of2'></span><span class='arrow_left arrowlp arrow a2of2'></span><span class='arrow_right arrowlp arrow a1of2'></span><span class='arrow_right arrowlp arrow a2of2'></span>DOUBLE WORD SCORE");
});
$.each(tripleLetter,function(index,value) {
  $('td:eq(' + value + ')').css('background-color','#60B5DA').html("<span class='arrow_up arrowblue arrow a1of3'></span><span class='arrow_up arrowblue arrow a2of3'></span><span class='arrow_up arrowblue arrow a3of3'></span><span class='arrow_down arrowblue arrow a1of3'></span><span class='arrow_down arrowblue arrow a2of3'></span><span class='arrow_down arrowblue arrow a3of3'></span><span class='arrow_left arrowblue arrow a1of3'></span><span class='arrow_left arrowblue arrow a2of3'></span><span class='arrow_left arrowblue arrow a3of3'></span><span class='arrow_right arrowblue arrow a1of3'></span><span class='arrow_right arrowblue arrow a2of3'></span><span class='arrow_right arrowblue arrow a3of3'></span>TRIPLE LETTER SCORE");
});
$('td:eq(112)').html('&#9733;').addClass('star').css('background-color','#F3AFBA');
$('td').each(function(value,index) { $(this).attr('data-table-position',value) });
}
var beingdragged;
$(function() {
  $( window ).resize(function() {
    $('.tile').each(function() {
      var x,y;
      if ($(this)[0].hasAttribute('data-board-position')) {
        var target = $('td[data-table-position="' + $(this).attr('data-board-position') + '"]')[0];
        x = target.getBoundingClientRect().left + 2 + window.pageXOffset;
        y = target.getBoundingClientRect().top + 2 + window.pageYOffset;
      }
      else {
        var startl = parseInt($('#tiles').css('left'),10);
        var startt = parseInt($('#tiles').css('top'),10);
        var tilesw = parseInt($('#tiles').css('width'),10);
        var tilel = parseInt($(this).css('left'),10);
        var tilet = parseInt($(this).css('top'),10);
        if (tilel < startl) {
          x = tilel - 10 + startl;//have to move it up
          y = tilet - 670 + startt;

        }
        else if (tilet < startt) {
          x = tilel - 660 + startl;
          y = tilet - 200 + startt;
          //have to move it down
        }
      }
      $(this)[0].style.left = x + 'px';
      $(this)[0].style.top = y + 'px';
    });
  });
  drawBoard();
  if (Modernizr.indexeddb) dbInit();
  else $(".status").html("Your browser is not supported");
  if (!Modernizr.applicationcache || !Modernizr.postmessage || !Modernizr.cssanimations || !Modernizr.webworkers || !Modernizr.boxshadow) {
    $(".status").html("Your browser may not be supported");
  }

  $('#main').on('dragstart','.tile',drag_start);
  document.body.addEventListener('dragover',drag_over,false);
  document.body.addEventListener('drop',drop,false);
});
function drag_start(event) {
    beingdragged = event.target;
    if (thinking && beingdragged.hasAttribute('data-board-position')) { event.preventDefault(); return; }
    var style = window.getComputedStyle(event.target, null);
    event.originalEvent.dataTransfer.setData("text/plain",
    (parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
}
function drag_over(event) {
    event.preventDefault();
    return false;
}
function drop(event) {
  if (event.target.tagName == "TD" || event.target.id == "tiles") {
    var offset = event.dataTransfer.getData("text/plain").split(',');
    var x = event.clientX + parseInt(offset[0],10);
    var y = event.clientY + parseInt(offset[1],10);
    var dm = beingdragged;
    if (event.target.tagName == "TD") {
      if (thinking) return;
      if ($('div[data-board-position=' + event.target.getAttribute('data-table-position') + ']').length) return false;
      x = event.target.getBoundingClientRect().left + 2 + window.pageXOffset;
      y = event.target.getBoundingClientRect().top + 2 + window.pageYOffset;
      if (dm.getAttribute('data-letter') >= 26) {
        $('#pickatile').click();
        beingdragged.putleft = x;
        beingdragged.puttop = y;
        beingdragged.putsquare = event.target.getAttribute('data-table-position');
        return false;
      }
      dm.setAttribute('data-board-position',event.target.getAttribute('data-table-position'));
    }
    else {
      if (thinking && dm.hasAttribute('data-board-position')) return;
      dm.removeAttribute('data-board-position');
      if (dm.getAttribute('data-letter') >= 26) {
        dm.childNodes[1].innerHTML = "";
      }
    }
    dm.style.left = (x) + 'px';
    dm.style.top = (y) + 'px';
    if (!thinking) countScore();
    event.preventDefault();
  }
  return false;
}
function countScore() {
  newLetters = [];
  $('.tile[draggable="true"][data-board-position]').each(function() {
    newLetters[$(this).attr('data-board-position')] = parseInt($(this).attr('data-letter'));
  });
  if (!newLetters.length) {
    $('.turnscore').text('0');
    return;
  }
  if(typeof(Worker) !== "undefined") {
    if(typeof(w) == "undefined") {
      w = new Worker("js/worker.js");
    }
    w.postMessage({ newLetters: newLetters,solitaire: true,checkOnly:true });
    w.onmessage = function(event) {
      if (event.data.Error) {
        $('.status').html(event.data.Error);
      }
      else if (event.data.Score != null) {
         $('.turnscore').text(event.data.Score);
       }
     }
  }
  else {
    document.getElementById("status").innerHTML = "Sorry, your browser does not support Web Workers...";
  }
}
function getPoints(letter,position) {
  var pts;
  if (letter >= 26) pts = 0;
  else pts = points[letter];
  if (doubleLetter.indexOf(position) > -1) pts = pts * 2;
  else if (tripleLetter.indexOf(position) > -1) pts = pts * 3;
  return pts;
}
