// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

function Start(enable) {
  chrome.runtime.sendMessage({
    'method': enable ? 'start' : 'stop'
  });
}

// An Alarm delay of less than the minimum 1 minute will fire
// in approximately 1 minute increments if released

document.addEventListener('DOMContentLoaded', function () {
  var Switch = document.getElementById("Start1");
  chrome.storage.sync.get("SwitchEnabled", function (result) {
    Switch.checked = result.SwitchEnabled;
  });
  Switch.onclick = () => setSwitch(Switch);
});

function setSwitch(enable) {
  Start(enable.checked)
  if (enable.checked) {
    chrome.storage.sync.set({ "SwitchEnabled": true }, function () { });

  } else {
    chrome.storage.sync.set({ "SwitchEnabled": false }, function () { });
  }
}
