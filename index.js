
require('dotenv').config()

const line = require('@line/bot-sdk');
const e = require('express');
const express = require('express');
const { google } = require('googleapis');
const puppeteer = require('puppeteer');
const imgbbUploader = require("imgbb-uploader");

const keys = require('./helper/aibobot-5908-26fd97d76e1f.json')

const spreadsheetId = '19T5K7L5oEY6Gz5p2i4jw8GHdaw_0MDgRD3clYGYlRdI'

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
            // await inComeOffice(data)

        }
    });
    //  console.log("dataCalendar:"+status)
    //  return status

}


const gsrun = async (cl) => {
    const gsapi = google.sheets({ version: 'v4', auth: cl });
    const opt = {
        spreadsheetId: spreadsheetId,
        range: 'A2:D'
    };
    let data = await gsapi.spreadsheets.values.get(opt);
    let dataArray = data.data.values
    console.log("dataArray:" + dataArray)
    return dataArray
}

const inComeOffice = async (e) => {

    // const browser = await puppeteer.launch({
    //     'args': [
    //         '--no-sandbox',
    //         '--disable-setuid-sandbox'
    //     ]
    // });
    // const page = await browser.newPage();
    // await page.goto('http://hr.iconframework.com/Webtime/');
    // await page.type('#txtUser', e.Id)
    // await page.type('#txtPWD', e.password)
    // await page.select('#DropDownList1', "1")
    // await page.click('#Button1')
    // await page.goto('http://hr.iconframework.com/Webtime/work/WebAddInOut.aspx')

    // const inputType = {
    //     "check-in": '#txt_OT_TimeE',
    //     "check-out": "#txt_OT_Times"
    // }

    // const select = {
    //     "check-in": {
    //         field: '#Table2 > tbody > tr:nth-child(2) > td:nth-child(3) > #DrpStatus',
    //         option: "8"
    //     },
    //     "check-out": {
    //         field: '#Table2 > tbody > tr:nth-child(4) > td:nth-child(3) > #DrpStatus1',
    //         option: "9"
    //     }
    // }


    // await page.type(inputType[e.typeCheck], e.time)
    // await page.select(select[e.select].field, select[e.select].option)
    // await page.click("#Table2 > tbody > tr:nth-child(2) > td:nth-child(4) > #Button1")
    // await page.screenshot({ path: 'example6.png' });

    // await browser.close();


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


app.get('/', (req, res) => {

    return res.send({ body: "Hello" })

})

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



const readDataFromSheet = async () => {
    const authen = await google_client.authorize(async (err, tokens) => {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log('Connected!');

            // await inComeOffice(data)

        }
    });

    let gsapi = await google.sheets({ version: 'v4', auth: google_client });

    const request = {
        // The ID of the spreadsheet to update.
        spreadsheetId: spreadsheetId,  // TODO: Update placeholder value.
        range: 'A2:D',  // TODO: Update placeholder value.


    };

    let data = await gsapi.spreadsheets.values.get(request);
    return data.data.values
}


const writeDataToSheet = async (e) => {

    console.log("e:", e)
    const authen = await google_client.authorize(async (err, tokens) => {
        if (err) {
            console.log(err);
            return;
        } else {

            console.log('Connected!');
            let gsapi = await google.sheets({ version: 'v4', auth: google_client });

            const request = {
                // The ID of the spreadsheet to update.
                spreadsheetId: spreadsheetId,  // TODO: Update placeholder value.

                // The A1 notation of a range to search for a logical table of data.
                // Values are appended after the last row of the table.
                range: 'A2:D',  // TODO: Update placeholder value.
                // How the input data should be interpreted.
                valueInputOption: 'RAW',  // TODO: Update placeholder value.

                // How the input data should be inserted.
                insertDataOption: 'INSERT_ROWS',  // TODO: Update placeholder value.

                resource: {
                    // TODO: Add desired properties to the request body.
                    "values": [
                        [
                            e.displayName, e.userId, "ยังไม่ได้กรอกข้อมูล", "ยังไม่ได้กรอกข้อมูล"
                        ]
                    ]
                },

                auth: google_client,
            };

            try {
                const response = await gsapi.spreadsheets.values.append(request);
                console.log("response: ", response.data)

            } catch (err) {
                console.error(err);
            }
            // await inComeOffice(data)

        }
    });


}


const sendImgCheck = (url) => {
    let ImgMessage = {
        type: "image",
        originalContentUrl: url,
        previewImageUrl: url
      }
    return ImgMessage
}

const sendTextFinish = () => {
    let txt = {
        "type": "text",
        "text": "เสร็จแล้วโฮ่งๆ เนื่องจากยังอยู่ในช่วงทดสอบ อย่าลืมตรวจสอบ ในรูปภาพด้วยนะครับว่าถูกต้องหรือไม่"
    }
    return txt
}

const sendTextWaiting = () => {
    let txt = {
        "type": "text",
        "text": "รอแป๊ปนะวัยรุ่น"
    }
    return txt
}

const sendTextRejectToRegis = () => {
    let txt = {
        "type": "text",
        "text": "ท่านยังไม่ได้กรอก username และ password สำหรับ checkIn เอาไว้ กรุณาเข้าไปกรอกข้อมูลที่ลิงค์นี้ โดยค้นหาชื่อเล่นใน Line ของตัวเอง https://docs.google.com/spreadsheets/d/19T5K7L5oEY6Gz5p2i4jw8GHdaw_0MDgRD3clYGYlRdI/edit?usp=sharing"
    }
    return txt
}

const sendQuickReplyCheckin = (e) => {
    let quickReply = {
        "type": "text", // ①
        "text": "จะทำอะไรโฮ่ง!",
        "quickReply": { // ②
            "items": [
                {
                    "type": "action", // ③
                    "action": {
                        "type": "postback",
                        "label": "CheckIn",
                        "data": `CheckIn/${e.username}/${e.password}`,
                        "text": "CheckIn"
                    }
                },
                {
                    "type": "action",
                    "action": {
                        "type": "postback",
                        "label": "CheckOut",
                        "data": `CheckOut/${e.username}/${e.password}`,
                        "text": "CheckOut"
                    }
                }

            ]
        }
    }

    return quickReply
}

const conditionCheckProfile = (e) => {

    if (e.data === undefined) {
        writeDataToSheet(e.profile)
        return sendTextRejectToRegis()
    }

    if (e.data[2] === "ยังไม่ได้กรอกข้อมูล") {
        console.log(e.data[2])
        return sendTextRejectToRegis()
    }


    return sendQuickReplyCheckin({ username: e.data[2], password: e.data[3] })
}

const checkInState = async (event, userId) => {

    let allData = await readDataFromSheet()
    let data = allData.find(ele => {
        let indexOf = ele.indexOf(userId)
        if (indexOf > -1) {
            return ele
        }
    })

    client.getProfile(userId).then(async (profile) => {
        let result = null

        result = await conditionCheckProfile({ data, profile })
        await client.replyMessage(event.replyToken, result);
    });

}

const postBackCheckIn = async (data, time, event, userId) => {

    await client.pushMessage(userId, sendTextWaiting());
    const browser = await puppeteer.launch({
        'args': [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();
    await page.goto('http://hr.iconframework.com/Webtime/', { waitUntil: 'load', timeout: 0 });
    await page.type('#txtUser', data[1])
    await page.type('#txtPWD', data[2])
    await page.select('#DropDownList1', "1")
    await page.click('#Button1')

    await page.goto('http://hr.iconframework.com/Webtime/work/WebAddInOut.aspx', { waitUntil: 'load', timeout: 0 })
    await page.screenshot({path:"aaa.png"});
    const inputType = {
        "CheckIn": '#Table2 > tbody > tr:nth-child(2) > td:nth-child(2) > #txt_OT_TimeE',
        "CheckOut": '#txt_OT_Times'
    }

    const select = {
        "CheckIn": {
            field: '#Table2 > tbody > tr:nth-child(2) > td:nth-child(3) > #DrpStatus',
            option: "8"
        },
        "CheckOut": {
            field: '#Table2 > tbody > tr:nth-child(4) > td:nth-child(3) > #DrpStatus1',
            option: "9"
        }
    }

    try {
        await page.waitForTimeout(8000)
        
        await page.waitForSelector(inputType[data[0]], { timeout: 120000 });
        await page.evaluate(() => {
            const checkin = document.querySelector(inputType[data[0]]);
            checkin.value = time;
          });
        // await page.type(inputType[data[0]], time)
        await page.select(select[data[0]].field, select[data[0]].option)

        // await page.click("#Table2 > tbody > tr:nth-child(2) > td:nth-child(4) > #Button1")
        await page.waitForTimeout(8000)
        let encode = await page.screenshot({ encoding: "base64" });

        const options = {
            apiKey: process.env.IMGBB_API_KEY, // MANDATORY          
            name: "test", // OPTIONAL: pass a custom filename to imgBB API

            expiration: 3600 /* OPTIONAL: pass a numeric value in seconds.
            It must be in the 60-15552000 range (POSIX time ftw).
            Enable this to force your image to be deleted after that time. */,
            base64string: encode
        };


       await imgbbUploader(options)
            .then((response) =>{
                let url = response.url
                client.pushMessage(userId, sendImgCheck(url))
            })
            .catch((error) => console.error(error));

    await client.pushMessage(userId, sendTextFinish())
        // await client.pushMessage(userId, sendWebViewCheck())
        // await client.pushMessage(userId, sendTextFinish())
    } catch (err) {
        console.error(err)
    }


    //  await client.pushMessage(userId, sendTextFinish())

    await browser.close();
    // await client.replyMessage(event.replyToken,sendWebViewCheck())
}

// event handler
async function handleEvent(event) {
    console.log("event : ", event)
    const userId = event.source.userId
    const eventType = ["message", "postback", "action", "uri"]
    if (eventType.indexOf(event.type) === -1) {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    if (event.type === "message") {
        switch (event.message.text) {
            case "ไอ้โบ้!": await checkInState(event, userId)
                break;
            default: break;
        }
    }

    if (event.type === "postback") {
        let data = event.postback.data.split("/")
        switch (data[0]) {
            case "CheckIn": await postBackCheckIn(data, "09:00", event, userId)
                break;
            case "CheckOut": await postBackCheckIn(data, "18:00", event, userId)
                break;
            default: break;
        }
    }



    // const eventReply = {
    //     "ไอ้โบ้!": async () => { await checkInState(event,userId) }
    // }

    // return eventReply[event.message.text]

}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});