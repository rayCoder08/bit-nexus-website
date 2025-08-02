import express from "express";
import axios from "axios";

const app = express();
const port = 5000;
const baseURL = "https://blockchain.info";

app.use(express.static("public")); // declares the public folder as static
app.use(express.urlencoded({ extended: true })); // express middleware - important for processing form data

var data = {
    allRates: undefined,
    userRates: ['USD', 'CAD', 'EUR', 'GBP', 'JPY'],
    conversionBTC: undefined,
    conversionGeneral: undefined
}

/*Fetching data */
app.get("/", async (req, res) => {
    try {
        const exchangeRates = await axios.get(baseURL + "/ticker");
        data.allRates = exchangeRates.data;
        res.render("index.ejs", data);
    } catch (error) {
        res.send("500 Internal Server Error. Something went wrong on our side.");
        console.error(error.message);
    }
});

app.get("/exchange-rates", (req, res) => {
    res.render("exchange-rates.ejs", data);
});

app.post("/btc-conversion", async (req, res) => {
    try {
        const exchangeRates = await axios.get(baseURL + "/ticker");
        data.rate = exchangeRates.data;
        const result = await axios.get(baseURL + "/tobtc?currency=" + req.body.currency + "&value=" + req.body.amount);
        data.conversionBTC = req.body.amount + " " + req.body.currency + " = " + result.data.toFixed(3) + " BTC";
        res.render("index.ejs", data);
    } catch (error) {
        res.send("500 Internal Server Error. Something went wrong on our side.");
        console.error(error.message);
    }
});

app.post("/general-conversion", async (req, res) => {
    /* Convert both amounts to BTC, then find the ratio
    Technically not super accurate (especially because exchange rates might update between
    the two get requests), but it's a very good approximation */
    try {
        // Debugged an error 500 here, it was because of a variable name that I spelt wrong
        const exchangeRates = await axios.get(baseURL + "/ticker");
        data.rate = exchangeRates.data;
        const first = await axios.get(baseURL + "/tobtc?currency=" + req.body.currency1 + "&value=" + req.body.amount);
        const second = await axios.get(baseURL + "/tobtc?currency=" + req.body.currency2 + "&value=1");
        const ans = first.data / second.data;
        data.generalConversion = req.body.amount + " " + req.body.currency1 + " = " + ans.toFixed(3) + " " + req.body.currency2; // somehow JS figures out that these are actually integers, not strings
        res.render("index.ejs", data);
    } catch (error) {
        res.send("500 Internal Server Error. Something went wrong on our side.");
        console.error(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
