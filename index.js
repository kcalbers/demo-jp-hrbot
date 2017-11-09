const slack = require('tinyspeck'),
  events = require('./events.json'),
  redis = require('./redis'),
  _ = require('lodash'),
  handleDialog = require('./handleDialog.js'),
  handleSubmit = require('./handleSubmit.js')


const template = _.template(JSON.stringify(events))
const { PORT, CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN, SCOPE } = process.env


// OAuth Handler
slack.on('/install', (req, res) => {
  if (req.query.code) {
    let redirect = team => res.redirect(team.url)
    let setAuth = auth => redis.set(auth.team_id, auth)
    let testAuth = auth => slack.send('auth.test', { token: auth.access_token })

    let args = { client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code: req.query.code }
    slack.send('oauth.access', args).then(setAuth).then(testAuth).then(redirect)
  } else {
    let url = slack.authorizeUrl({ client_id: CLIENT_ID, scope: SCOPE })
    res.redirect(url)
  }
})

// interactive message handler
slack.on('message', payload => {
    let { team_id, bot_id, channel_id, user_id } = payload
    if (bot_id) return // ignore bots to avoid infinite loops
    let getAuth = redis.get(team_id)
    let getSession = redis.get(`${user_id}_${channel_id}`)
    Promise.all([payload, getAuth, getSession]).then(respond)
  })


  slack.on('interactive_message',  payload => {

    let { team_id, bot_id, channel_id, user_id, type } = payload
    if (bot_id) return // ignore bots to avoid infinite loops
    let getAuth = redis.get(team_id)
    let getSession = redis.get(`${user_id}_${channel_id}`)
    if (type === 'dialog_submission'){
     
      handleSubmit(payload);
    } else {
      
      handleDialog(payload);
    }
    
    })

// Event Handler
// slack.on('message', payload => {
//   let { text } = payload
//   if (/打ち合わせ/i.test(text)) {
//   handleEvent(payload);
//   }
// })


// Responder
function respond(results) {
  let [payload, auth, session] = results
  let token = auth.bot.bot_access_token
  //let token = TOKEN;
  let { channel_id, user_id, action, selection, response_url } = payload
  // reset session on slash commands
  if (payload.is('message')) session = { user_id, channel_id }

  // update session data
  if (action) session[action.name] = action.value
  if (selection) session[action.name] = selection.value

  // rebuild responses
  let responses = JSON.parse(template({ session, payload }))
  

  // parse responses for matching requests
  responses.forEach(response => {
    if (!payload.is(response.on)) return // ignore
    console.log(response);

    // determine if how to respond
    let target = (!response.channel && response_url) ? response_url : { channel: channel_id }
    slack.send(target, response, { token }).then(data => {console.log(data)})
  })

  // set session
  redis.set(`${user_id}_${channel_id}`, session)
}

// start server
slack.listen(PORT, VERIFICATION_TOKEN)