// fs = fileSystem
// core module,3rd party module,then our own
const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

//////////////////////////////////////////////////////
// FILES

// Blocking, synchronous way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;

// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File written!');

// Non-blocking, asynchronous way
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//   if (err) return console.log('Error 💣');

//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     console.log(data2);
//     fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//       console.log(data3);

//       fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', (err) => {
//         console.log('Your file has been written 😊 ');
//       });
//     });
//   });
// });

// console.log('Will read file!');

//////////////////////////////////////////////////////
// SERVER

//  BlockingCode Top level code (only executed once)

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

// Course
// const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
// console.log(slugs);

// Instead of ?id=0 etc we put their slug name
dataObj.map((el) => {
  el.slug = slugify(el.productName, { lower: true });
});

// Each time new request hits our server , this callback function here will be get called
// (request,response) clg to see more
const server = http.createServer((req, res) => {
  // url.parse() deprecated
  // const { query, pathname } = url.parse(req.url, true);

  /*
    OTHER METHOD:

// At the top  of your file, add this code:
const querystring = require('querystring');

//Create the absolute URL. Combine baseurl with relative path(comes from req.url)
    const baseURL = `http://${req.headers.host}`;
    const requestURL = new URL(req.url, baseURL);
// Get's the relative path requested from the URL. In this case it's /product. 
    const pathname = requestURL.pathname;
// Get's the query data from the URL. This is ?id=0 We store this in queryURL
    const queryURL = requestURL.search;
// Remove the ? from the ?id=0 before we make it into an object.
    const parseString = queryURL.substring(1); 
// Parse the query into an object. Our object will be the query variable.
    const query = querystring.parse(parseString);
    
/* The query variable now holds this data(do a console.log to see): 
[Object: null prototype] { id: '0' }
*/

  // New method
  const baseURL = `http://${req.headers.host}`;
  // here req.url is the relative url like /product?id=0
  // and baseURL is the base of the server url 127.0.0.1:8000
  const requestURL = new URL(req.url, baseURL);
  // requestURL variable contains the absolute URL.
  // In this case it's http://localhost:8000/product?id=1

  // Get the path name from URL: /product
  const pathname = requestURL.pathname;

  // Get the query from the URL.
  const query = requestURL.searchParams.get('id');
  // .searchParams returns this: URLSearchParams { 'id' => '1' }

  // Routing

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');

    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);
  }

  // Product page
  else if (pathname.includes('/product/')) {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const slug = pathname.replace('/product/', '');
    const product = dataObj.filter((element) => element.slug === slug)[0];
    // Query ?id='' gets 0,1,2,3 etc
    // const product = dataObj[query];

    const output = replaceTemplate(tempProduct, product);

    res.end(output);
  }
  // Product page with ?id=0
  else if (pathname.includes('/product')) {
    const product = dataObj[query];
    if (product) {
      const output = replaceTemplate(tempProduct, product);
      res.end(output);
    } else {
      res.end('Search with query like /product?id=0 or with slug');
    }
  }

  // API
  else if (pathname === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  }

  // Not found
  else {
    // statusCode,reasonPhrase in (), header

    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world',
    });

    // Chunk(text)(html)(string),callbackFunction
    res.end('<h1 style = "color:blue">Page not found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});

// web API  an api is a service from which we can request some data
