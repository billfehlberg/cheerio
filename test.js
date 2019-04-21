var express = require ("express");
var mongojs = require ("mongojs")
var cheerio = require("cheerio");
var axios = require("axios");

var app = express();
var databaseURL = "testScrape";
var collections = ["scrapeTest"];
var db = mongojs(databaseURL, collections);

db.on("error", function(error)  {
  console.log("Database Error:", error);
});

app.get("/", function(req, res) {
  res.send("Hello Minnesota");
});


app.get("/all", function(req, res)  {
  db.scrapeTest.find({}, function(error, found) {
    if (error)  {
      console.log(error);
    }
    else  {
      res.json(found);
    }
  });
});


app.get("/scrape", function(req, res) {
  axios.get("https://bringmethenews.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    $("phoenix-carousel-slide").each(function(i, element) {

      var headline = $(element).find("div.m-card--label").find("a").text();
      var summary = $(element).find("h2.m-ellipsis--text").text();
      var link = $(element).children().attr("href");

      if (headline && headline && link) {
        db.scrapeTest.insert({
          headline: headline,
          summary: summary,
          link: link
        },
        function(err, inserted) {
          if (err)  {
            console.log(err);
          }
          else  {
            console.log(inserted);
          }
        });
      }
    });
});
  res.send("Scrape Completed");
});
  app.listen(3000, function() {
    console.log("App running on port 3000");
});