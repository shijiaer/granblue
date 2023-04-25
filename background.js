// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

function isContains(str, sub) {
  return str.indexOf(sub);
}

const notifications = {
  clear(name, c) {
    chrome.runtime.sendMessage({
      method: 'remove-notification',
      name
    }, () => {
      chrome.runtime.lastError;
      c();
    });
  },
  create(name, opts) {
    const args = new URLSearchParams();
    args.set('name', name);
    args.set('title', opts.title);
    args.set('message', opts.message);
    args.set('sound', opts.sound);
    args.set('volume', opts.volume);
    args.set('repeats', opts.repeats);
    var left0 = 0;
    var top0 = 0;
    chrome.storage.sync.get("left", function (result) {
      if(JSON.stringify(result) !== '{}') {
        left0 = result.left;
      }
    });
    chrome.storage.sync.get("top", function (result) {
      if(JSON.stringify(result) !== '{}') {
        top0 = result.top;
      }
    });

    chrome.storage.local.get({
      'notify-position': 'center' // center, br, tr
    }, prefs => {
      args.set('position', prefs['notify-position']);

      const p = {
        width: 580,
        height: 250,
        type: 'popup',
        url: 'notify/index.html?' + args.toString(),
        left: left0,
        top: top0
      };
      chrome.windows.create(p, (wind) => {
        cache.closed = false
      });
    });
  },
  kill() {
    chrome.runtime.sendMessage({
      method: 'remove-all-notifications'
    }, () => chrome.runtime.lastError);
  }
};

const cache = {
  closed: true,
  id: 0,
  window: 0,
  name: ""
};

var check = null;
function CheckUrl(enable) {
  if(enable && check === null){
    check = setInterval(function () {
      chrome.tabs.query({
            active: true
          }, tabs => {
            for (var i = 0; i < tabs.length; ++i) {
              let url = tabs[i].url;
              var subs = "https://game.granbluefantasy.jp/#result";
              var idx = isContains(url, subs);
              if(idx < 0) {
                continue;
              }
              var raidId = url.substring(subs.length + 1);
              if(cache.closed && cache.id !== raidId) {
                cache.id = raidId;
                cache.window = tabs[i].windowId;
                cache.name = "FA Over";
                notifications.create("FA Over", {
                  title: "FA Over",
                  message: "Your FA is Over!" + '\n\n' + (new Date()).toLocaleString(),
                  sound: "sounds/1.mp3",
                  volume: 10,
                  repeats: 0
                });
              }
            }
          }
      )
    }, 1000)
  }
  else{
    clearInterval(check)
    check = null;
  }
}

chrome.storage.sync.get("SwitchEnabled", function (result) {
  CheckUrl(result.SwitchEnabled)
});

chrome.runtime.onMessage.addListener(function (request, sender, respose) {
  if (request.method === 'position') {
    if (request.position === 'center') {
      chrome.windows.update(sender.tab.windowId, {
        left: parseInt((request.screen.width - request.window.width) / 2),
        top: parseInt((request.screen.height - request.window.height) / 2)
      });
      chrome.storage.sync.set({ "left": parseInt((request.screen.width - request.window.width) / 2) }, function () { });
      chrome.storage.sync.set({ "top": parseInt((request.screen.height - request.window.height) / 2) }, function () { });
    }
  }
  else if(request.method === 'start') CheckUrl(true);
  else if(request.method === 'stop') CheckUrl(false);
  else if(request.method === 'next_one') {
    notifications.clear(cache.name, () => {
      chrome.windows.update(cache.window, {focused: true})
    })
  }
})

chrome.windows.onRemoved.addListener(function(windowId) {
  cache.closed = true;
});
