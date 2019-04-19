module.exports = function (router) {
    //Goes to index page
    router.get("/", function (req, res) {
        res.render("index");
    });
    //Goes to save handlebar page
    router.get("/saved", function (req, res) {
        res.render("saved");
    });
    //Goes to save Scrape page
    router.get("/scrape", function (req, res) {
        res.render("scrape");
    });
}