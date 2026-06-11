# Google Analytics 4 Setup

The website is now wired so GA4 can be enabled from a single place.

## Files Added

- [analytics-config.js](/Users/drprachi/Documents/website_building/analytics-config.js)
- [analytics.js](/Users/drprachi/Documents/website_building/analytics.js)

## How to Turn It On

1. Create a Google Analytics 4 property.
2. Create or open your web data stream.
3. Copy the **Measurement ID**.
   It looks like: `G-XXXXXXXXXX`
4. Open [analytics-config.js](/Users/drprachi/Documents/website_building/analytics-config.js)
5. Replace:

```js
gaMeasurementId: null,
```

with:

```js
gaMeasurementId: "G-XXXXXXXXXX",
```

6. Redeploy the site.

## What It Tracks

Once enabled, the site will send:

- page views
- outbound link clicks
- article scroll depth at `25%`, `50%`, `75%`, `90%`, and `100%`
- `article_read_complete` event at `90%` scroll

## What This Means

After setup, in GA4 you will be able to estimate:

- how many people visited the site
- which blog posts they opened
- how far they scrolled
- whether many readers reached near the end of an article
- which external links they clicked

You still will **not** know exact visitor identity unless they voluntarily identify themselves elsewhere.
