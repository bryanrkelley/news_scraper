require("dotenv").config();
var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();


//Middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});

// Routes

require("./config/routes")(app);

var getArticles = function(res) {
  db.Article.find({}).then((dbArticles) => {
    res.json(dbArticles);
  }).catch((err) => {
    res.json(err);
  });
};

// A GET route for scraping the NYT website
app.get("/api/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.nytimes.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article div a").each(function (i, element) {
      if (!$(this).children("div")) return;

      // Save an empty result object
      var result = {};

      // Add the title, summary and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("div")
        .children("h2")
        .text();
      result.summary = $(this)
        .children("p")
        .text();
      result.link = "https://www.nytimes.com" + $(this)
        .attr("href");

        console.log("This is the title: " + result.title);

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
      });
      return (res);
    }).then(function(res) {
      getArticles(res);
  });
});


// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  getArticles(res);
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  db.Article.findOne({
      _id: req.params.id
    })
    .populate("note")
    .then((dbArticle) => {
      res.json(dbArticle)
    }).catch((err) => {
      res.json(err);
    })
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body).then(dbNote => {
    db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      })
      .then(dbArticle => {
        res.json(dbArticle)
      })
      .catch(err => {
        res.json(err);
      });
  });
});

// Route for deleting an Article's associated Note
app.delete("/articles/:id", function (req, res) {
  db.Note.remove({
    _id: req._id
  }, res);
})

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});