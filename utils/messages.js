let moment = require('moment');
let momenttz = require('moment-timezone');
moment.tz.setDefault("Asia/Kolkata")

function formatMessage(username, text){
    return {
        username,
        text,
        position: ((username === 'ChatApp Bot')?'center': 'left'),
        time: moment().format('h:mm a'),
    }
}

module.exports = formatMessage;