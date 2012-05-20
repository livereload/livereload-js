<?
sleep(1);
header("Content-Type: text/css");
fpassthru(fopen('/Users/andreyvit/dev/products/LiveReload/js/test/html/delayed/test.css', 'rb'));
