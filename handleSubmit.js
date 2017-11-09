const slack = require('tinyspeck'),
redis = require('./redis')

module.exports = function (body) {
   console.log(body);
let getAuth = redis.get(body.team_id);
getAuth.then(function (auth) {

    let message = {
        channel: body.channel.id,
        token: auth.bot.bot_access_token,
        text: "休暇を申請しました！:white_check_mark: 現在承認待ちです。結果は私からお伝えしますね :thumbsup:"
    }

    slack.send(message).then(data => {
        console.log(data);
    })
})

}