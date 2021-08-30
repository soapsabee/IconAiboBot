const line = require('@line/bot-sdk');
const express = require('express');
const { google } = require('googleapis');
const puppeteer = require('puppeteer');

const keys = require('./helper/aibobot-5908-26fd97d76e1f.json')


const google_client = new google.auth.JWT(

    keys.client_email,
    null,
    keys.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']

);

const getDataSheet = () => {
    // let status = null
    ////////////////////////////////////// ส่วนของ Google Sheet
    google_client.authorize(async (err, tokens) => {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log('Connected!');
            let data = await gsrun(google_client)
            await inComeOffice(data)

        }
    });
    //  console.log("dataCalendar:"+status)
    //  return status

}


const gsrun = async (cl) => {
    const gsapi = google.sheets({ version: 'v4', auth: cl });
    const opt = {
        spreadsheetId: '19T5K7L5oEY6Gz5p2i4jw8GHdaw_0MDgRD3clYGYlRdI',
        range: 'A2:D'
    };
    let data = await gsapi.spreadsheets.values.get(opt);
    let dataArray = data.data.values
    console.log("dataArray:" + dataArray)
    return dataArray
}

const inComeOffice = async (e) => {

    const browser = await puppeteer.launch({
        'args': [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();
    await page.goto('http://hr.iconframework.com/Webtime/');
    await page.type('#txtUser', e.Id)
    await page.type('#txtPWD', e.password)
    await page.select('#DropDownList1', "1")
    await page.click('#Button1')
    await page.goto('http://hr.iconframework.com/Webtime/work/WebAddInOut.aspx')

    const inputType = {
        "check-in": '#txt_OT_TimeE',
        "check-out": "#txt_OT_Times"
    }

    const select = {
        "check-in": {
            field: '#Table2 > tbody > tr:nth-child(2) > td:nth-child(3) > #DrpStatus',
            option: "8"
        },
        "check-out": {
            field: '#Table2 > tbody > tr:nth-child(4) > td:nth-child(3) > #DrpStatus1',
            option: "9"
        }
    }


    await page.type(inputType[e.typeCheck], e.time)
    await page.select(select[e.select].field, select[e.select].option)
    await page.click("#Table2 > tbody > tr:nth-child(2) > td:nth-child(4) > #Button1")
    await page.screenshot({ path: 'example6.png' });

    await browser.close();


}

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
function handleEvent(event) {
    console.log("event : ",event)
    console.log("type : ",event.message.type)

    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    const eventReply = {
        "inComeOffice": getDataSheet()
    }
    eventReply[event.message.text]
    // create a echoing text message
    const echo = { type: 'text', text: event.message.text };

    // use reply API
    return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});