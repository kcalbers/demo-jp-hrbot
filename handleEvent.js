const slack = require('tinyspeck'),
    redis = require('./redis')


module.exports = function (body) {
    let { event, team_id } = body;

    let getAuth = redis.get(body.team_id);
    getAuth.then(function (auth) {
    
        let postMessage = {
            channel: event.channel,
            token: auth.bot.bot_access_token,
            text: "来週火曜日の午前10時からなら全員時間が空いています。ミーティングを設定しますか？",
            attachments: [
                {
                    fallback: "Pre-filled because you have actions in your attachment.",
                    color: "#d2dde1",
                    mrkdwn_in: [
                        "text",
                        "pretext",
                        "fields"
                    ],
                    callback_id: "Pre-filled because you have actions in your attachment.",
                    attachment_type: "default",
                    actions: [
                        {
                            name: "yes",
                            text: "はい",
                            type: "button",
                            style: "default",
                            value: "yes"
                        },
                        {
                            name: "no",
                            text: "いいえ",
                            type: "button",
                            style: "default",
                            value: "no"
                        },
                        {
                            name: "other",
                            text: "他の時間を探す",
                            type: "button",
                            style: "default",
                            value: "other"
                        }
                    ]
                }
            ]
        }
        slack.send(postMessage).then(data => {
            // Success!
        })


    })
}