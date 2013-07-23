// Print all of the news items on hackernews
var jsdom = require("jsdom");
var fs = require("fs");
var jquery = fs.readFileSync("./js/lib/jquery-2.0.0.min.js").toString();

jsdom.env({
  html: "http://news.ycombinator.com/",
  src: [jquery],
  done: function (errors, window) {
    var $ = window.$;
    console.log("HN Links");
    $("td.title:not(:last) a").each(function() {
      console.log(" -", $(this).text());
    });
  }
});
