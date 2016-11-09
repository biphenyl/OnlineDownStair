#!/usr/local/bin/node

var querystring = require('querystring');
var fs = require('fs');
var param = querystring.parse(process.env.QUERY_STRING);
var data = fs.readFileSync('name.json', 'utf-8');

var student = '';
JSON.parse(data, function(k, v) {
  if (param.id == k) {
    student = v;
  }
});
console.log('Content-type: text/html; charset=utf-8\n');
if (student == '' || param.id == '') {
  console.log('<h1>找不到此學號</h1>');
}else {
  console.log('<h1>' + student + ' ，你好R!' + '</h1>');
}
