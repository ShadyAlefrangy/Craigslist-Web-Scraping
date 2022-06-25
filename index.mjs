import * as cheerio from 'cheerio';
import ObjectsToCsv from "objects-to-csv";

const url = "https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof";
const scrapResults = [];
async function scrapJobHeader() {
    try {
        const response = await fetch(url);
        const htmlResults = await response.text();
        const $ = cheerio.load(htmlResults);
    
        $(".result-info").each((index, element) => {
    
            const title = $(element).find(".result-title").text();
            const url = $(element).find(".result-title").attr("href");
            const postDate = $(element).find(".result-date").attr("datetime");
            const hood = $(element).find(".result-hood").text();
            const scrapResult = { title, url, postDate, hood};
            scrapResults.push(scrapResult);
            
        });
        return scrapResults;
    } catch (err) {
        console.error(err);
    }
    
}

async function scrapJobDescription(jobWithHeaders) {
    try {
        return await Promise.all(jobWithHeaders.map(async job => {
            const response = await fetch(job.url);
            const htmlResults = await response.text();
            const $ = cheerio.load(htmlResults);
            $('.print-qrcode-label').remove();
            job.description = $('#postingbody').text();
            const compensationsText = $(".attrgroup").children().first().text();
            job.compensation = compensationsText.replace("compensation: ", "");
            return job;
        }));
    } catch (err) {
        console.error(err);
    }
}

async function createCSVFile(data) {
    const csv = new ObjectsToCsv(data);
   // Save to file:
    await csv.toDisk('./results.csv')
}

async function scrapCraigslist() {
    try {
        const jobWithHeaders = await scrapJobHeader();
        const jobsWithFullData = await scrapJobDescription(jobWithHeaders);
        await createCSVFile(jobsWithFullData);
    } catch (err) {
        console.error(err);
    }
}

scrapCraigslist();