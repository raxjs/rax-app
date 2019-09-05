module.exports = `/**
*
* Please register this file in your app, and it's same origin
* required with your website.
*
* This file is auto generated, Please do not edit it directly,
* make changes to your rax-plugin-pwa config and rebuild your
* project.
*
*/

// precache list, specific URL required
const PRE_CACHE_URL_LIST = <%= JSON.stringify(preCacheUrlList) %>;

// ignore following assets, match thougth regExp
const IGNORE_PATTERN_LIST = <%= JSON.stringify(ignorePatternList) %>;

// chche following assets, match thougth regExp
const SAVED_CACHE_PATTERN_LIST = <%= JSON.stringify(savedCachePatternList) %>;
const CACHE_ID = 'RAX_PWA_SW_CACHE_<%= cacheId %>';

// combo url pattern
const COMBO_PATTERN = '<%= comboPattern %>';
const COMBO_SPLIT_PATTERN = '<%= comboSplitPattern %>';
const FETCH_TIMEOUT = Number(<%= timeout %>);

// split combos as array
const splitCombo = (url = '') => {
  const match = url.match(stringToReg(COMBO_PATTERN));

  if (match === null) {
    return [];
  }
  return match[1].split(COMBO_SPLIT_PATTERN);
}

// check two specific urls is same, even if the combo order is different
const isSameCombo = (aUrl = '', bUrl = '') => {
  if (aUrl === bUrl) return true;

  const aCombos = splitCombo(aUrl);
  const bCombos = splitCombo(bUrl);

  if (
    aCombos.length !== bCombos.length
    || aCombos.length === 0
    || bCombos.length === 0
  ) return false;

  return !aCombos.some(combo => bCombos.indexOf(combo) === -1);
}

const matchCache = (req) => {
  const { url = '' } = req;

  return caches.open(CACHE_ID).then(cache => {
    return cache.match(url).then(res => {
      // If matched the cache, use this.
      if (res) return res;

      // Find same combo request
      return cache.keys().then(res => {
        let i = -1;

        while(++i < res.length) {
          const resItem = res[i];

          if (isSameCombo(url, resItem.url)) {
            // resItem is useless for a response,
            // the resItem.body is undefined
            return cache.match(resItem.url);
          }
        }
      });
    });
  });
}

// precache the target assets.
const precache = (target) => {
  return caches.open(CACHE_ID).then((cache) => {
    return cache.addAll(target);
  });
};

const stringToReg = (str) => {
  if (!str) return;
  const match = str.match(/^\\/(.*)\\/(\\w*)/);;
  if (!match) return;
  const [, pattern, flags] = match;
  return new RegExp(pattern, flags);
}

const isMatch = (patternStr, testStr) => {
  const reg = stringToReg(patternStr);

  if (!reg||!testStr) return false;

  return !!testStr.match(reg);
}

// save cache
const saveCache = (req, res) => {
  if (req && res && res.ok) {
    return caches.open(CACHE_ID).then(cache => {
      cache.put(req.url, res);
    });
  }
  return Promise.resolve();
}

const clonedFetch = (req, options, timeout) => {
  return new Promise((resolve, reject) => {
    if (timeout > 0) {
      setTimeout(function() {
        reject(new Error("Fetch timeout"))
      }, timeout);
    }

    fetch(req.clone(), options).then(res => {
      saveCache(req, res.clone());
      resolve(res);
    });
  })
}

<% if (skipWaiting) { %>
// skip service worker waiting become the active worker
const skipWaiting = () => {
  addEventListener('install', () => self.skipWaiting());
};

skipWaiting();
<% } %>
<% if (clientsClaim) { %>
// When a service worker is initially registered, pages won't
// use it until they next load. The clientsClaim() function causes
// those pages to be controlled immediately.
const clientsClaim = () => {
  addEventListener('activate', () => self.clients.claim());
};

clientsClaim();
<% } %>

self.addEventListener('install', (event) => {
  event.waitUntil(precache(PRE_CACHE_URL_LIST));
});

self.addEventListener('fetch', event => {
  let url = new URL(event.request.url);

  if (
    event.request.method != 'GET' ||
    !SAVED_CACHE_PATTERN_LIST.some(pat => isMatch(pat, url.href)) ||
    // ignore IGNORE_PATTERN_LIST
    IGNORE_PATTERN_LIST.some(pat => isMatch(pat, url.href))
  ) {
    return;
  }

  // is same-origin
  const isSameOrigin = url.host === self.location.host;
  // is html request
  const isNavigate = event.request.mode === 'navigate'
    || event.request.destination === 'document';
  const fetchOptions = isSameOrigin ? {} : {
    mode: 'cors',
    credentials: 'omit'
  }
  const cloneFetchRes = clonedFetch(event.request, fetchOptions, FETCH_TIMEOUT);

  if (isNavigate) {
    // html request always fetch
    event.respondWith(cloneFetchRes.catch(_ => matchCache(event.request)));
  } else {
    // cache priority for others
    event.respondWith(matchCache(event.request).then(res => {
      // cache hits
      if (res) {
        return res;
      }

      return cloneFetchRes;
    }));
  }
});
`;
