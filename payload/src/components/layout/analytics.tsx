import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

import appConfig from "@/lib/core/config";

export const AnalyticsLayout = () => {
  if (process.env.NODE_ENV === "development") return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />

      {appConfig.GOOGLE_ANALYTICS && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${appConfig.GOOGLE_ANALYTICS}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${appConfig.GOOGLE_ANALYTICS}', {
  page_path: window.location.pathname,
});
`,
            }}
          />
        </>
      )}

      {appConfig.GOOGLE_ADS && (
        <Script
          id="google-ads"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('config', '${appConfig.GOOGLE_ADS}');
`,
          }}
        />
      )}

      {appConfig.TIKTOK_PIXEL && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
!function (w, d, t) {
  w.TiktokAnalyticsObject = t;
  var ttq = (w[t] = w[t] || []);
  ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","setUserProperties","set","reset"];
  ttq.setAndDefer = function(t, e){ t[e] = function(){ t.push([e].concat(Array.prototype.slice.call(arguments,0))) } };
  for (var i = 0; i < ttq.methods.length; i++) { ttq.setAndDefer(ttq, ttq.methods[i]); }
  ttq.instance = function(t){ var e = ttq._i[t] || []; ttq._i[t] = e;
    for (var i=0; i < ttq.methods.length; i++){ ttq.setAndDefer(e, ttq.methods[i]); }
    return e;
  };
  ttq.load = function(e,n){
    var i="https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i = ttq._i || {};
    ttq._i[e] = [];
    ttq._i[e]._u = i;
    ttq._t = ttq._t || {};
    ttq._t[e] = +new Date;
    var o = d.createElement("script");
    o.type="text/javascript";
    o.async = true;
    o.src = i + "?sdkid=" + e + "&lib=" + t;
    var a = d.getElementsByTagName("script")[0];
    a.parentNode.insertBefore(o,a);
  };
  ttq.load('${appConfig.TIKTOK_PIXEL}');
  ttq.page();
}(window, document, 'ttq');
`,
          }}
        />
      )}

      {appConfig.META_PIXEL && (
        <>
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${appConfig.META_PIXEL}');
fbq('track', 'PageView');
`,
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${appConfig.META_PIXEL}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  );
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (name: string) => void };
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackPixelEvent = (name: string) => {
  if (process.env.NODE_ENV === "development") return;

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", name);
  }

  if (typeof window.ttq !== "undefined") {
    window.ttq.track(name);
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name);
  }
};
