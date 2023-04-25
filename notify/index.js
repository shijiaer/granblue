const args = new URLSearchParams(location.search);

document.querySelector('h1').textContent = args.get('title');
document.querySelector('p').textContent = args.get('message');
if (args.get('name').indexOf('alarm') !== -1) {
  document.querySelector('img').src = 'imgs/alarm.svg';
}
else if (args.get('name').indexOf('timer') !== -1) {
  document.querySelector('img').src = 'imgs/timer.svg';
}
else {
  document.querySelector('img').src = 'imgs/stopwatch.svg';
}

chrome.runtime.sendMessage({
  method: 'position',
  screen: {
    width: screen.width,
    height: screen.height
  },
  window: {
    width: window.outerWidth,
    height: window.outerHeight
  },
  position: args.get('position')
}, () => chrome.runtime.lastError);

document.getElementById('done').onclick = () => window.close();

document.getElementById('next_one').onclick = () => {
  chrome.runtime.sendMessage({
    method: 'next_one'
  });
};

// audio
const audio = {};
audio.cache = {};
audio.play = (id, src, n = 5, volume = 0.8) => {
  audio.stop(id);
  const e = new Audio();
  e.volume = volume;
  e.addEventListener('ended', function() {
    n -= 1;
    if (n > 0) {
      e.currentTime = 0;
      e.play();
    }
    else {
      delete audio.cache[id];
    }
  }, false);
  audio.cache[id] = e;
  e.src = '/' + src;
  e.play();
};
audio.stop = id => {
  const e = audio.cache[id];
  if (e) {
    e.pause();
    e.currentTime = 0;
    delete audio.cache[id];
  }
};
audio.play(args.get('name'), args.get('sound'), Number(args.get('repeats'), Number(args.get('volume'))));

// bring to front
window.onblur = () => setTimeout(() => chrome.runtime.sendMessage({
  method: 'bring-to-front'
}, () => chrome.runtime.lastError), 100);

// messaging
chrome.runtime.onMessage.addListener((request, sender, resposne) => {
  if (request.method === 'remove-notification') {
    if (request.name === args.get('name')) {
      resposne(true);
      window.close();
    }
  }
  else if (request.method === 'remove-all-notifications') {
    window.close();
  }
});