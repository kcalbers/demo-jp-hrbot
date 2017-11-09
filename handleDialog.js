const slack = require('tinyspeck'),
    redis = require('./redis')

module.exports = function (body) {
    // Retrieving payload information
    var triggerID = body.trigger_id;
    let getAuth = redis.get(body.team_id);
    getAuth.then(function (auth) {

        let rawDialog = {
            callback_id: "apply",
            title: "休暇申請",
            submit_label: "申請",
            elements: [{
                type: "text",
                label: "日付",
                name: "date"
            }, {
                type: "text",
                label: "理由",
                name: "reason"
            }]
        }

        // open dialog
        let openMsg = {
            token: auth.access_token,
            trigger_id: triggerID,
            dialog: JSON.stringify(rawDialog)

        }
        slack.send('dialog.open', openMsg).then(data => {
            console.log(data);
        })
    })

}