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

  // Main
  if (headers.length != lectures.length) { throw 'Bad lesson layout'; }

  // scrollable div is super annoying
  //course_tree.style.setProperty('height', '100%');

  // Load up state from LocalStorage and update the DOM
  updatePageFromCache(load());

  // Continuously update LocalStorage with local changes
  setInterval(function(){ save(currentState()); }, 1000)
})();
