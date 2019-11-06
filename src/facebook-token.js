const FB = require('fb');

const appId = '123605498281814';
const appSecret = 'b1723d0c305f5dad1f163caa6c1b029d';
const fb = new FB.Facebook({ appId, appSecret });

FB.api('oauth/access_token', {
    client_id: appId,
    client_secret: appSecret,
    grant_type: 'client_credentials'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }

    var accessToken = res.access_token;
    console.log(accessToken);
});

// var message = 'Hi from facebook-node-js';
// FB.api('', 'post', {
//     batch: [
//         { method: 'post', relative_url: 'me/feed', body:'message=' + encodeURIComponent(message) }
//     ]
// }, function (res) {
//     var res0;
//
//     if(!res || res.error) {
//         console.log(!res ? 'error occurred' : res.error);
//         return;
//     }
//
//     res0 = JSON.parse(res[0].body);
//
//     if(res0.error) {
//         console.log(res0.error);
//     } else {
//         console.log('Post Id: ' + res0.id);
//     }
// });
