var express = require("express");
var logger = require("morgan");
var mongoose = require ("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");

var db = require("./models");
var PORT = 3000;
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/localNews", { useNewUrlParser: true });


app.get("/", function(req, res) {
  res.send("Hello Minnesota");
});


app.get("/articles", function(req, res)  {
  db.Article.find({}) 
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err)  {
        res.json(err);
      });
    });


app.get("/scrape", function(req, res) {
  axios.get("https://bringmethenews.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    $("phoenix-carousel-slide").each(function(i, element) {

      var result = {};

      result.headline = $(this).find("div.m-card--label").find("a").text();
      result.summary = $(this).find("h2.m-ellipsis--text").text();
      result.link = $(this).children().attr("href");

  
        db.Article.create(result)
          .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err)  {
            console.log(err);
          });
    });
    res.send("Scrape Completed");
  });
});
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});