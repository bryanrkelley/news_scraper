var scrapeNews = require("../server");

module.exports = function (router) {
    //Goes to index page
    router.get("/", function (req, res) {
        res.render("index");
    });
    //Goes to save handlebar page
    router.get("/saved", function (req, res) {
        res.render("saved");
    });
    // //Goes to save Scrape page
    // router.get("/api/scrape", function (req, res) {
    //     scrapeNews.get(function (req, res) {
    //         if (!docs || docs.insertedCount === 0) {
    //             res.json({
    //                 message: "No new articles today.  Check back tomorrow!"
    //             });
    //         } else {
    //             res.json({
    //                 message: "Added " + docs.insertedCount + " new articles!"
    //             });
    //         }
    //     });
    // });
}