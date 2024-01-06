const express= require ("express")
const bodyparser=require("body-parser")
const promoRouter=express.Router()
const cors=require('../cors')
const request= require("request-promise")
const cheerio = require('cheerio')
const axios = require('axios');
const CurrencyExchange = require('../models/Chyron');
const schedule= require('node-schedule')
const Coins= require('../models/coinSchema')
const Weather = require('../models/weather')
const puppeteer= require("puppeteer")
const MarketInfo= require('../models/Commodities')

const url = 'http://www.ethiomet.gov.et/forecasts/three_day_forecast';


/* const ECX= async()=>{
  //ch the browser and open a new blank page
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();

  // Navigate the page to a URL 
  await page.goto('https://www.2merkato.com/news/capital-market-and-commodity-exchange/');
  await Promise.all([
    page.waitForNetworkIdle(),
    page.click('#t3-content > div.blog > div.items-leading > div > article > section.readmore > a'),
    new Promise((resol)=> setTimeout(resol, 20000))
  ])


  // Set screen size
  await page.setViewport({width: 1080, height: 1024});

  await browser.close();

} */

const marketData= async()=>{
  await MarketInfo.deleteMany({});

  const metal= await axios.get("https://www.reuters.com/pf/api/v3/content/fetch/quote-by-rics-v2?query=%7B%22fields%22%3A%22ric%2Ctype%3AricType%2Cname%2Ccurrency%2ClocalName%7Blong%7Bname%2Clang%7D%2Cshort%7Bname%2Clang%7D%7Dpercent_change%3ApctChange%2Cyield_net_change%3AyieldNetChange%2Cprice%3Alast%2Clast%2Cexpiration%3AmaturityDate%2Cnet_change%3AnetChange%22%2C%22retries%22%3A0%2C%22rics%22%3A%22XAU%3DX%2CGCc1%2CXAG%3DX%2CHGc1%2CXPT%3DX%2CXPD%3DX%22%7D&d=168&_website=reuters")
  const agri= await axios.get("https://www.reuters.com/pf/api/v3/content/fetch/quote-by-rics-v2?query=%7B%22fields%22%3A%22ric%2Ctype%3AricType%2Cname%2Ccurrency%2ClocalName%7Blong%7Bname%2Clang%7D%2Cshort%7Bname%2Clang%7D%7Dpercent_change%3ApctChange%2Cyield_net_change%3AyieldNetChange%2Cprice%3Alast%2Clast%2Cexpiration%3AmaturityDate%2Cnet_change%3AnetChange%22%2C%22retries%22%3A0%2C%22rics%22%3A%22Cc1%2CWc1%2CSc1%2CFCPOc1%2CNSBc1%2CNRSc1%2CSBc1%2CKCc1%2CCCc1%2CCTc1%2CLBc1%2COJc1%2CJRUc1%22%7D&d=168&_website=reuters")
  const energy= await axios.get("https://www.reuters.com/pf/api/v3/content/fetch/quote-by-rics-v2?query=%7B%22fields%22%3A%22ric%2Ctype%3AricType%2Cname%2Ccurrency%2ClocalName%7Blong%7Bname%2Clang%7D%2Cshort%7Bname%2Clang%7D%7Dpercent_change%3ApctChange%2Cyield_net_change%3AyieldNetChange%2Cprice%3Alast%2Clast%2Cexpiration%3AmaturityDate%2Cnet_change%3AnetChange%22%2C%22retries%22%3A0%2C%22rics%22%3A%22CLc1%2CLCOc1%2CRBc1%2CLGOc1%2CHOc1%2CNGc1%2CNGLNMc1%22%7D&d=168&_website=reuters")


  const Mdata = metal.data.result.market_data.map((marketDataItem) => ({
      name: marketDataItem.name,
      currency: marketDataItem.currency,
      percent_change: Number(marketDataItem.percent_change),
      price: Number(marketDataItem.price),

  }));
  const Adata = agri.data.result.market_data.map((marketDataItem) => ({
    name: marketDataItem.name,
    currency: marketDataItem.currency,
    percent_change: Number(marketDataItem.percent_change),
    price: Number(marketDataItem.price),

}));
const Edata = energy.data.result.market_data.map((marketDataItem) => ({
  name: marketDataItem.name,
  currency: marketDataItem.currency,
  percent_change: Number(marketDataItem.percent_change),
  price: Number(marketDataItem.price),

}));
const currentDate= new Date()
const MetalsMarket = new MarketInfo({
  date: currentDate,
  catagory: "Metals",
  marketData: Mdata
});
const EnergyMarket = new MarketInfo({
  date: currentDate,
  catagory: "Energy",
  marketData: Edata
});
const AgriMarket = new MarketInfo({
  date: currentDate,
  catagory: "Agriculture",
  marketData: Adata
});
// Save the instance to the database
MetalsMarket.save((err, doc) => {
  if (err) {
    console.error('Error saving market data:', err);
  } else {
    console.log('Saved :');
  }
});
AgriMarket.save((err, doc) => {
  if (err) {
    console.error('Error saving market data:', err);
  } else {
    console.log('Saved ');
  }
});

EnergyMarket.save((err, doc) => {
  if (err) {
    console.error('Error saving market data:', err);
  } else {
    console.log('Saved ');
  }
});


}





const scrapeWeatherData= async () => {
    try {
        const resp = await axios.get(url);
        let $ = cheerio.load(resp.data);
        let adisAbebaTable = $('#content > table > tbody > tr:nth-child(3) > td:nth-child(2) > table');
        const date11= $('#content > table > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(1) > th:nth-child(3)').text()
        const date21=$('#content > table > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(1) > th:nth-child(4)').text()
        const date31=$('#content > table > tbody > tr:nth-child(3) > td:nth-child(2) > table > tbody > tr:nth-child(1) > th:nth-child(5)').text()
        await Weather.deleteMany({});

        adisAbebaTable.find('tbody > tr:gt(0)').each(function () {
            let city = $(this).find('td:nth-child(2) > a').text();
            let min = $(this).find('td:nth-child(3)').text();
            let max = $(this).find('td:nth-child(4)').text();
            let min2 = $(this).find('td:nth-child(6)').text();
            let max2 = $(this).find('td:nth-child(7)').text();
            let min3 = $(this).find('td:nth-child(9)').text();
            let max3 = $(this).find('td:nth-child(10)').text();

            

            // Create a Weather model instance
            const weatherObj = new Weather({
                city: city,
                weather: [{
                        date: date11,
                        min: Number(min),
                        max: Number(max),
                    },
                    {
                        date: date21,
                        min: Number(min2),
                        max: Number(max2),
                    },
                    {
                        date: date31,
                        min: Number(min3),
                        max: Number(max3),
                    },
                ],
            });

            // Save the Weather model instance to the database
            weatherObj.save()
                .then(savedWeather => {
                    console.log('Weather data saved:');
                })
                .catch(error => {
                    console.error('Error saving weather data:', error);
                });
        });


    } catch (error) {
        console.error('Error:', error);
    }
};




const cryptoCoin = async () => {
  try {
    const response = await axios.get('https://api.coin-stats.com/v4/coins?skip=0&limit=100');
    const apiData = response.data;

    // Map the API data to your schema
    const mapAPIDataToSchema = (apiItem) => ({
      id: apiItem.i,
      icon: apiItem.ic,
      name: apiItem.n,
      symbol: apiItem.s,
      rank: apiItem.r,
      price_usd: apiItem.pu,
      price_btc: apiItem.pb,
      volume_usd_24h: apiItem.v,
      market_cap_usd: apiItem.m,
      percent_change_24h: apiItem.p24,
      percent_change_1h: apiItem.p1,
      price_change_1h: apiItem.p1h,
      percent_change_7d: apiItem.p7d,
      price_change_7d: apiItem.p7,
      percent_change_30d: apiItem.p30,
      percent_change_90d: apiItem.pop,
      categoryc: apiItem.c,
    });

    // Map the API data to your schema
    const mappedData = apiData.coins.map(mapAPIDataToSchema);
    await Coins.deleteMany({});

    // Create a new instance of the Mongoose model with the mapped data
    const coinsInstance = new Coins({ coins: mappedData });

    // Save the data to the database
    await coinsInstance.save();
    console.log('Coins saved successfully!');
  } catch (error) {
    console.error(error);
  }
};

// Call the function to fetch and save data


const CurrencyExchangeMethode= async()=>{
  try {
    // Get data from the request body (assuming it's in JSON format)
    const response = await axios.get('https://combanketh.et/cbeapi/daily-exchange-rates?_limit=1&_sort=Date%3ADESC&csrt=14782543841042464280');
   // const response = await request('https://combanketh.et/cbeapi/daily-exchange-rates?_limit=1&_sort=Date%3ADESC&csrt=14782543841042464280');

 

    const customApiData = response.data; // Access the data from the response

    await CurrencyExchange.deleteMany({});

    // Transform data to fit the Mongoose schema
    const transformedData = {
      date: customApiData.Date,
      ExchangeRate: customApiData[0].ExchangeRate.map(rate => ({
        currencyCode: rate.currency.CurrencyCode,
        currencyName: rate.currency.CurrencyName,
        cashBuying: rate.cashBuying,
        cashSelling: rate.cashSelling,
        transactionalBuying: rate.transactionalBuying,
        transactionalSelling: rate.transactionalSelling,
      })),
    };

    // Create a new instance of the Mongoose model
    const currencyExchangeInstance = new CurrencyExchange(transformedData);

    // Save the data to the database
    await currencyExchangeInstance.save();

    console.log( 'Data imported successfully' );
  } catch (error) {
    console.error(error);
    console.log('Internal Server Error' );
  }
}
schedule.scheduleJob("*/1 * * * *",()=>{
  CurrencyExchangeMethode()
  cryptoCoin()
  scrapeWeatherData()
  marketData()
})
promoRouter.use(bodyparser.json())

.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})


promoRouter.route('/') 

.get(cors.cors,async (req, res) => {
  const currency = await CurrencyExchange.find();
  const weather= await Weather.find()
  const coins  = await Coins.find()
  
  res.send("Currency: "+currency+"Weather: "+weather+ "Coins: "+coins );
  });
  
;



module.exports= promoRouter