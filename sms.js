require('dotenv').config();
var push = require("./app/Service/OneSignalService");

push.sendNotice(["5e29701cf6b8d764f6c60ccd", "5e2970fccc2beb6581dd7984"], "Breaking News!!!", "hello there, are you there??", (err, result) => console.log(result || err));
// console.log(push)