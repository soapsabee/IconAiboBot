const line = require('@line/bot-sdk');
const express = require('express');
const { google } = require('googleapis');
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
    google_client.authorize(async(err, tokens) => {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log('Connected!');
           await gsrun(google_client)

        }
    });
    //  console.log("dataCalendar:"+status)
    //  return status

}


const gsrun = async (cl) => {
    const gsapi = google.sheets({ version: 'v4', auth: cl });
    const opt = {
      spreadsheetId: '19T5K7L5oEY6Gz5p2i4jw8GHdaw_0MDgRD3clYGYlRdI',
      range: 'A2:C'
    };
    let data = await gsapi.spreadsheets.values.get(opt);
    let dataArray = data.data.values
    console.log("dataArray:"+dataArray)
    return dataArray
   //  checkCalendar(dataArray)
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
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    const eventReply = {
        "see_sheet": getDataSheet()
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