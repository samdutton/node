var searchResultsElement = document.getElementById('searchResults');
var pouchdb;
var localCouchName = 'http://127.0.0.1:5984/presentations';
var pouchName = 'idb://presentations';
var remoteCouchName = 'https://chrome.iriscouch.com/presentations';
// var remoteCouchName = 'https://chrome.cloudant.com/presentations';

var numResults = 0;
var numSlides = 0;
function init(remote, local){
  console.log('init() called');
  Pouch(local, function(error, db){
    console.log('Created pouch');
    pouchdb = db;
    if (error) {
      console.log("Pouch error creating database:", error);
    } else {
      Pouch.replicate(remote, local, function (error, changes) {
        if (error) {
          console.log('Pouch replicate() error: ', error);
        } else {
          db.allDocs({include_docs: true}, function(error, docs) {
            console.log('Pouch db: ' + docs.rows.length + ' rows: ', docs.rows);
          });
        }
      });
    }
  });
}

function destroy(name){
  Pouch.destroy(name, function(error){
    if (error) {
      console.log("Pouch error destroying database:", error)
    } else {
      console.log('Pouch destroyed database:', name);
    }
  });
}

// destroy(remoteCouchName);
// destroy(pouchName);

init(localCouchName, pouchName);

// var getAllButton = document.querySelector('button#getAll');

// getAllButton.onclick = function(){
//   pouchdb.allDocs({include_docs: true}, function(error, docs) {
//     console.log('docs: ', docs);
//     console.log('Pouch replicated ' + docs.rows.length + 'rows: ', docs.rows);
//   });
// };

function map(presentation){
// maybe not worth doing: adds size to DB and doesn't take much time
//   if (presentation.text.indexOf(queryString) === -1) {
// //      console.log('Not found in whole presentation: ', presentation.url);
//      return;
//   } else {
// //      console.log('>>> Found in ', presentation.url);
//   }
  var slides = presentation.slides;
  numSlides += slides.length;
  for (var i = 0; i !== slides.length; ++i) {
    var slide = slides[i];
    // indexOf is quicker than RegExp with test()
    // doesn't speed it up much!
    if (slide.text.toLowerCase().indexOf(queryString) === -1) {
      continue;
    } else {
      numResults += 1;
    }
    if (slide.images) {
      for (var j = 0; j != slide.images.length; ++j) {
        var image = slide.images[j];
        if (image.alt.toLowerCase().indexOf(queryString) !== -1 ||
          image.src.toLowerCase().indexOf(queryString) !== -1) {
          log(presentation.url + ' image: ' + image.alt + ', ' + image.src);
        }
      }
    }
    if (slide.visibleText && slide.visibleText.toLowerCase().indexOf(queryString) != -1) {
      log(presentation.url + ' visibleText: ' + slide.visibleText);
    }
    if (slide.aside && slide.aside.toLowerCase().indexOf(queryString) != -1) {
      log(presentation.url + ' aside: ' + slide.aside);
    }
  }
}

function searchFor(string){
  queryString = string;
  pouchdb.query({map: map}, {reduce: false},
    function(error, response) {
      if (error){
        console.log('pouchdb.query error: ', error);
      } else {
        console.log('pouchdb.query success:', response);
        if (numResults === 0) {
          searchResultsElement.innerHTML = '<p>No results.</p>';
        } else {
          pouchdb.allDocs({include_docs: true}, function(error, docs) {
            searchResultsElement.innerHTML =
              '<p>' + numSlides + ' slides, ' +
              docs.rows.length + ' presentations, ' +
              numResults + ' match(es):</p>' +
              console.log('*' + searchResultsString + '*');
              searchResultsString;
          });
        }
        console.timeEnd('Time for search:');
      }
    }
  );
}

var searchButton = document.querySelector('button#search');
var queryInput = document.querySelector('input#query');
searchButton.onclick = function(){
  var queryString = queryInput.value.replace(/[^a-zA-Z]/g, " ").toLowerCase();
  numResults = 0;
  numSlides = 0;
  searchResultsString = '';
  searchResultsElement.innerText = '';
  console.time('Time for search:');
  searchFor(queryString);
};

var searchResultsString = '';
function log(string){
  searchResultsString += '<p>' + string + '</p>';
}
