const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');
const Result = require('./schema');
const { Parser } = require('json2csv');

let percentage = 0;
let scrapeStartDate = "";
async function scrapFunction(givenDate) {
    var newLine = '\r\n';
    var result = {};
    let results = [];
    let count = 0;
    let keyCount = 0;
    scrapeStartDate = givenDate;

    let appendHeader = {'Code':"Code", 'City':"City", 'State':"State", 'Address':"Address", 'Class':"Class", 'Vehicle type':"Vehicle", 'Date From':"Start", 'Date To':"End", 'Total(pay now)':"Pay Now", 'Total(pay later)':"Pay Later", 'Link':"Reserve"};

                                        
    let parser = new Parser();
    let headerData = parser.parse(appendHeader);

    let csvHeader = headerData.split('\n')[1] + '\n';
    let resultFileName = "./Result/Avis"+givenDate+".csv";
    
    fs.appendFileSync(resultFileName, csvHeader, 'utf8', (err) => {
        if (err) {
            console.error('Error appending to CSV file:', err);
        } else {
            console.log('CSV header appended successfully.');
        }
    });
    // Do something with the submitted data (e.g., save it to a database)

    async function handleScraping() {
        for (let i = 0; i < 30; i++) {

            const newDate = new Date(givenDate + "-01");
            newDate.setDate(newDate.getDate() + i);
            const startDate = newDate.toISOString().split('T')[0];
            const start_date = startDate.split("-")[1] + "/" + startDate.split("-")[2] + "/" + startDate.split("-")[0];
            newDate.setDate(newDate.getDate() + 330);
            const endDate = newDate.toISOString().split('T')[0];
            const end_date = endDate.split("-")[1] + "/" + endDate.split("-")[2] + "/" + endDate.split("-")[0];
            // console.log("start date >>> ", start_date);
            // console.log("end date >>> ", end_date);
            // console.log("----------------------");

            let Digital_Token = null;
            let RecaptchaResponse = null;
            let Cookie = null;
            let BasicPayload = null;
            let carName = "";
            let carDesc = "";
            let payLaterAmount = "";
            let payLaterTotalAmount = "";
            let payNowAmount = "";
            let payNowTotalAmount = "";
            let csvRow = [];
            let writeData = [];

            async function getRequestData() {
                const browser = await puppeteer.launch({
                    headless: true, // Use the new Headless mode
                    // ... other options
                });

                // Rest of your code using the browser instance
                const page = await browser.newPage();

                // Enable request interception
                await page.setRequestInterception(true);

                // Listen for the request event
                page.on('request', async (request) => {

                    if (!request.isNavigationRequest()) {
                        // It's an AJAX request
                        if (request.url().includes('https://www.avis.com/webapi/reservation/vehicles')) {

                            BasicPayload = request.postData();

                            if(BasicPayload) {
                                Digital_Token = request.headers()['digital-token'];
                                Cookie = request.headers().cookie;
                                RecaptchaResponse = request.headers()['g-recaptcha-response'];
                            }
                        }
                    }
                    request.continue();
                });

                // Navigate to a page that triggers AJAX requests
                await page.goto('https://www.avis.com/en/home', {
                    timeout: 500000
                });

                // Delay function
                function delay(ms) {
                    return new Promise((resolve) => setTimeout(resolve, ms));
                }

                // await delay(3000); 
                let modalXPath = '/html/body/div[4]/section/div[2]/div[1]/span';
                try {
                    const [modalClose] = await page.$x(modalXPath);
                    await modalClose.click({timeout:300000});
                } catch (error) {
                    console.log("First modal is not exist...");
                }

                // await delay(3000); 
                let secModalXPath = '/html/body/div[4]/section/div[1]/div[1]/span';
                try {
                    const [secModalClose] = await page.$x(secModalXPath);
                    await secModalClose.click({timeout:300000});
                } catch (error) {
                    console.log("Second modal is not exist...");
                }

                await page.waitForSelector('#PicLoc_value', {timeout: 300000});
                await page.type('#PicLoc_value', 'shr');
                await page.$eval('#from', (element) => {
                    element.value = "11/03/2023";
                });

                await delay(3000); 
                const endDateField = await page.waitForSelector('#to', {timeout: 300000});
                await endDateField.click({timeout: 300000});

                await delay(3000); 
                const endDateXPath = '//*[@id="ui-datepicker-div"]/div[2]/table/tbody/tr[5]/td[3]/a';
                
                const [end_day] = await page.$x(endDateXPath);
                await end_day.click({timeout: 300000});

                await delay(3000);

                const findButton = await page.waitForSelector('#res-home-select-car', {timeout: 500000});
                await findButton.click({timeout: 300000});

                await delay(3000);

                async function processFilesSequentially(filePaths) {
                    try {
                        const data = await readFileSequentially(filePaths);
                        for (const row of data) {
                            const searchKey = row[3];
                            // const state = row[0];
                            // const city = row[1];
                            const fullLocation = row[4];
                            const locationElements = fullLocation.split(",");
                            const elementNum = locationElements.length;
                            const location = locationElements[elementNum-5]+locationElements[elementNum-4]+locationElements[elementNum-3]+locationElements[elementNum-2]+locationElements[elementNum-1];
                            const street = locationElements[elementNum-5];
                            const city = locationElements[elementNum-3];
                            const state = locationElements[elementNum-4];




                            // const removeLocation = fullLocation.split(",")[0];
                            // const dispalyLocation = fullLocation.replace(removeLocation, "");
                            // const location = dispalyLocation.replace(",", "");
                            // const street = location.split(",")[0];
                            // console.log("fullLocation >>> ", fullLocation);
                            const link = row[2];
                            // console.log("search key >>>>>> ", searchKey);
                            keyCount = keyCount + 1;
                            percentage = keyCount
                            console.log("percentage: ", keyCount);
    
                            await fetch("https://www.avis.com/webapi/reservation/vehicles", {
                                "headers": {
                                    "accept": "application/json, text/plain, */*",
                                    "accept-language": "en-US,en;q=0.9",
                                    "action": "RES_VEHICLESHOP",
                                    "bookingtype": "car",
                                    "channel": "Digital",
                                    "content-type": "application/json",
                                    "devicetype": "bigbrowser",
                                    "digital-token": Digital_Token,
                                    "domain": "us",
                                    "g-recaptcha-response": RecaptchaResponse,
                                    "initreservation": "true",
                                    "locale": "en",
                                    "password": "AVISCOM",
                                    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
                                    "sec-ch-ua-mobile": "?0",
                                    "sec-ch-ua-platform": "\"Windows\"",
                                    "sec-fetch-dest": "empty",
                                    "sec-fetch-mode": "cors",
                                    "sec-fetch-site": "same-origin",
                                    "username": "AVISCOM",
                                    "cookie": Cookie,
                                    "Referer": "https://www.avis.com/en/home",
                                    "Referrer-Policy": "strict-origin-when-cross-origin"
                                },
                                "body": "{\"rqHeader\":{\"brand\":\"\",\"locale\":\"en_US\"},\"nonUSShop\":true,\"pickInfo\":\""+searchKey+"\",\"pickDate\":\""+start_date+"\",\"pickTime\":\"12:00 PM\",\"dropInfo\":\""+searchKey+"\",\"dropDate\":\""+end_date+"\",\"dropTime\":\"12:00 PM\",\"couponNumber\":\"\",\"couponInstances\":\"\",\"couponRateCode\":\"\",\"discountNumber\":\"\",\"rateType\":\"\",\"residency\":\"US\",\"age\":25,\"wizardNumber\":\"\",\"lastName\":\"\",\"userSelectedCurrency\":\"\",\"selDiscountNum\":\"\",\"promotionalCoupon\":\"\",\"preferredCarClass\":\"\",\"membershipId\":\"\",\"noMembershipAvailable\":false,\"corporateBookingType\":\"\",\"enableStrikethrough\":\"true\",\"amazonGCPayLaterPercentageVal\":\"\",\"amazonGCPayNowPercentageVal\":\"\",\"corporateEmailID\":\"\"}",
                                "method": "POST"
                            })
                                .then(response => {
                                    if (response.ok) {
                                        return response.json(); // assuming the response is in JSON format
                                    } else {
                                        throw new Error("Request failed with status " + response.status);
                                    }
                                })
                                .then(data => {
                                    // handle the response data here
                                    const infos = data.vehicleSummaryList;
                                    for (let num = 0; num < infos.length; num++) {
                                        const info = infos[num];
                                        if (info.payLaterRate) {

                                            // console.log("info >>> ", info);
                                            // carName = info.make;
                                            carName = info.carGroup;
                                            // console.log("car name --> ", carName);
                                            carDesc = info.makeModel;
                                            // console.log("car desc --> ", carDesc);
                                            payLaterAmount = info.payLaterRate.amount;
                                            payLaterTotalAmount = info.payLaterRate.totalRateAmount;
                                            if (info.payNowRate) {
                                                payNowAmount = info.payNowRate.amount;
                                                payNowTotalAmount = info.payNowRate.totalRateAmount;
                                            }
                                            else {
                                                payNowTotalAmount = "";
                                            }

                                            // Create a new instance of the Result model
                                            result = { Code: searchKey, CarName:carName, Type:carDesc, From:startDate, To:endDate, PayLater:payLaterAmount,  PayLaterTotal:payLaterTotalAmount, State:state, City:city, FullLocation:fullLocation, URL:link };
                                            // csvRow[num] = searchKey+', '+carName+', '+carDesc+', '+startDate+', '+endDate+', '+payLaterAmount+', '+payLaterTotalAmount+', '+state+', '+city+', '+'"'+fullLocation+'"'+', '+link;
                                            // const resultFileName = "./Result/Avis"+givenDate+".csv";
                                            
                                            // fs.appendFile(resultFileName, csvRow[num]+newLine, function (err) {
                                            //     if (err) throw err;
                                            //     // console.log('The "data to append" was appended to file!');
                                            // });
                                            
                                            // const appendData = { 'Code': searchKey, 'CarName':carName, 'Type':carDesc, 'From':startDate, 'To':endDate, 'PayLater':payLaterAmount,  'PayLaterTotal':payLaterTotalAmount, 'State':state, 'City':city, 'FullLocation':fullLocation, 'URL':link };
                                            const appendData = {'Code':searchKey, 'City':city, 'State':state, 'Address':location, 'Class':carName, 'Vehicle type':carDesc, 'Date From':startDate, 'Date To':endDate, 'Total(pay now)':payNowTotalAmount, 'Total(pay later)':payLaterTotalAmount, 'Link':link};

                                        
                                            // const parser = new Parser();
                                            const csv = parser.parse(appendData);
                                        
                                            const csvDataWithoutHeader = csv.split('\n')[1] + '\n';
                                            // const resultFileName = "./Result/Avis"+givenDate+".csv";
                                            
                                            fs.appendFileSync(resultFileName, csvDataWithoutHeader, 'utf8', (err) => {
                                                if (err) {
                                                    console.error('Error appending to CSV file:', err);
                                                } else {
                                                    console.log('CSV data appended successfully.');
                                                }
                                            });

                                            
                                        }
                                    }
                                })
                                .catch(error => {
                                    // handle any errors that occurred during the request
                                    console.error("No match result ...");
                                });
                        }
                    } catch (error) {
                        console.log("load location file error ...");
                    }
    
                }
    
                const files = './avisLocation.csv';
                await processFilesSequentially(files);

                await browser.close();

            }

            await getRequestData();

            
        }
    }

    async function readFileSequentially(filePath) {
        return new Promise((resolve, reject) => {
            let data = [];

            fs.createReadStream(filePath, {encoding: 'utf8'})
                .pipe(csv({separator: ',', headers: false}))
                .on('data', chunk => {
                    // console.log('data-->', chunk)
                    data.push(chunk);
                })
                .on('end', () => {
                    resolve(data);
                })
                .on('error', error => {
                    reject(error);
                });
        });
    }

    // date setting
    await handleScraping().then(res => {
        console.log('handle scraping have done!!')
        // console.log("results>>>>>>>>>>>>>>>>>>>>>>>>> ", results);
    })

    return "Scraping was completed successfully!";

}

function percentFunction() {
    return {percentage, scrapeStartDate}
}

module.exports = {
    scrapFunction,
    percentFunction,
}
