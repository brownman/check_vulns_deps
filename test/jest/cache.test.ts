//package.json content may be different for 2 requests 
//cache file content 
did_file_changed(content){
    var crypto = require('crypto');
    var name = 'braitsch';
    var hash = crypto.createHash('md5').update(content).digest('hex');
    console.log(hash); // 9b74c9897bac770ffc029102a200c5de
}

