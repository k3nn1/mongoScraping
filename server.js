// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Scrapping Tools
// Axios is a promised-based http library, similar to jQuery's Ajax method.
// It works on the client and on the server.
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");

// Require all models
var db = require("./models");

// Define port
var PORT = process.env.PORT || 8000;
// var PORT = 8000

//Initialize Express
var app = express();

// Configure middleware
// Use morgan logger for logging requests.
app.use(logger("dev"));

// Use body-parser for handling form submissions.
app.use(bodyParser.urlencoded({extended: false}));

// Use express.static to serve the public folder as a static directory.
app.use(express.static("public"));

app.get("/", function(req, res) {
    res.send(index.html);
});

// Route for scraping Curiosity Sci&Tech website articles.
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html wtih request.
    // THen, we load that into cheerio and save it to $ for a shorthand selector
    request("https://curiosity.com/subjects/science-technology/topics", function(error, response, html) {
        var $ = cheerio.load(html);

        // Empty results object
        // var results = {};

        // Now, we grab every a-tag with a topic-link class within an article tag, and do the following:
        $("a.topic-link").each(function(i, element) {
            var title = $(element).find("h3").text();
            var subTitle = $(element).find('p').text().trim();
            var link = "https://curiosity.com"+$(element).attr("href");

            var results = {
                title: title,
                subTitle: subTitle,
                link: link,
                isSaved: false
            };
            console.log("results: " + results);

            db.Article.findOne({title:title}).then(function(res) {
                console.log("res: " + res);
                if (res === null) {
                    db.Article.create(results).then(function(dbArticle) {
                        res.json(dbArticle);
                    });
                }
            }).catch(function(err) {
                res.json(err);
            });
        });
    });
});

// Route to get ALL articles
app.get("/articles", function(req, res) {
    db.Article
        .find({})
        .then(function(dbArticle) {
            res.json(dbArticle);
            console.log("article: " + dbArticle)
        })
        .catch(function(err) {
            return res.json(err);
        });
});

// Route for specific Articles by ID
app.get("/articles/:id", function(req, res) {
    db.Article
        .findOne({_id: req.params.id})
        .populate("note")
        .then(function(dbArticle) {
            res.json(dbArticle);
            console.log("article by ID: " + dbArticle)
        })
        .catch(function(err) {
            return res.json(err);
        });
});

// Routes for saving Article's Note
app.post("/articles/:id", function(req, res) {
    db.Note
        .create(req.body)
        .then(function(dbNote) {
            return db.Article.findOneAndUpdate(
                {_id: req.params.id}, 
                {note: dbNote._id}, 
                {new: true});
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            return res.json(err);
        });
});

// Routes for saving Articles
app.put("/saved/:id", function(req, res) {
    db.Article
        .findByIdAndUpdate({_id: req.params.id},{$set: {isSaved: true}})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            return res.json(err);
        });
});

// Routes for Saved Article
app.get("/saved", function(req,res) {
    db.Article
        .find({isSaved: true})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            return res.json(err);
        });
});

// Route for deleting/updating saved article
app.put("/delete/:id", function(req,res) {
    db.Article
        .findByIdAndUpdate({_id:req.params.id}, {$set: {isSaved: false}})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            return res.json(err);
        });
});

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Start the Server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!"); 
});
