var pouchdb;
var localCouchName = 'http://127.0.0.1:5984/presentations';
var pouchName = 'idb://presentations';
var remoteCouchName = 'https://chrome.iriscouch.com:6984/presentations';
// var from = 'idb://bar';

function init(from, to){
  Pouch(to, function(error, db){
    pouchdb = db;
    if (error) {
      console.log("Pouch error creating database:", error);
    } else {
      // Pouch.replicate(from, to, {continuous: true}, function (error, changes) {
      //   if (error) {
      //     console.log('Pouch replicate() error: ', error);
      //   } else {
      //     db.allDocs({include_docs: true}, function(error, docs) {
      //       console.log('Pouch replicated ' + doc.rows.length + ' rows: ', docs.rows);
      //     });
      //   }
      // });
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
// destroy(pouch);
var pouchdb;

init(remoteCouchName, pouchName);

// var getAllButton = document.querySelector('button#getAll');

// getAllButton.onclick = function(){
//   pouchdb.allDocs({include_docs: true}, function(error, docs) {
//     console.log('docs: ', docs);
//     console.log('Pouch replicated ' + docs.rows.length + 'rows: ', docs.rows);
//   });
// };

function map(presentation){
  var slides = presentation.slides;
  for (var i = 0; i !== slides.length; ++i) {
    var slide = slides[i];
    var regExp = new RegExp(query, "i");
//    console.log(window.query, slide.text);
    // if (regExp.test(slide.text)) {
    //   console.log(presentation, slide, i + 1);
    // }
    if (slide.text.indexOf(queryString.toLowerCase()) != -1) {
      log(slide.text);
//      console.log(presentation, slide, i + 1);
    }
  }
}

function get(string){
  queryString = string;
  pouchdb.query({map: map}, {reduce: false},
    function(error, response) {
      if (error){
        // alert('pouchdb.query error: ', error);
        console.log('pouchdb.query error: ', error);
      } else {
        // alert('pouchdb.query success: ', response);
//        console.log('pouchdb.query success: ', response);
      }
    }
  );
}

var searchButton = document.querySelector('button#search');
var queryInput = document.querySelector('input#query');
searchButton.onclick = function(){
  var queryString = queryInput.value.replace(/[^a-zA-Z]/g, " ");
  get(queryString);
};

function log(string){
  document.getElementById('data').innerHTML = string;
}
