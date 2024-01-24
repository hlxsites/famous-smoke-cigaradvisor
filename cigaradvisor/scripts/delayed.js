// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

function loadConsentManager() {
  window.polarisOptions = {
    kingId: "G-XVRFM32Q28",
    GoogleAnalyticsTrackingId: "G-XVRFM32Q28",
    enableConsentManager: true,
    privacyCenterId: "OTNJF7CVF",
  };
  const script = document.createElement('script');
  script.src = 'https://polaris.truevaultcdn.com/static/polaris.js';
  script.onload = () => {
    // DOMContentLoaded event is required to initialise polaris
    window.document.dispatchEvent(new Event("DOMContentLoaded"));
  };
  document.head.appendChild(script);
}

loadConsentManager();
