const http = require('http');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const serveIndex = require('serve-index');

function types(res, url) {
  res.setHeader('Content-Type', mime.contentType(path.basename(url)))
}

function serverPlugin(compiler, options, config) {
  options = Object.assign({
    port: 3000,
    cwd: process.cwd(),
    isChunks: true,
    isHot: true,
    hotPath: "/__hmr",
    errorToClient: true,
    serverHand: () => {
    },
    heartbeat: 2000
  }, config, options);
  const index = serveIndex(options.cwd);
  const eventStream = createEventStream(options.heartbeat);

  if (options.isHot && options.errorToClient) {
    const error = console.error;
    console.error = function (...props) {
      error.apply(console, props);
      eventStream.publish({
        action: 'error',
        args: props
      })
    }
  }
  let server;
  //compiler-after
  compiler.on('compiler-after', function () {
    server = http.createServer((req, res) => {
      hanlder(req, res).then((body) => {

      }).catch(function (e) {
        console.error(e);
      })
    });
    server.listen(options.port, function () {
      console.log(`start:  http://127.0.0.1:${options.port}`)
    })
  });

  //watch 变化
  compiler.on('compiler-watch-after', function (file, items) {
    let arr = [];
    items.forEach((item) => {
      if (item && item.name) {
        arr.push(item.name)
      }
    });
    eventStream.publish({
      action: 'reload',
      items: arr
    })
  });

  compiler.on('hot-to-client', function (obj) {
    eventStream.publish(obj)
  });

  process.on('uncaughtException', function (err) {
    console.log('uncaughtException: ' + err);
    closeHttp()
  });

  process.on('exit', function (err) {
    closeHttp()
  });
  function closeHttp() {
    server && server.on('request', function (req, res) {
      // Let http server set `Connection: close` header, and close the current request socket.
      req.shouldKeepAlive = false;
      res.shouldKeepAlive = false;
      if (!res._header) {
        res.setHeader('Connection', 'close');
      }
    });
  }
  const chunks = compiler.chunks || {};

  function getChunk(url, chunks) {
    let it;
    for (let key in chunks) {
      const item = chunks[key] || {};
      const name = '/' + item.name.replace(/^\//g, '') + '.' + item.ext;
      if (url === name) {
        it = item;
        break;
      }
    }
    return it
  }


  async function hanlder(req, res) {
    const url = req.url;
    console.log(`url: ${url}`);
    const file = path.join(options.cwd, url);
    if (options.isHot && url === options.hotPath) {
      eventStream.handler(req, res);
      return;
    }
    const chunk = getChunk(url, chunks);
    if (options.isChunks && chunk) {
      types(res, url);
      res.content = chunk.content;
      //req.end();
    } else if (fs.existsSync(file)) {
      if (fs.statSync(file).isFile()) {
        types(res, url);
        res.content = fs.readFileSync(file, 'utf-8');
      } else {
        return index(req, res, function (e) {
          if (e) {
            console.error(e)
          }
        })
      }
    }
    if (options.serverHand) {
      await options.serverHand(req, res);
    }
    const content = res.content === undefined ? '404 Not found' : res.content;
    res.end(content)
  }
}


function createEventStream(heartbeat) {
  let clientId = 0;
  let clients = {};

  function everyClient(fn) {
    Object.keys(clients).forEach(function (id) {
      fn(clients[id]);
    });
  }

  setInterval(function heartbeatTick() {
    everyClient(function (client) {
      client.write("data: \uD83D\uDC93\n\n");
    });
  }, heartbeat).unref();

  return {
    handler: function (req, res) {
      req.socket.setKeepAlive(true);
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/event-stream;charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        // While behind nginx, event stream should not be buffered:
        // http://nginx.org/docs/http/ngx_http_proxy_module.html#proxy_buffering
        'X-Accel-Buffering': 'no'
      });
      res.write('\n');
      const id = clientId++;
      clients[id] = res;
      req.on("close", function () {
        delete clients[id];
      });
    },
    publish: function (payload) {
      everyClient(function (client) {
        client.write("data: " + JSON.stringify(payload) + "\n\n");
      });
    }
  };
}


module.exports = serverPlugin;
