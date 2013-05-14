var app = global.expressApp;
/*
 * GET home page.
 */

app.get('/',  function(req, res){
    'use strict';
    res.render('index.html', { title: 'Websock demos' });
});

app.get('/hls', function(req,res){
    'use strict';
	res.render('hls.html', { title:'Unencrypted HLS test', source:'/video/ElephantsDream/ElephantsDream.m3u8'});
});

app.get('/hls-bbts', function(req,res){
    'use strict';
	res.render('hls.html', { title:'BBTS encrypted HLS test', source:'/video/ProtectedHls/ElephantsDream.m3u8'});
});
