/* global afterEach, beforeEach, describe, expect, it, mongo, sinon */
/* global xdescribe */
$.ready = function () {}; // Prevent mongo.init() from running.

var CONST = {
  cssFile: 'mongo-web-shell.css'
};


xdescribe('The init function', function () {
  // TODO: The calls made in mongo.init() need to be stubbed; there should be
  // no side effects to the page (alternatively, have side effects but restore
  // the page to the initial state on afterEach()). Then re-enable this.
  var xhr, requests;

  beforeEach(function () {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function (req) { requests.push(req); };
  });

  afterEach(function () {
    xhr.restore();
  });

  it('makes a post request for todo items', function () {
    mongo.init(sinon.spy());
    expect(requests.length).toBe(1);
    expect(requests[0].url).toBe('/mws/');
  });
});


describe('The const module', function () {
  it('stores keycode constants', function () {
    var key = mongo.const.keycodes;
    expect(key.enter).toBe(13);
    expect(key.left).toBe(37);
    expect(key.up).toBe(38);
    expect(key.right).toBe(39);
    expect(key.down).toBe(40);
  });
});


describe('A Cursor', function () {
  // TODO: Test.
});


describe('The dom module', function () {
  it('retrives the shell configuration from the DOM', function () {
    // TODO: Test more than the default values.
    var config = mongo.dom.retrieveConfig();
    // Default values.
    expect(config.cssPath).toBe(CONST.cssFile);
    expect(config.mwsHost).toBe('');
    expect(config.baseUrl).toBe('/mws/');
  });

  it('injects a stylesheet into the DOM', function () {
    function expectAbsentCSS(cssFile) {
      $('link').each(function (index, linkElement) {
        expect(linkElement.href).not.toBe(cssFile);
      });
    }

    // TODO: Should the dom methods be stubbed instead?
    expectAbsentCSS(CONST.cssFile);
    mongo.dom.injectStylesheet(CONST.cssFile);
    var injected = $('head').children().get(0); // Expect to be prepended.
    expect(injected.tagName).toBe('LINK');
    expect(injected.href).toMatch(CONST.cssFile + '$');
    expect(injected.rel).toBe('stylesheet');
    expect(injected.type).toBe('text/css');

    // Clean up.
    injected.parentNode.removeChild(injected);
    expectAbsentCSS(CONST.cssFile);
  });
});


describe('The keyword module', function () {
  // TODO: Test.
});


describe('The mutateSource module', function () {
  // TODO: Test.
});


describe('A Query', function () {
  // TODO: Test.
});


describe('A Readline instance', function () {
  // TODO: Test.
});


describe('The request module', function () {
  it('get result url with parameters resID and collection', function () {
    mongo.config = {baseUrl: '/mws/'};
    expect(mongo.request._getResURL(30, 2)).toEqual('/mws/30/db/2/');
  });

  it('pruneKeys', function () {
    function Param (db, query, projection) {
      this.db = db;
      this.query = query;
      this.projection = projection;
    }
    var param = [new Param(0, null, 0), new Param(0, 0, undefined),
                 new Param(0, undefined, null), new Param(0, 0, 0)];
    var keys = ['query', 'projection'];
    for (var i in param) {
      mongo.request._pruneKeys(param[i], keys);
    }
    expect(Object.keys(param[0]).length).toBe(2);
    expect(Object.keys(param[1]).length).toBe(2);
    expect(Object.keys(param[2]).length).toBe(1);
    expect(Object.keys(param[3]).length).toBe(3);
  });

  it('stringifyKeys', function () {
    var a = {'a':{1:2}};
    var res = {'a':'{"1":2}'};
    mongo.request._stringifyKeys(a);
    expect(a).toEqual(res);
  });
});


describe('A Shell', function () {
  it('injects HTML', function () {
    var mwsBorder = $('.mws-border');
    expect(mwsBorder.length).toEqual(0);
    var shell = new mongo.Shell($('.mongo-web-shell'));
    shell.injectHTML();
    mwsBorder = $('.mws-border');
    expect(mwsBorder.length).toEqual(1);
    expect(mwsBorder.find('.mshell').length).toEqual(1);
    expect(mwsBorder.find('.mshell').find('.mws-input').length).toEqual(1);
  });
});


describe('The util module', function () {
  it('uses indices to divide source returns statements as an array',
    function () {
      var ast = new Object();
      var str0 = 'db.inventory.find( { qty: 50 } )';
      var str1 = 'db.collection.totalSize()';
      var str2 = 'db.products.update( { item: "book", qty: { $gt: 5 } } )';
      var src  = str0 + str1 + str2;
      var params  = new Object();
      var params1 = new Object();
      var params2 = new Object();
      ast.body = [];
      params.range  = {0:0, 1:str0.length};
      params1.range = {0:str0.length, 1:str0.length+str1.length};
      params2.range = {0:str0.length+str1.length, 1:(src.length)};
      ast.body.push(params);
      ast.body.push(params1);
      ast.body.push(params2);
      var statements = mongo.util.sourceToStatements(src, ast);
      expect(statements[0]).toEqual(str0);
      expect(statements[1]).toEqual(str1);
      expect(statements[2]).toEqual(str2);
    });
});
