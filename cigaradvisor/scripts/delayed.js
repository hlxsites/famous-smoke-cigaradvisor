// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

const FOX_PUSH_SCRIPT = `
var _foxpush = _foxpush || [];
_foxpush.push(['_setDomain', 'cigaradvisorcom']);
(function () {
    var foxscript = document.createElement('script');
    foxscript.src = '//cdn.foxpush.net/sdk/foxpush_SDK_min.js';
    foxscript.type = 'text/javascript';
    foxscript.async = 'true';
    var fox_s = document.getElementsByTagName('script')[0];
    fox_s.parentNode.insertBefore(foxscript, fox_s);
})();
`;

const ACCESSIBILITY_PLUGIN_SCRIPT = `
  (function(document, tag) {
    var script = document.createElement(tag);
    var element = document.getElementsByTagName('body')[0];
    script.src = 'https://acsbap.com/apps/app/assets/js/acsb.js';
    script.async = true;
    script.defer = true;
    (typeof element === 'undefined' ? document.getElementsByTagName('html')[0] : element).appendChild(script);
    script.onload = function() {
      acsbJS.init({
        statementLink: '',
        feedbackLink: '',
        footerHtml: '',
        hideMobile: false,
        hideTrigger: false,
        language: 'en',
        position: 'right',
        leadColor: '#146FF8',
        triggerColor: '#146FF8',
        triggerRadius: '50%',
        triggerPositionX: 'right',
        triggerPositionY: 'bottom',
        triggerIcon: 'default',
        triggerSize: 'medium',
        triggerOffsetX: 20,
        triggerOffsetY: 20,
        mobile: {
          triggerSize: 'small',
          triggerPositionX: 'right',
          triggerPositionY: 'bottom',
          triggerOffsetX: 0,
          triggerOffsetY: 0,
          triggerRadius: '0'
        }
      });
    };
  }(document, 'script'));
`;

const WISE_POPUP_SCRIPT = `
(function(w, i, s, e) {
    window[w] = window[w] || function() {
      (window[w].q = window[w].q || []).push(arguments)
    };
    window[w].l = Date.now();
    s = document.createElement('script');
    e = document.getElementsByTagName('script')[0];
    s.defer = 1;
    s.src = i;
    e.parentNode.insertBefore(s, e)
  })
  ('wisepops', '//wisepops.net/loader.js?v=2&h=cxkWCQVAxq');
`;

function loadGTM() {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.id = 'google-gtagjs-js';
  script.src = '  https://www.googletagmanager.com/gtag/js?id=GT-PHR6L87\n'
  document.querySelector('head').append(script);
}

function loadFoxPush() {
  const script = document.createElement('script');
  script.setAttribute('data-cfasync', false);
  script.innerHTML = FOX_PUSH_SCRIPT;
  document.querySelector('head').append(script);
}

function loadAccessibility() {
  const script = document.createElement('script');
  script.innerHTML = ACCESSIBILITY_PLUGIN_SCRIPT;
  document.querySelector('body').append(script);
}

function loadWisePopup() {
  const script = document.createElement('script');
  script.innerHTML = WISE_POPUP_SCRIPT;
  document.querySelector('body').append(script);
}

window.setTimeout(() => {
  if (window.location.hostname !== 'localhost') {
    loadGTM();
    loadFoxPush();
    loadAccessibility();
    loadWisePopup();
  }
}, 3000);
