#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { company } from './data/company.mjs'
import { translations } from './data/translations.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SCHEMA_TYPE = 'AutomotiveBusiness'
const FONT_LINK = 'Source+Sans+3:wght@400;500;600;700'
const FONT_FAMILY = 'Source Sans 3'
const THEME_COLOR = '#2f6a8a'
const HAS_PHONE = true

const serviceImages = ['/assets/images/service-1.jpg','/assets/images/service-2.jpg','/assets/images/service-3.jpg']
const galleryImages = ['/assets/images/gallery-1.jpg','/assets/images/gallery-2.jpg','/assets/images/gallery-3.jpg','/assets/images/gallery-4.jpg']

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function pageUrl(locale){return `${company.siteUrl}${translations[locale].path}`}
function langSwitcher(locale){
  return [
    {code:'ja',label:'日本語',href:'/'},
    {code:'en',label:'English',href:'/en/'},
    {code:'pt',label:'Português',href:'/pt/'}
  ].map(item=>{
    const active=item.code===locale?' aria-current="page" class="lang-link is-active"':' class="lang-link"'
    return `<a href="${item.href}"${active} hreflang="${item.code==='pt'?'pt-BR':item.code}">${item.label}</a>`
  }).join('<span class="lang-sep" aria-hidden="true">/</span>')
}
function hoursList(t){
  if(!t.hoursRows?.length) return `<li><span class="hours-time">${esc(t.info.note)}</span></li>`
  return t.hoursRows.map(r=>`<li><span class="hours-day">${esc(r.day)}</span><span class="hours-time">${esc(r.hours)}</span></li>`).join('\\n')
}
function servicesBlock(t){
  return t.services.items.map((item,i)=>`
        <article class="service-band reveal">
          <div class="service-media"><img src="${serviceImages[i]}" alt="${esc(item.imageAlt)}" loading="lazy" width="900" height="700" /></div>
          <div class="service-copy"><p class="service-num">${esc(item.num)}</p><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div>
        </article>`).join('\\n')
}
function galleryBlock(t){
  return galleryImages.map((src,i)=>`<figure class="gallery-tile reveal"><img src="${src}" alt="${esc(t.gallery.alts[i])}" loading="lazy" width="1200" height="800" /></figure>`).join('\\n')
}
function schemaJson(locale,t){
  const data={
    '@context':'https://schema.org','@type':SCHEMA_TYPE,'@id':`${company.siteUrl}/#business`,
    name:company.nameJa,alternateName:[company.nameEn],description:t.schemaDescription,
    url:pageUrl(locale),image:`${company.siteUrl}/og.svg`,
    ...(company.phoneIntl?{telephone:company.phoneIntl}:{}),
    address:{'@type':'PostalAddress',postalCode:company.postalCode,addressRegion:company.addressRegion,addressLocality:company.addressLocality,streetAddress:company.streetAddress,addressCountry:'JP'},
    geo:{'@type':'GeoCoordinates',latitude:company.latitude,longitude:company.longitude},
    hasMap:company.mapsUrl,
    ...(company.openingHoursSpecification?.length?{openingHoursSpecification:company.openingHoursSpecification.map(h=>({'@type':'OpeningHoursSpecification',...h}))}:{}),
    areaServed:{'@type':'City',name:'Nantan'}
  }
  return JSON.stringify(data,null,2)
}
function mapEmbed(locale){
  const hl=locale==='ja'?'ja':locale==='en'?'en':'pt-BR'
  return `https://maps.google.com/maps?q=${encodeURIComponent(company.nameJa+' '+company.addressFullJa)}&hl=${hl}&z=16&ie=UTF8&output=embed`
}
function render(locale){
  const t=translations[locale]
  const canonical=pageUrl(locale)
  const year=new Date().getFullYear()
  const telHref=HAS_PHONE?`tel:${company.phoneTel}`:'#access'
  const primaryHref=HAS_PHONE?telHref:'#access'
  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${esc(t.meta.description)}" />
<link rel="canonical" href="${canonical}" />
<link rel="alternate" hreflang="ja" href="${company.siteUrl}/" />
<link rel="alternate" hreflang="en" href="${company.siteUrl}/en/" />
<link rel="alternate" hreflang="pt-BR" href="${company.siteUrl}/pt/" />
<link rel="alternate" hreflang="x-default" href="${company.siteUrl}/" />
<meta name="robots" content="index, follow" /><meta name="theme-color" content="${THEME_COLOR}" />
<meta property="og:type" content="website" /><meta property="og:locale" content="${t.ogLocale}" />
<meta property="og:site_name" content="${esc(company.nameJa)}" /><meta property="og:title" content="${esc(t.meta.title)}" />
<meta property="og:description" content="${esc(t.meta.description)}" /><meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${company.siteUrl}/og.svg" />
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${esc(t.meta.title)}" />
<meta name="twitter:description" content="${esc(t.meta.description)}" /><meta name="twitter:image" content="${company.siteUrl}/og.svg" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" /><link rel="manifest" href="/site.webmanifest" />
<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=${FONT_LINK}&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/styles/main.css" />
<script type="application/ld+json">
${schemaJson(locale,t)}
</script>
</head>
<body data-locale="${locale}">
<a class="skip-link" href="#main">${esc(t.skip)}</a>
<header class="site-header" id="navbar"><div class="container header-inner">
<a class="logo" href="${t.path}"><span class="logo-mark">${esc(company.nameShortJa)}</span><span class="logo-sub">${esc(company.nameEn)}</span></a>
<nav aria-label="Main"><ul class="nav-menu" id="navMenu">
<li><a href="${t.path}">${esc(t.nav.home)}</a></li>
<li><a href="#services">${esc(t.nav.services)}</a></li>
<li><a href="#about">${esc(t.nav.about)}</a></li>
<li><a href="#info">${esc(t.nav.info)}</a></li>
<li><a href="#access">${esc(t.nav.access)}</a></li>
<li class="nav-lang-mobile" aria-label="${esc(t.nav.lang)}">${langSwitcher(locale)}</li>
</ul></nav>
<div class="header-actions">
<div class="lang-switch" aria-label="${esc(t.nav.lang)}">${langSwitcher(locale)}</div>
${HAS_PHONE?`<a class="btn btn-call-header" href="${telHref}">${esc(t.nav.call)}</a>`:''}
<button class="menu-toggle" id="menuToggle" type="button" aria-label="${esc(t.nav.menuOpen)}" aria-controls="navMenu" aria-expanded="false"><span></span><span></span><span></span></button>
</div></div></header>
<main id="main">
<section class="hero"><div class="hero-media"><img src="/assets/images/hero.jpg" alt="${esc(t.hero.imageAlt)}" width="2000" height="1400" fetchpriority="high" /></div><div class="hero-veil"></div>
<div class="hero-copy"><p class="hero-place">${esc(t.hero.place)}</p><p class="hero-brand">${esc(t.hero.brand)}</p><h1>${esc(t.hero.lead)}</h1><p class="hero-sub">${esc(t.hero.sub)}</p>
<div class="hero-actions"><a class="btn btn-primary" href="${primaryHref}">${esc(t.hero.ctaPhone)}</a><a class="btn btn-line" href="#access">${esc(t.hero.ctaAccess)}</a></div></div></section>
<section class="section about" id="about"><div class="container about-layout">
<div class="about-copy reveal"><p class="eyebrow">${esc(t.about.eyebrow)}</p><h2>${esc(t.about.title)}</h2><p class="lead">${esc(t.about.p1)}</p><p>${esc(t.about.p2)}</p></div>
<figure class="about-photo reveal"><img src="/assets/images/about.jpg" alt="${esc(t.about.imageAlt)}" loading="lazy" width="1400" height="1000" /></figure>
</div></section>
<section class="section services" id="services"><div class="container"><div class="section-head reveal"><p class="eyebrow">${esc(t.services.eyebrow)}</p><h2>${esc(t.services.title)}</h2><p class="lead">${esc(t.services.lead)}</p></div>
<div class="services-flow">${servicesBlock(t)}</div></div></section>
<section class="section gallery" id="gallery"><div class="container"><div class="section-head reveal"><p class="eyebrow">${esc(t.gallery.eyebrow)}</p><h2>${esc(t.gallery.title)}</h2><p class="lead">${esc(t.gallery.lead)}</p></div>
<div class="gallery-masonry">${galleryBlock(t)}</div></div></section>
<section class="section info" id="info"><div class="container"><div class="section-head reveal"><p class="eyebrow">${esc(t.info.eyebrow)}</p><h2>${esc(t.info.title)}</h2></div>
<div class="info-sheet reveal"><dl class="info-dl">
<div><dt>${esc(t.info.name)}</dt><dd>${esc(company.nameJa)}<span class="info-sub">${esc(company.nameEn)}</span></dd></div>
<div><dt>${esc(t.info.category)}</dt><dd>${esc(company.googleCategory)}</dd></div>
<div><dt>${esc(t.info.address)}</dt><dd class="selectable">${esc(t.addressDisplay)}</dd></div>
${HAS_PHONE?`<div><dt>${esc(t.info.tel)}</dt><dd><a class="tel-link" href="${telHref}">${esc(company.phoneDisplay)}</a></dd></div>`:''}
<div><dt>${esc(t.info.hours)}</dt><dd><ul class="hours-list">${hoursList(t)}</ul><p class="closed-note">${esc(t.footer.closedLine)}</p></dd></div>
</dl></div></div></section>
<section class="section access" id="access"><div class="container"><div class="section-head reveal"><p class="eyebrow">${esc(t.access.eyebrow)}</p><h2>${esc(t.access.title)}</h2><p class="lead">${esc(t.access.lead)}</p></div>
<div class="access-layout reveal"><div class="map-embed"><iframe title="${esc(t.access.mapTitle)}" src="${mapEmbed(locale)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
<div class="access-card"><p class="selectable">${esc(t.addressDisplay)}</p><p>${esc(t.footer.hoursLine)}</p>
${HAS_PHONE?`<a class="btn btn-primary" href="${telHref}">${esc(t.contact.phoneCta)}</a>`:''}
<a class="btn btn-line-dark" href="${company.mapsUrl}" target="_blank" rel="noopener noreferrer">${esc(t.access.mapCta)}</a>
</div></div></div></section>
<section class="section contact-cta" id="contact"><div class="container contact-band reveal"><p class="contact-title">${esc(t.contact.title)}</p><p class="contact-brand">${esc(t.contact.brand)}</p>
<div class="contact-actions">${HAS_PHONE?`<a class="btn btn-primary" href="${telHref}">${esc(t.contact.phoneCta)}</a>`:''}<a class="btn btn-ghost" href="${company.mapsUrl}" target="_blank" rel="noopener noreferrer">${esc(t.contact.mapsCta)}</a></div>
</div></section>
</main>
<footer class="site-footer"><div class="container footer-grid"><div><p class="footer-en">${esc(company.nameEn)}</p><p class="footer-brand">${esc(company.nameJa)}</p><p>${esc(t.addressDisplay)}</p>${HAS_PHONE?`<p><a href="${telHref}">${esc(company.phoneDisplay)}</a></p>`:''}<p>${esc(t.footer.hoursLine)}</p></div>
<div class="footer-nav"><a href="#services">${esc(t.nav.services)}</a><a href="#info">${esc(t.nav.info)}</a><a href="#access">${esc(t.nav.access)}</a></div>
<div class="footer-lang" aria-label="${esc(t.nav.lang)}">${langSwitcher(locale)}</div></div>
<div class="container footer-meta"><p>© ${year} ${esc(company.nameJa)} / ${esc(company.nameEn)}. ${esc(t.footer.rights)}</p></div></footer>
<div class="mobile-cta" role="navigation" aria-label="${esc(t.mobile.label)}">
${HAS_PHONE?`<a class="btn btn-primary" href="${telHref}">${esc(t.mobile.call)}</a>`:`<a class="btn btn-primary" href="#info">${esc(t.mobile.call)}</a>`}
<a class="btn btn-line-dark" href="${company.mapsUrl}" target="_blank" rel="noopener noreferrer">${esc(t.mobile.map)}</a>
</div>
<script src="/scripts/main.js" defer></script>
</body></html>`
}
for (const locale of ['ja','en','pt']) {
  const out = locale==='ja' ? resolve(root,'index.html') : resolve(root,locale,'index.html')
  mkdirSync(dirname(out),{recursive:true})
  writeFileSync(out, render(locale))
  console.log('wrote', out)
}
