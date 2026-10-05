/**
 * 美容室ここち — UI. Linked from generated HTML as /scripts/main.js
 */
;(function () {
  'use strict'

  const navbar = document.getElementById('navbar')
  const menuToggle = document.getElementById('menuToggle')
  const navMenu = document.getElementById('navMenu')

  window.addEventListener(
    'scroll',
    () => {
      if (!navbar) return
      navbar.classList.toggle('is-scrolled', window.pageYOffset > 24)
    },
    { passive: true }
  )

  if (menuToggle && navMenu) {
    const setOpen = open => {
      navMenu.classList.toggle('is-open', open)
      menuToggle.classList.toggle('is-open', open)
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    }

    menuToggle.addEventListener('click', () => {
      setOpen(!navMenu.classList.contains('is-open'))
    })

    navMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => setOpen(false))
    })

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') setOpen(false)
    })
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href')
      if (!href || href === '#') return
      const target = document.querySelector(href)
      if (!target) return
      e.preventDefault()
      const top = target.getBoundingClientRect().top + window.pageYOffset - 72
      window.scrollTo({ top, behavior: 'smooth' })
    })
  })

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'))
  }
})()
