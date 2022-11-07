export const payment = (req, res) => {
    res.render("payment", {pageTitle : "payment"});
}

export const terms = (req, res) => {
    res.render("terms", {pageTitle : "term"});
}

export const privacy = (req, res) => {
    res.render("privacy", {pageTitle : "privacy"})
}