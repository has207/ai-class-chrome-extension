// Storage format:
//   [
//     [status, status, ...],
//     [status, status, ...],
//     ...
//   ]
//
// Outer list holds the units (in order), and inner lists hold the 
// status of that unit's lectures, i.e. seen, started, etc.
// Order of the units is determined at runtime due to shitty DOM layout
// with duplicate id's so we create our own data structure mapping elements
// to unit numbers :/

(function() {

  var STORAGE_KEY = 'ai_class_progress';
  var homeworks = [
    [['CxjV8H50xfU', 'Peg Solitaire'], ['YOfAe4Xo_P4', 'Answer'],
     ['ZmVLMZ5Fwcg', 'Loaded Coin'], ['GsKZT-aAZFI', 'Answer'],
     ['dj6jEEU-jZc', 'Path Through Maze'], ['TskS2qHzi90', 'Answer'],
     ['qsxMRW2SOqI', 'Search Tree'], ['FDTlQfGb9SY', 'Answer'],
     ['vWNEaVcK2gU', 'Another Search Tree'], ['V_eXNj-LA9E', 'Answer'],
     ['IQhUlwJaBqc', 'Search Network'], ['mXT-9-K5OtU', 'Answer'],
     ['V4h2H0jpGsg', 'A* Search'], ['forv6djwNWM', 'Answer']],
    [['PRsXEwng3MI', 'Bayes Rule'], ['RvxL71wd2Zg', 'Answer'],
     ['6fP-r1I2-3c', 'Simple Bayes Net'], ['nQxYA7vBbJc', 'Answer'],
     ['ny-4txCawd4', 'Simple Bayes Net 2'], ['O4UT5ozSRGI', 'Answer'],
     ['fWX7dAMnaRM', 'Conditional Indpendence'], ['fksN-k4n_OM', 'Answer'],
     ['LaOeB4QCiV4', 'Conditional Independence 2'], ['jvOJ-6tF5y8', 'Answer'],
     ['8LPVInbfgMI', 'Parameter Count'], ['PEK4_jQnW10', 'Answer']],
    [['Lj9ku_w8JAE', 'Naive Bayes Laplacian Smoothing'], ['6NVZdQ9AyqA', 'Answer'],
     ['VqJVQlsuGoA', 'Naive Bayes Laplacian Smoothing'], ['2KTER9D-FbE', 'Answer'],
     ['9SDMNmgIhBE', 'Maximum Likelihood'], ['3lA9jrqw7_4', 'Answer'],
     ['rIO9zynD__M', 'Linear Regression'], ['4AlEXEEogCU', 'Answer'],
     ['5gIXtI82Olk', 'Linear Regression 2'], ['ynxLGEE_Bgo', 'Answer'],
     ['MhDJ47KG_Oc', 'K Nearest Neighbors'], ['11ItUQkTP2o', 'Answer'],
     ['SAG4-uC9BnE', 'K Nearest Neighbors 2'], ['IjzpuYn7Szc', 'Answer'],
     ['-fpVTLGoxZ4', 'Perceptron'], ['P88qJlIRnwI', 'Answer']]
  ]

  var course_tree = document.getElementsByClassName('course_tree')[0];
  var headers = course_tree.getElementsByTagName('h3');
  var lectures = course_tree.getElementsByTagName('div');

  var load = function() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  };

  var save = function(state) {
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  };

  var currentState = function() {
    state = [];
    for (var i = 0; i < lectures.length; i++) {
      state = [[]].concat(state);
      var lessons = lectures[i].getElementsByClassName('ctree-status');
      for (var j = 0; j < lessons.length; j++) {
        var name = lessons[j].className;
        if (name) {
          var status = '';
          if (name.search(/\bcomplete\b/) >= 0) {
            status = 'complete';
          } else if (name.search(/\bstarted\b/) >= 0) {
            status = 'started';
          }
          state[0] = state[0].concat([status]);
        }
      }
    }
    return state;
  };

  var shouldExpand = function(state, idx) {
    var started = false;
    var complete = true;
    if (state[idx]) {
      for (var i = 0; i < state[idx].length; i++) {
        if (state[idx]) {
          if (state[idx][i]) {
            started = true;
          } else {
            complete = false;
          }
        }
      }
    }
    return started && !complete;
  };

  var updateStatus = function(state, lessons, idx, i) {
    if (state[idx] && state[idx][i]) {
      var value = state[idx][i];
      var name = lessons[i].className;
      name = name.replace(new RegExp('\b' + value + '\b'), '');
      lessons[i].className = name + ' ' + value;
    }
  };

  var expandLessons = function(state, idx, topic, total) {
    if (shouldExpand(state, idx)) {
      var header = headers[total - idx].firstChild;
      if (header.className) {
        header.className = header.className.replace(/\bcollapsed\b/, 'expanded');
      }
      topic.style.setProperty('display', 'block');
    }
  };

  var updatePageFromCache = function(state) {
    if (!state) return;
    for (var idx = 0; idx < headers.length; idx++ ) {
      var total = headers.length - 1;
      var topic = lectures[total - idx];
      expandLessons(state, idx, topic, total);
      var lessons = topic.getElementsByClassName('ctree-status');
      for (var i = 0; i < lessons.length; i++) {
        updateStatus(state, lessons, idx, i);
      }
    }
  };

  var showVideo = function(vid) {
    vid = vid.replace(' ', '');
    var videoContainer = document.getElementById('videocontainer');
    if (videoContainer) {
      $('#related-content').hide();
      $('#aiqus_discussion_link').hide();
      knowit.youtube.stop();
      knowit.youtube.onEnd = function() {};
      knowit.youtube.play(false, vid);
    } else {
      // just replace the whole right side
      videoContainer = document.getElementById('right_col');
      videoContainer.innerHTML = '<iframe id=\'ytplayer\' type=\'text/html\' width=\'704\' height=\'396\' src=\'http://www.youtube.com/embed/' + vid + '?autoplay=1&autohide=1&origin=http://www.ai-class.com\' frameborder=\'0\'/>';
    }
  };

  var setStatus = function(element, s) {
    var actives = document.getElementsByClassName('active');
    for (var i=0; i < actives.length; i++) {
      actives[i].className = actives[i].className.replace('active', '');
    }
    var current = element.parentNode.getElementsByClassName('ctree-current')[0];
    var name = current.className.replace('active', '');
    current.className = name + ' active';
    var status = element.parentNode.getElementsByClassName('ctree-status')[0];
    name = status.className.replace('started', '').replace('complete', '');
    status.className = name + ' ' + s;
  };

  var drawQuestion = function(questionVid, answerVid) {
    var html = '';
    html += '<li>';
    html += '  <span class="relative">';
    html += '    <span class="ctree-current"></span>';
    html += '    <span class="ctree-status available"></span>';
    html += '    <a href="#" onclick="(' + showVideo + ')(\'' + questionVid[0] + '\');(' + setStatus + ')(this, \'started\'); return false;">' + questionVid[1] + '</a>';
    html += '    <a href="#" onclick="(' + showVideo + ')(\'' + answerVid[0] + '\');(' + setStatus + ')(this, \'complete\'); return false;"> (' + answerVid[1] + ')</a>';
    html += '  </span>';
    html += '</li>';
    return html;
  };

  var updateHomeworks = function() {
    var hws = document.getElementsByClassName('unavailable ctree-content');
    var hwheaders = document.getElementsByClassName('unavailable ctree-header');
    for (var i = 0; i < homeworks.length; i++) {
      if (i >= homeworks.length) return;  // no more homeworks data
      var hw = hws[hws.length - (i + 1)];
      var header = hwheaders[hwheaders.length - 1];
      header.className = header.className.replace('unavailable', 'available');
      header.lastChild.innerHTML = header.lastChild.innerHTML.replace('(closed)', '');
      var html = '<ol>';
      for (var j = 0; j < homeworks[i].length; j+=2) {
        html += drawQuestion(homeworks[i][j], homeworks[i][j+1]);
      }
      html += '</ol>';
      hw.innerHTML = html;
    }
  };

  var updateUrl = function() {
    var actives = document.getElementsByClassName('active');
    if (actives.length > 0) {
      var active = actives[0];
      var atags = active.parentNode.getElementsByTagName('a');
      if (atags.length > 0) {
        var atag = atags[0]
        var url = atag.href.replace('https://www.ai-class.com', '')
        if (window.history && window.history.state != url) {
          window.history.pushState(url, url, url);
        }
      }
    }
  };

  // Main
  if (headers.length != lectures.length) { throw 'Bad lesson layout'; }

  // Insert links to homework videos
  updateHomeworks();

  // Load up state from LocalStorage and update the DOM
  updatePageFromCache(load());

  // Continuously update LocalStorage with local changes
  setInterval(function(){ save(currentState()); updateUrl(); }, 1000)
})();
