/* MOBILE REFRESH RETURNS HOME */

(() => {
  const isMobile = window.matchMedia('(max-width: 780px)').matches;
  if (!isMobile) return;

  const navigationEntry = performance.getEntriesByType('navigation')[0];
  const isReload = navigationEntry
    ? navigationEntry.type === 'reload'
    : performance.navigation && performance.navigation.type === 1;

  if (!isReload) return;

  const goHome = () => {
    history.replaceState(null, '', '#home');
    const home = document.getElementById('home');
    if (home) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      home.scrollIntoView({ block: 'start', behavior: 'auto' });
    } else {
      window.scrollTo(0, 0);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', goHome, { once: true });
  } else {
    goHome();
  }

  window.addEventListener('load', () => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, { once: true });
})();


// Prevent Safari/browser refresh restoration from moving the page on startup.
// This does NOT call scrollTo(). It only disables automatic restoration and
// removes old service-section hashes before the document finishes loading.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const startupSectionHashes = new Set([
  'home',
  'web-design',
  'website-redesign',
  'hosting',
  'business-support'
]);

const startupHash = window.location.hash.replace(/^#/, '');
if (startupSectionHashes.has(startupHash) && history.replaceState) {
  history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search
  );
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroCard = document.querySelector('.hero-card');
const siteCta = document.querySelector('.site-cta');
const packagesWrap = document.querySelector('.packages-wrap');
let cardScrollFrame = null;

function updateCardScrollMotion() {
  cardScrollFrame = null;
  if ((!heroCard && !siteCta && !packagesWrap) || prefersReducedMotion) return;

  const shift = -Math.min(window.scrollY * 0.14, 72);
  heroCard?.style.setProperty('--cards-scroll-shift', `${shift}px`);
  siteCta?.style.setProperty('--cards-scroll-shift', `${shift}px`);
  packagesWrap?.style.setProperty('--cards-scroll-shift', `${shift}px`);
}

function requestCardScrollUpdate() {
  if (cardScrollFrame !== null) return;
  cardScrollFrame = requestAnimationFrame(updateCardScrollMotion);
}

if ((heroCard || siteCta || packagesWrap) && !prefersReducedMotion) {
  updateCardScrollMotion();
  window.addEventListener('scroll', requestCardScrollUpdate, { passive: true });
}

const hoverLiftTargets = document.querySelectorAll(`
  .phone-screen .mini-header,
  .phone-screen .photo-frame,
  .phone-screen .info-card,
  .phone-screen .metric,
  .phone-screen .blog-top,
  .phone-screen .blog-viewport,
  .phone-screen .blog-copy,
  .phone-screen .blog-dots,
  .phone-screen .blog-socials,
  .phone-screen .budget-card,
  .phone-screen .category
`);

const hoverStates = new WeakMap();

function renderHoverLift(target, amount) {
  const eased = 1 - Math.pow(1 - amount, 3);
  const lift = -4 * eased;
  const scale = 1 + 0.012 * eased;
  const shadowAlpha = 0.08 + 0.12 * eased;

  target.style.setProperty(
    'transform',
    `translate3d(0,${lift}px,0) scale(${scale})`,
    'important'
  );

  target.style.filter = `brightness(${1 + 0.018 * eased})`;
  target.style.boxShadow =
    `0 ${8 + 5 * eased}px ${16 + 9 * eased}px rgba(3,18,47,${shadowAlpha})`;

  target.style.zIndex = amount > 0.001 ? '12' : '';
}

function animateHoverTarget(target) {
  const state = hoverStates.get(target);
  if (!state || state.frame) return;

  let previousTime = performance.now();

  const frame = now => {
    const deltaMs = Math.min(now - previousTime, 64);
    previousTime = now;

    const smoothing = 1 - Math.exp(-deltaMs / 115);
    state.current += (state.target - state.current) * smoothing;

    if (Math.abs(state.target - state.current) < 0.001) {
      state.current = state.target;
    }

    renderHoverLift(target, state.current);

    if (state.current !== state.target) {
      state.frame = requestAnimationFrame(frame);
    } else {
      state.frame = null;

      if (state.current === 0) {
        target.style.removeProperty('transform');
        target.style.removeProperty('filter');
        target.style.removeProperty('box-shadow');
        target.style.removeProperty('z-index');
      }
    }
  };

  state.frame = requestAnimationFrame(frame);
}

hoverLiftTargets.forEach(target => {
  target.style.animation = 'none';

  const state = {
    current: 0,
    target: 0,
    frame: null
  };

  hoverStates.set(target, state);

  target.addEventListener('pointerenter', () => {
    if (state.target === 1) return;

    state.target = 1;
    animateHoverTarget(target);
  });

  target.addEventListener('pointerleave', () => {
    if (state.target === 0) return;

    state.target = 0;
    animateHoverTarget(target);
  });
});

const bowlImage = document.querySelector('.photo-card');
const bowlHitArea = document.querySelector('.bowl-hit-area');

let bowlRotation = -18;
let bowlSpinFrame = null;
let bowlScaleFrame = null;
let bowlCurrentScale = 1;
let bowlTargetScale = 1;

function bowlSpinProgress(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function bowlSpinScaleBoost(t) {
  return 0.42 * Math.pow(Math.sin(Math.PI * t), 1.25);
}

function renderBowl() {
  if (!bowlImage) return;

  bowlImage.style.transform =
    `rotate(${bowlRotation}deg) scale(${bowlCurrentScale})`;
}

function approachBowlScale(deltaMs) {
  const smoothing = 1 - Math.exp(-deltaMs / 240);

  bowlCurrentScale +=
    (bowlTargetScale - bowlCurrentScale) * smoothing;

  if (Math.abs(bowlTargetScale - bowlCurrentScale) < 0.001) {
    bowlCurrentScale = bowlTargetScale;
  }
}

function animateBowlScale() {
  if (!bowlImage || bowlSpinFrame || bowlScaleFrame) return;

  let previousTime = performance.now();

  function frame(now) {
    const deltaMs = Math.min(now - previousTime, 64);
    previousTime = now;

    approachBowlScale(deltaMs);
    renderBowl();

    if (bowlCurrentScale !== bowlTargetScale) {
      bowlScaleFrame = requestAnimationFrame(frame);
    } else {
      bowlScaleFrame = null;
    }
  }

  bowlScaleFrame = requestAnimationFrame(frame);
}

function setBowlScaleTarget(scale) {
  bowlTargetScale = scale;
  animateBowlScale();
}

function spinBowl() {
  if (!bowlImage || prefersReducedMotion || bowlSpinFrame) return;

  if (bowlScaleFrame) {
    cancelAnimationFrame(bowlScaleFrame);
    bowlScaleFrame = null;
  }

  const startRotation = bowlRotation;
  const fullTurns = 5 + Math.floor(Math.random() * 3);
  const landingOffset = 35 + Math.random() * 290;

  const rotationDelta =
    fullTurns * 360 + landingOffset;

  const targetRotation =
    startRotation + rotationDelta;

  const duration = 4800;
  const startTime = performance.now();

  let previousTime = startTime;

  function frame(now) {
    const progress =
      Math.min((now - startTime) / duration, 1);

    const deltaMs =
      Math.min(now - previousTime, 64);

    previousTime = now;

    bowlRotation =
      startRotation +
      rotationDelta *
      bowlSpinProgress(progress);

    const restingScaleTarget =
      bowlTargetScale;

    const spinningScaleTarget =
      restingScaleTarget +
      bowlSpinScaleBoost(progress);

    const smoothing =
      1 - Math.exp(-deltaMs / 135);

    bowlCurrentScale +=
      (spinningScaleTarget - bowlCurrentScale) *
      smoothing;

    renderBowl();

    if (progress < 1) {
      bowlSpinFrame =
        requestAnimationFrame(frame);
    } else {
      bowlRotation = targetRotation;
      bowlSpinFrame = null;
      bowlCurrentScale = bowlTargetScale;

      renderBowl();
      animateBowlScale();
    }
  }

  bowlSpinFrame =
    requestAnimationFrame(frame);
}

if (bowlImage && bowlHitArea) {
  renderBowl();

  bowlHitArea.addEventListener('mouseenter', () => {
    setBowlScaleTarget(1.38);
    spinBowl();
  });

  bowlHitArea.addEventListener('mouseleave', () => {
    setBowlScaleTarget(1);
  });

  if (!prefersReducedMotion) {
    window.setTimeout(() => {
      spinBowl();
      window.setInterval(spinBowl, 9000);
    }, 900);
  } else {
    bowlHitArea.addEventListener('mouseenter', () => {
      bowlCurrentScale = 1.38;
      bowlTargetScale = 1.38;
      renderBowl();
    });

    bowlHitArea.addEventListener('mouseleave', () => {
      bowlCurrentScale = 1;
      bowlTargetScale = 1;
      renderBowl();
    });
  }
}

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.body.classList.add('page-loaded');

    window.setTimeout(
      () => document.body.classList.add('cards-loaded'),
      prefersReducedMotion ? 0 : 260
    );

    window.setTimeout(
      () => document.body.classList.add('entrance-complete'),
      prefersReducedMotion ? 0 : 1250
    );
  });
});

const scrollRevealTargets =
  document.querySelectorAll('.anchor-section');

scrollRevealTargets.forEach(target =>
  target.classList.add('reveal-on-scroll')
);

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const revealObserver =
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    });

  scrollRevealTargets.forEach(target =>
    revealObserver.observe(target)
  );
} else {
  scrollRevealTargets.forEach(target =>
    target.classList.add('is-visible')
  );
}

const lerp = (a, b, t) =>
  a + (b - a) * t;

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

function progressColor(progress) {
  const stops = [
    { p: 0, rgb: [239, 68, 68] },
    { p: 0.33, rgb: [249, 115, 22] },
    { p: 0.66, rgb: [250, 204, 21] },
    { p: 1, rgb: [34, 197, 94] }
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const current = stops[i];
    const next = stops[i + 1];

    if (progress <= next.p) {
      const localT =
        (progress - current.p) /
        (next.p - current.p || 1);

      const rgb =
        current.rgb.map((value, index) =>
          Math.round(
            lerp(
              value,
              next.rgb[index],
              localT
            )
          )
        );

      return `rgb(${rgb.join(',')})`;
    }
  }

  return 'rgb(34,197,94)';
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function formatNumber(value, formatType) {
  if (formatType === 'comma') {
    return value.toLocaleString();
  }

  return String(value);
}

function animateNumber(element) {
  const target =
    Number(element.dataset.target || 0);

  const duration =
    Number(element.dataset.duration || 2000);

  const suffix =
    element.dataset.suffix || '';

  const formatType =
    element.dataset.format || '';

  if (prefersReducedMotion) {
    element.textContent =
      `${formatNumber(target, formatType)}${suffix}`;

    return;
  }

  const start = performance.now();

  function frame(now) {
    const progress =
      clamp((now - start) / duration, 0, 1);

    const eased =
      easeOutCubic(progress);

    const current =
      Math.round(target * eased);

    element.textContent =
      `${formatNumber(current, formatType)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function animateRing(ring) {
  const target =
    Number(ring.dataset.target || 0);

  const duration =
    Number(ring.dataset.duration || 2800);

  const label =
    ring.querySelector('span');

  const finalAngle =
    target * 3.2;

  if (prefersReducedMotion) {
    ring.style.setProperty(
      '--progress',
      target
    );

    ring.style.setProperty(
      '--ring-color',
      progressColor(target / 100)
    );

    ring.style.setProperty(
      '--ring-angle',
      `${finalAngle}deg`
    );

    return;
  }

  const start = performance.now();

  function frame(now) {
    const progress =
      clamp((now - start) / duration, 0, 1);

    const eased =
      easeOutCubic(progress);

    const value =
      target * eased;

    const angle =
      value * 3.2;

    ring.style.setProperty(
      '--progress',
      value.toFixed(2)
    );

    ring.style.setProperty(
      '--ring-color',
      progressColor(value / 100)
    );

    ring.style.setProperty(
      '--ring-angle',
      `${angle}deg`
    );

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      ring.dataset.currentProgress =
        String(target);
    }
  }

  requestAnimationFrame(frame);
}

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getBarWidthPercent(bar) {
  const track = bar.parentElement;

  if (!track) {
    return Number(
      bar.dataset.currentWidth ||
      bar.dataset.targetWidth ||
      0
    );
  }

  const trackWidth =
    track.getBoundingClientRect().width;

  const barWidth =
    bar.getBoundingClientRect().width;

  if (!trackWidth) {
    return Number(
      bar.dataset.currentWidth ||
      bar.dataset.targetWidth ||
      0
    );
  }

  return (barWidth / trackWidth) * 100;
}

function animateBar(bar) {
  const target =
    clamp(
      Number(bar.dataset.targetWidth || 10),
      10,
      100
    );

  const duration =
    Number(bar.dataset.duration || 1100);

  const color =
    bar.dataset.color || '#3b82f6';

  const startValue =
    getBarWidthPercent(bar);

  bar.style.background = color;

  if (bar._animationFrame) {
    cancelAnimationFrame(
      bar._animationFrame
    );
  }

  if (prefersReducedMotion) {
    bar.style.width =
      `${target}%`;

    bar.dataset.currentWidth =
      String(target);

    return;
  }

  const start =
    performance.now();

  function frame(now) {
    const progress =
      clamp((now - start) / duration, 0, 1);

    const eased =
      easeInOutCubic(progress);

    const value =
      lerp(startValue, target, eased);

    bar.style.width =
      `${value}%`;

    bar.dataset.currentWidth =
      value.toFixed(2);

    if (progress < 1) {
      bar._animationFrame =
        requestAnimationFrame(frame);
    } else {
      bar.style.width =
        `${target}%`;

      bar.dataset.currentWidth =
        String(target);

      bar._animationFrame = null;
    }
  }

  bar._animationFrame =
    requestAnimationFrame(frame);
}

const budgetBars = [
  ...document.querySelectorAll(
    '.bar i[data-target-width]'
  )
];

const budgetNumber =
  document.querySelector(
    '.budget-value .number-pop'
  );

const budgetRing =
  document.querySelector(
    '.ring[data-target]'
  );

const budgetRingLabel =
  budgetRing
    ? budgetRing.querySelector('span')
    : null;

const budgetLimit = 4000;

let currentBudget =
  Number(
    budgetNumber?.dataset.target ||
    2520
  );

let lastBudgetBarIndex = -1;

function animateBudgetSummary(
  nextBudget,
  duration
) {
  const startBudget =
    currentBudget;

  const targetBudget =
    Math.round(
      clamp(
        nextBudget,
        budgetLimit * 0.13,
        budgetLimit * 0.67
      )
    );

  const startPercent =
    Number(
      budgetRing?.dataset.currentProgress ||
      budgetRing?.dataset.target ||
      58
    );

  const targetPercent =
    Math.round(
      (targetBudget / budgetLimit) * 100
    );

  currentBudget =
    targetBudget;

  if (budgetNumber) {
    budgetNumber.dataset.target =
      String(targetBudget);
  }

  if (budgetRing) {
    budgetRing.dataset.target =
      String(targetPercent);
  }

  if (prefersReducedMotion) {
    if (budgetNumber) {
      budgetNumber.textContent =
        targetBudget.toLocaleString();
    }

    if (budgetRing) {
      const angle =
        targetPercent * 3.2;

      budgetRing.style.setProperty(
        '--progress',
        targetPercent
      );

      budgetRing.style.setProperty(
        '--ring-color',
        progressColor(
          targetPercent / 100
        )
      );

      budgetRing.style.setProperty(
        '--ring-angle',
        `${angle}deg`
      );

      budgetRing.dataset.currentProgress =
        String(targetPercent);

      if (budgetRingLabel) {
        budgetRingLabel.textContent =
          `${targetPercent}%`;
      }
    }

    return;
  }

  const start =
    performance.now();

  function frame(now) {
    const progress =
      clamp((now - start) / duration, 0, 1);

    const eased =
      easeInOutCubic(progress);

    const budgetValue =
      Math.round(
        lerp(
          startBudget,
          targetBudget,
          eased
        )
      );

    const percentValue =
      lerp(
        startPercent,
        targetPercent,
        eased
      );

    const angle =
      percentValue * 3.2;

    if (budgetNumber) {
      budgetNumber.textContent =
        budgetValue.toLocaleString();
    }

    if (budgetRing) {
      budgetRing.style.setProperty(
        '--progress',
        percentValue.toFixed(2)
      );

      budgetRing.style.setProperty(
        '--ring-color',
        progressColor(
          percentValue / 100
        )
      );

      budgetRing.style.setProperty(
        '--ring-angle',
        `${angle}deg`
      );

      budgetRing.dataset.currentProgress =
        percentValue.toFixed(2);

      if (budgetRingLabel) {
        budgetRingLabel.textContent =
          `${Math.round(percentValue)}%`;
      }
    }

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function animateCategoryAmount(
  category,
  nextAmount,
  duration
) {
  const label =
    category?.querySelector(
      '.category-amount'
    );

  if (!category || !label) return;

  const startAmount =
    Number(
      category.dataset.amount || 0
    );

  const targetAmount =
    Math.max(
      0,
      Math.round(nextAmount)
    );

  category.dataset.amount =
    String(targetAmount);

  if (prefersReducedMotion) {
    label.textContent =
      `$${targetAmount.toLocaleString()}`;

    return;
  }

  const start =
    performance.now();

  function frame(now) {
    const progress =
      clamp((now - start) / duration, 0, 1);

    const eased =
      easeInOutCubic(progress);

    const value =
      Math.round(
        lerp(
          startAmount,
          targetAmount,
          eased
        )
      );

    label.textContent =
      `$${value.toLocaleString()}`;

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function calculateBudgetTotal(
  overrides = new Map()
) {
  return [
    ...document.querySelectorAll(
      '.category[data-amount]'
    )
  ].reduce((sum, category) => {
    const amount =
      overrides.has(category)
        ? overrides.get(category)
        : Number(
            category.dataset.amount || 0
          );

    return sum + amount;
  }, 0);
}

function changeRandomBudgetBar() {
  if (!budgetBars.length) return;

  let barIndex =
    Math.floor(
      Math.random() *
      budgetBars.length
    );

  if (budgetBars.length > 1) {
    while (
      barIndex === lastBudgetBarIndex
    ) {
      barIndex =
        Math.floor(
          Math.random() *
          budgetBars.length
        );
    }
  }

  lastBudgetBarIndex =
    barIndex;

  const bar =
    budgetBars[barIndex];

  const category =
    bar.closest('.category');

  if (!category) return;

  const maxAmount =
    Number(
      category.dataset.max || 1000
    );

  const currentAmount =
    Number(
      category.dataset.amount || 0
    );

  const otherCategoriesTotal =
    calculateBudgetTotal() -
    currentAmount;

  const minimumBudget =
    budgetLimit * 0.13;

  const maximumBudget =
    budgetLimit * 0.67;

  const minimumAllowedAmount =
    Math.max(
      0,
      minimumBudget -
      otherCategoriesTotal
    );

  const maximumAllowedAmount =
    Math.min(
      maxAmount,
      maximumBudget -
      otherCategoriesTotal
    );

  let nextAmount =
    currentAmount;

  if (
    maximumAllowedAmount >
    minimumAllowedAmount
  ) {
    const minRounded =
      Math.ceil(
        minimumAllowedAmount / 10
      ) * 10;

    const maxRounded =
      Math.floor(
        maximumAllowedAmount / 10
      ) * 10;

    const rangeSteps =
      Math.max(
        0,
        Math.floor(
          (maxRounded - minRounded) /
          10
        )
      );

    for (
      let attempt = 0;
      attempt < 12;
      attempt++
    ) {
      const candidate =
        minRounded +
        Math.floor(
          Math.random() *
          (rangeSteps + 1)
        ) *
        10;

      if (
        Math.abs(
          candidate -
          currentAmount
        ) >=
        Math.min(
          80,
          Math.max(
            20,
            (maxRounded - minRounded) *
            0.15
          )
        )
      ) {
        nextAmount =
          candidate;

        break;
      }
    }

    if (
      nextAmount === currentAmount
    ) {
      nextAmount =
        currentAmount >
        (minRounded + maxRounded) / 2
          ? minRounded
          : maxRounded;
    }
  }

  nextAmount =
    Math.round(
      clamp(
        nextAmount,
        minimumAllowedAmount,
        maximumAllowedAmount
      ) / 10
    ) * 10;

  const accurateWidth =
    clamp(
      (nextAmount / maxAmount) * 100,
      10,
      100
    );

  const duration =
    Math.round(
      900 +
      Math.random() * 650
    );

  bar.dataset.targetWidth =
    accurateWidth.toFixed(2);

  bar.dataset.duration =
    String(duration);

  category.classList.add(
    'is-changing'
  );

  window.clearTimeout(
    category._changeTimer
  );

  category._changeTimer =
    window.setTimeout(() => {
      category.classList.remove(
        'is-changing'
      );
    }, duration + 120);

  const overrides =
    new Map([
      [category, nextAmount]
    ]);

  const nextBudgetTotal =
    calculateBudgetTotal(overrides);

  animateBar(bar);

  animateCategoryAmount(
    category,
    nextAmount,
    duration
  );

  animateBudgetSummary(
    nextBudgetTotal,
    duration
  );
}

const initialAccurateBudget =
  calculateBudgetTotal();

const initialAccuratePercent =
  Math.round(
    (initialAccurateBudget /
      budgetLimit) *
    100
  );

currentBudget =
  initialAccurateBudget;

if (budgetNumber) {
  budgetNumber.dataset.target =
    String(initialAccurateBudget);
}

if (budgetRing) {
  budgetRing.dataset.target =
    String(initialAccuratePercent);
}

if (budgetRingLabel) {
  budgetRingLabel.dataset.target =
    String(initialAccuratePercent);
}

document
  .querySelectorAll(
    '.number-pop[data-target]'
  )
  .forEach(animateNumber);

document
  .querySelectorAll(
    '.ring[data-target]'
  )
  .forEach(animateRing);

budgetBars.forEach(animateBar);

window.setInterval(
  changeRandomBudgetBar,
  4200
);

const blogTrack =
  document.getElementById(
    'blog-track'
  );

const blogViewport =
  document.querySelector(
    '.blog-viewport'
  );

const blogDots = [
  ...document.querySelectorAll(
    '.blog-dot'
  )
];

const originalBlogPosts =
  blogTrack
    ? [
        ...blogTrack.querySelectorAll(
          '.blog-post'
        )
      ]
    : [];

const blogCount =
  originalBlogPosts.length;

let activeBlog = 0;
let trackPosition = 1;
let autoplayTimer = null;
let dragStartX = 0;
let dragCurrentX = 0;
let isDraggingBlog = false;
let isTouchDrag = false;
let wheelDeltaX = 0;
let wheelResetTimer = null;
let lastWheelNavigationTime = 0;

const photoSeeds =
  Array.from(
    { length: blogCount },
    () =>
      Math.floor(
        Math.random() * 10000
      )
  );

originalBlogPosts.forEach(
  (post, index) => {
    const image =
      post.querySelector(
        '.blog-image'
      );

    if (!image) return;

    post.classList.add(
      'image-pending'
    );

    let imageSettled = false;

    const loadTimeout =
      window.setTimeout(() => {
        if (!imageSettled) {
          markError();
        }
      }, 8000);

    const markLoaded = () => {
      if (imageSettled) return;

      imageSettled = true;

      window.clearTimeout(
        loadTimeout
      );

      post.classList.remove(
        'image-error',
        'image-pending'
      );

      post.classList.add(
        'image-loaded'
      );

      image.removeAttribute(
        'aria-hidden'
      );
    };

    const markError = () => {
      if (imageSettled) return;

      imageSettled = true;

      window.clearTimeout(
        loadTimeout
      );

      post.classList.remove(
        'image-loaded',
        'image-pending'
      );

      post.classList.add(
        'image-error'
      );

      image.removeAttribute(
        'src'
      );

      image.alt = '';

      image.setAttribute(
        'aria-hidden',
        'true'
      );
    };

    image.addEventListener(
      'load',
      markLoaded,
      { once: true }
    );

    image.addEventListener(
      'error',
      markError,
      { once: true }
    );

    image.src =
      `https://picsum.photos/seed/${photoSeeds[index]}/420/300`;

    image.draggable = false;

    if (image.complete) {
      if (image.naturalWidth > 0) {
        markLoaded();
      } else {
        markError();
      }
    }
  }
);

function setupInfiniteBlogTrack() {
  if (!blogTrack || blogCount < 2) {
    return;
  }

  const firstClone =
    originalBlogPosts[0]
      .cloneNode(true);

  const lastClone =
    originalBlogPosts[
      blogCount - 1
    ].cloneNode(true);

  firstClone.setAttribute(
    'aria-hidden',
    'true'
  );

  lastClone.setAttribute(
    'aria-hidden',
    'true'
  );

  blogTrack.insertBefore(
    lastClone,
    originalBlogPosts[0]
  );

  blogTrack.appendChild(
    firstClone
  );

  const allPosts = [
    ...blogTrack.querySelectorAll(
      '.blog-post'
    )
  ];

  const total =
    allPosts.length;

  blogTrack.style.width =
    `${total * 100}%`;

  allPosts.forEach(post => {
    post.style.flex =
      `0 0 ${100 / total}%`;

    post.style.width =
      `${100 / total}%`;
  });
}

function logicalIndex(position) {
  if (position === 0) {
    return blogCount - 1;
  }

  if (position === blogCount + 1) {
    return 0;
  }

  return position - 1;
}

function trackPercent(position) {
  return (
    position *
    (100 / (blogCount + 2))
  );
}

function setTrackPosition(
  position,
  animate = true,
  pixelOffset = 0
) {
  if (!blogTrack) return;

  blogTrack.style.transition =
    animate
      ? 'transform .72s cubic-bezier(.22,.75,.2,1)'
      : 'none';

  const percent =
    trackPercent(position);

  blogTrack.style.transform =
    `translate3d(calc(-${percent}% + ${pixelOffset}px),0,0)`;
}

function updateBlogDots() {
  blogDots.forEach(
    (dot, index) =>
      dot.classList.toggle(
        'active',
        index === activeBlog
      )
  );
}

function showBlogByPosition(
  position,
  animate = true
) {
  const safePosition =
    clamp(
      position,
      0,
      blogCount + 1
    );

  trackPosition =
    safePosition;

  activeBlog =
    logicalIndex(
      trackPosition
    );

  setTrackPosition(
    trackPosition,
    animate
  );

  updateBlogDots();

  if (animate && blogTrack) {
    window.clearTimeout(
      blogTrack._unlockTimer
    );

    blogTrack._unlockTimer =
      window.setTimeout(() => {
        if (trackPosition === 0) {
          trackPosition =
            blogCount;

          activeBlog =
            blogCount - 1;

          setTrackPosition(
            trackPosition,
            false
          );
        } else if (
          trackPosition ===
          blogCount + 1
        ) {
          trackPosition = 1;
          activeBlog = 0;

          setTrackPosition(
            trackPosition,
            false
          );
        }

        updateBlogDots();
      }, 700);
  }
}

function normalizeBlogPosition() {
  if (
    !blogTrack ||
    !blogCount
  ) {
    return;
  }

  window.clearTimeout(
    blogTrack._unlockTimer
  );

  trackPosition =
    activeBlog + 1;

  setTrackPosition(
    trackPosition,
    false
  );
}

function showNextBlog(
  direction = 1
) {
  if (isDraggingBlog) return;

  normalizeBlogPosition();

  showBlogByPosition(
    trackPosition +
      (direction < 0 ? -1 : 1),
    true
  );
}

function startBlogAutoplay() {
  window.clearInterval(
    autoplayTimer
  );

  autoplayTimer =
    window.setInterval(
      () => showNextBlog(1),
      4200
    );
}

function averageTouchX(touches) {
  if (!touches.length) {
    return dragCurrentX;
  }

  let total = 0;

  for (
    let i = 0;
    i < touches.length;
    i++
  ) {
    total +=
      touches[i].clientX;
  }

  return (
    total /
    touches.length
  );
}

function beginBlogDrag(
  clientX,
  touchMode = false
) {
  if (
    !blogViewport ||
    !blogTrack
  ) {
    return;
  }

  normalizeBlogPosition();

  isDraggingBlog = true;
  isTouchDrag = touchMode;

  dragStartX = clientX;
  dragCurrentX = clientX;

  blogViewport.classList.add(
    'is-dragging'
  );

  window.clearInterval(
    autoplayTimer
  );

  blogTrack.style.transition =
    'none';
}

function moveBlogDrag(clientX) {
  if (
    !isDraggingBlog ||
    !blogViewport
  ) {
    return;
  }

  dragCurrentX = clientX;

  const offset =
    dragCurrentX -
    dragStartX;

  setTrackPosition(
    trackPosition,
    false,
    offset
  );
}

function endBlogDrag(clientX) {
  if (
    !isDraggingBlog ||
    !blogViewport
  ) {
    return;
  }

  isDraggingBlog = false;
  isTouchDrag = false;

  blogViewport.classList.remove(
    'is-dragging'
  );

  const distance =
    clientX - dragStartX;

  const threshold =
    Math.min(
      48,
      blogViewport.clientWidth *
      0.16
    );

  if (
    Math.abs(distance) >=
    threshold
  ) {
    showNextBlog(
      distance < 0 ? 1 : -1
    );
  } else {
    setTrackPosition(
      trackPosition,
      true
    );
  }

  startBlogAutoplay();
}

function resetWheelGesture() {
  wheelDeltaX = 0;
}

function handleBlogWheel(event) {
  if (
    !blogViewport ||
    !blogTrack
  ) {
    return;
  }

  const targetInsideBlog =
    event.target instanceof Element &&
    event.target.closest(
      '.blog-shell'
    );

  if (!targetInsideBlog) return;

  const modeMultiplier =
    event.deltaMode === 1
      ? 16
      : (
        event.deltaMode === 2
          ? blogViewport.clientWidth
          : 1
      );

  const deltaX =
    event.deltaX *
    modeMultiplier;

  const deltaY =
    event.deltaY *
    modeMultiplier;

  let horizontalDelta =
    deltaX;

  if (
    Math.abs(horizontalDelta) <
      0.5 &&
    event.shiftKey
  ) {
    horizontalDelta =
      deltaY;
  }

  if (
    Math.abs(horizontalDelta) <
    0.5
  ) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  window.clearInterval(
    autoplayTimer
  );

  window.clearTimeout(
    wheelResetTimer
  );

  wheelDeltaX +=
    horizontalDelta;

  const previewOffset =
    Math.max(
      -22,
      Math.min(
        22,
        -wheelDeltaX * 0.20
      )
    );

  setTrackPosition(
    trackPosition,
    false,
    previewOffset
  );

  const now =
    performance.now();

  const threshold =
    Math.max(
      24,
      Math.min(
        34,
        blogViewport.clientWidth *
        0.09
      )
    );

  if (
    Math.abs(wheelDeltaX) >=
      threshold &&
    now -
      lastWheelNavigationTime >=
      120
  ) {
    const direction =
      wheelDeltaX > 0
        ? 1
        : -1;

    lastWheelNavigationTime =
      now;

    wheelDeltaX = 0;

    showNextBlog(direction);
  }

  wheelResetTimer =
    window.setTimeout(() => {
      if (
        Math.abs(wheelDeltaX) > 0
      ) {
        setTrackPosition(
          trackPosition,
          true
        );
      }

      resetWheelGesture();
      startBlogAutoplay();
    }, 90);
}

setupInfiniteBlogTrack();

if (blogTrack) {
  blogTrack.addEventListener(
    'transitionend',
    event => {
      if (
        event.propertyName !==
        'transform'
      ) {
        return;
      }

      if (trackPosition === 0) {
        trackPosition =
          blogCount;

        activeBlog =
          blogCount - 1;

        setTrackPosition(
          trackPosition,
          false
        );
      } else if (
        trackPosition ===
        blogCount + 1
      ) {
        trackPosition = 1;
        activeBlog = 0;

        setTrackPosition(
          trackPosition,
          false
        );
      }

      window.clearTimeout(
        blogTrack._unlockTimer
      );

      updateBlogDots();
    }
  );
}

if (
  blogViewport &&
  blogTrack
) {
  blogViewport.addEventListener(
    'pointerdown',
    event => {
      if (
        event.pointerType !==
          'mouse' ||
        event.target.closest(
          'button, a'
        )
      ) {
        return;
      }

      beginBlogDrag(
        event.clientX,
        false
      );

      blogViewport.setPointerCapture(
        event.pointerId
      );
    }
  );

  blogViewport.addEventListener(
    'pointermove',
    event => {
      if (
        event.pointerType !==
          'mouse' ||
        !isDraggingBlog ||
        isTouchDrag
      ) {
        return;
      }

      moveBlogDrag(
        event.clientX
      );
    }
  );

  blogViewport.addEventListener(
    'pointerup',
    event => {
      if (
        event.pointerType ===
          'mouse' &&
        isDraggingBlog &&
        !isTouchDrag
      ) {
        endBlogDrag(
          event.clientX
        );
      }
    }
  );

  blogViewport.addEventListener(
    'pointercancel',
    () => {
      if (
        isDraggingBlog &&
        !isTouchDrag
      ) {
        endBlogDrag(
          dragCurrentX
        );
      }
    }
  );

  blogViewport.addEventListener(
    'touchstart',
    event => {
      if (
        event.target.closest(
          'button, a'
        )
      ) {
        return;
      }

      if (
        event.touches.length ===
          1 ||
        event.touches.length ===
          2
      ) {
        beginBlogDrag(
          averageTouchX(
            event.touches
          ),
          true
        );
      }
    },
    { passive: true }
  );

  blogViewport.addEventListener(
    'touchmove',
    event => {
      if (
        !isDraggingBlog ||
        !isTouchDrag
      ) {
        return;
      }

      if (
        event.touches.length ===
          1 ||
        event.touches.length ===
          2
      ) {
        moveBlogDrag(
          averageTouchX(
            event.touches
          )
        );
      }
    },
    { passive: true }
  );

  blogViewport.addEventListener(
    'touchend',
    event => {
      if (
        !isDraggingBlog ||
        !isTouchDrag
      ) {
        return;
      }

      if (
        event.touches.length ===
        0
      ) {
        endBlogDrag(
          dragCurrentX
        );
      } else if (
        event.touches.length ===
          1 ||
        event.touches.length ===
          2
      ) {
        dragStartX =
          averageTouchX(
            event.touches
          );

        dragCurrentX =
          dragStartX;
      }
    },
    { passive: true }
  );

  blogViewport.addEventListener(
    'touchcancel',
    () => {
      if (
        isDraggingBlog &&
        isTouchDrag
      ) {
        endBlogDrag(
          dragCurrentX
        );
      }
    },
    { passive: true }
  );

  document.addEventListener(
    'wheel',
    handleBlogWheel,
    {
      passive: false,
      capture: true
    }
  );
}

showBlogByPosition(
  1,
  false
);

startBlogAutoplay();

if (blogTrack) {
  blogTrack.addEventListener(
    'click',
    event => {
      const button =
        event.target.closest(
          '.like-btn'
        );

      if (
        !button ||
        !blogTrack.contains(
          button
        )
      ) {
        return;
      }

      const post =
        button.closest(
          '.blog-post'
        );

      const postTitle =
        post
          ?.querySelector('h3')
          ?.textContent
          ?.trim();

      const willLike =
        !button.classList.contains(
          'liked'
        );

      const matchingButtons =
        postTitle
          ? [
              ...blogTrack.querySelectorAll(
                '.blog-post'
              )
            ]
              .filter(candidate =>
                candidate
                  .querySelector('h3')
                  ?.textContent
                  ?.trim() ===
                postTitle
              )
              .map(candidate =>
                candidate.querySelector(
                  '.like-btn'
                )
              )
              .filter(Boolean)
          : [button];

      matchingButtons.forEach(
        likeButton => {
          likeButton.classList.toggle(
            'liked',
            willLike
          );

          likeButton.setAttribute(
            'aria-pressed',
            String(willLike)
          );

          likeButton.setAttribute(
            'aria-label',
            willLike
              ? 'Unlike post'
              : 'Like post'
          );
        }
      );
    }
  );
}


(() => {
  const hero =
    document.querySelector(
      '.hero'
    );

  if (!hero) return;

  const artwork =
    new Image();

  const updateHeroArtworkHeight =
    () => {
      if (
        !artwork.naturalWidth ||
        !artwork.naturalHeight
      ) {
        return;
      }

      const displayedHeight =
        window.innerWidth *
        artwork.naturalHeight /
        artwork.naturalWidth;

      hero.style.setProperty(
        '--hero-art-height',
        `${Math.ceil(
          displayedHeight
        )}px`
      );
    };

  artwork.addEventListener(
    'load',
    updateHeroArtworkHeight
  );

  artwork.src =
    'images/background.jpg';

  window.addEventListener(
    'resize',
    updateHeroArtworkHeight,
    { passive: true }
  );
})();

(() => {
  const emailRecipient =
    'kiara@steadyhandsop.com';

  const phoneRecipient =
    '+17023726399';

  const colorFamilies = {
    Red: [
      '#7F1D1D',
      '#991B1B',
      '#B91C1C',
      '#DC2626',
      '#EF4444',
      '#F87171',
      '#FCA5A5'
    ],

    Orange: [
      '#7C2D12',
      '#9A3412',
      '#C2410C',
      '#EA580C',
      '#F97316',
      '#FB923C',
      '#FDBA74'
    ],

    Yellow: [
      '#713F12',
      '#854D0E',
      '#A16207',
      '#CA8A04',
      '#EAB308',
      '#FACC15',
      '#FDE047'
    ],

    Green: [
      '#14532D',
      '#166534',
      '#15803D',
      '#16A34A',
      '#22C55E',
      '#4ADE80',
      '#86EFAC'
    ],

    Blue: [
      '#172554',
      '#1E3A8A',
      '#1D4ED8',
      '#2563EB',
      '#3B82F6',
      '#60A5FA',
      '#93C5FD'
    ],

    Purple: [
      '#3B0764',
      '#581C87',
      '#6B21A8',
      '#7E22CE',
      '#9333EA',
      '#A855F7',
      '#C084FC'
    ],

    Pink: [
      '#831843',
      '#9D174D',
      '#BE185D',
      '#DB2777',
      '#EC4899',
      '#F472B6',
      '#F9A8D4'
    ],

    Brown: [
      '#3F2D20',
      '#5A3A25',
      '#6F4E37',
      '#8B5E3C',
      '#A47148',
      '#C08A5B',
      '#D6B08C'
    ],

    Black: [
      '#000000',
      '#111111',
      '#1F2937',
      '#27272A',
      '#374151',
      '#4B5563',
      '#6B7280'
    ],

    White: [
      '#FFFFFF',
      '#FAFAFA',
      '#F8FAFC',
      '#F5F5F4',
      '#F3F4F6',
      '#E5E7EB',
      '#D1D5DB'
    ]
  };

  const familyPreview = {
    Red: '#DC2626',
    Orange: '#F97316',
    Yellow: '#EAB308',
    Green: '#16A34A',
    Blue: '#2563EB',
    Purple: '#9333EA',
    Pink: '#EC4899',
    Brown: '#8B5E3C',
    Black: '#111111',
    White: '#FFFFFF'
  };

  const shadeName =
    (family, index) =>
      `${family} ${
        [
          '900',
          '800',
          '700',
          '600',
          '500',
          '400',
          '300'
        ][index]
      }`;

  function initializeColorPickers(
    form
  ) {
    form
      .querySelectorAll(
        '[data-color-role]'
      )
      .forEach(role => {
        const familyWrap =
          role.querySelector(
            '.color-families'
          );

        const shadesWrap =
          role.querySelector(
            '.color-shades'
          );

        const shadeSection =
          role.querySelector(
            '.color-shade-wrap'
          );

        const hidden =
          role.querySelector(
            'input[type="hidden"]'
          );

        const dot =
          role.querySelector(
            '.color-selection-dot'
          );

        const name =
          role.querySelector(
            '.color-selection-name'
          );

        const clear =
          role.querySelector(
            '.color-clear'
          );

        Object.entries(
          familyPreview
        ).forEach(
          ([family, color]) => {
            const b =
              document.createElement(
                'button'
              );

            b.type = 'button';

            b.className =
              `color-circle${
                family === 'White' ||
                family === 'Yellow'
                  ? ' light-swatch'
                  : ''
              }`;

            b.style.setProperty(
              '--circle-color',
              color
            );

            b.setAttribute(
              'aria-label',
              family
            );

            b.dataset.family =
              family;

            familyWrap.appendChild(
              b
            );
          }
        );

        familyWrap.addEventListener(
          'click',
          e => {
            const b =
              e.target.closest(
                '.color-circle'
              );

            if (!b) return;

            const family =
              b.dataset.family;

            familyWrap
              .querySelectorAll(
                '.color-circle'
              )
              .forEach(x =>
                x.classList.toggle(
                  'is-selected',
                  x === b
                )
              );

            shadesWrap.innerHTML = '';

            colorFamilies[
              family
            ].forEach(
              (color, index) => {
                const sb =
                  document.createElement(
                    'button'
                  );

                sb.type = 'button';

                sb.className =
                  `color-circle${
                    family ===
                      'White' ||
                    (
                      family ===
                        'Yellow' &&
                      index > 3
                    )
                      ? ' light-swatch'
                      : ''
                  }`;

                sb.style.setProperty(
                  '--circle-color',
                  color
                );

                sb.setAttribute(
                  'aria-label',
                  `${shadeName(
                    family,
                    index
                  )} ${color}`
                );

                sb.addEventListener(
                  'click',
                  () => {
                    shadesWrap
                      .querySelectorAll(
                        '.color-circle'
                      )
                      .forEach(x =>
                        x.classList.remove(
                          'is-selected'
                        )
                      );

                    sb.classList.add(
                      'is-selected'
                    );

                    hidden.value =
                      `${shadeName(
                        family,
                        index
                      )} (${color})`;

                    dot.style.background =
                      color;

                    name.textContent =
                      `${shadeName(
                        family,
                        index
                      )} · ${color}`;

                    clear?.removeAttribute(
                      'hidden'
                    );
                  }
                );

                shadesWrap.appendChild(
                  sb
                );
              }
            );

            shadeSection.hidden =
              false;
          }
        );

        clear?.addEventListener(
          'click',
          () => {
            hidden.value = '';

            dot.style.background = '';

            name.textContent =
              'Not selected';

            familyWrap
              .querySelectorAll(
                '.color-circle'
              )
              .forEach(x =>
                x.classList.remove(
                  'is-selected'
                )
              );

            shadesWrap.innerHTML = '';

            shadeSection.hidden =
              true;

            clear.hidden = true;
          }
        );
      });
  }

  function initializeModal(
    modal,
    openButton
  ) {
    const dialog =
      modal.querySelector(
        '.intake-dialog'
      );

    const close =
      modal.querySelector(
        '.intake-close'
      );

    const form =
      modal.querySelector(
        'form'
      );

    const status =
      modal.querySelector(
        '.intake-status'
      );

    let lastFocused = null;

    const focusable = () =>
      [
        ...dialog.querySelectorAll(
          'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[href]'
        )
      ].filter(
        el => !el.closest('[hidden]')
      );

    const open = () => {
      lastFocused =
        document.activeElement;

      modal.classList.add(
        'is-open'
      );

      modal.setAttribute(
        'aria-hidden',
        'false'
      );

      document.body.classList.add(
        'modal-open'
      );

      modal.scrollTop = 0;
      dialog.scrollTop = 0;

      setTimeout(
        () =>
          form
            .querySelector(
              'input:not([type="hidden"])'
            )
            ?.focus(),
        0
      );
    };

    const shut = () => {
      modal.classList.remove(
        'is-open'
      );

      modal.setAttribute(
        'aria-hidden',
        'true'
      );

      document.body.classList.remove(
        'modal-open'
      );

      lastFocused?.focus?.();
    };

    openButton?.addEventListener(
      'click',
      open
    );

    close.addEventListener(
      'click',
      shut
    );

    modal.addEventListener(
      'mousedown',
      e => {
        if (e.target === modal) {
          shut();
        }
      }
    );

    document.addEventListener(
      'keydown',
      e => {
        if (
          !modal.classList.contains(
            'is-open'
          )
        ) {
          return;
        }

        if (e.key === 'Escape') {
          shut();
        }

        if (e.key === 'Tab') {
          const items =
            focusable();

          if (!items.length) return;

          const first =
            items[0];

          const last =
            items.at(-1);

          if (
            e.shiftKey &&
            document.activeElement ===
              first
          ) {
            e.preventDefault();
            last.focus();
          } else if (
            !e.shiftKey &&
            document.activeElement ===
              last
          ) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    );

    form
      .querySelector(
        '.other-page-toggle'
      )
      ?.addEventListener(
        'change',
        e => {
          const wrap =
            form.querySelector(
              '.other-page-wrap'
            );

          const input =
            form.querySelector(
              '.other-pages'
            );

          wrap.classList.toggle(
            'is-visible',
            e.target.checked
          );

          input.required =
            e.target.checked;

          if (
            !e.target.checked
          ) {
            input.value = '';
          }
        }
      );

    form
      .querySelectorAll(
        'input[name="websiteType"]'
      )
      .forEach(r =>
        r.addEventListener(
          'change',
          () => {
            const other =
              form.querySelector(
                'input[name="websiteType"]:checked'
              )?.value ===
              'Other';

            const wrap =
              form.querySelector(
                '.other-type-wrap'
              );

            const input =
              form.querySelector(
                '.other-website-type'
              );

            if (wrap) {
              wrap.classList.toggle(
                'is-visible',
                other
              );
            }

            if (input) {
              input.required =
                other;

              if (!other) {
                input.value = '';
              }
            }
          }
        )
      );

    const updateContactMethod =
      () => {
        const method =
          form.querySelector(
            'input[name="contactMethod"]:checked'
          ).value;

        form
          .querySelectorAll(
            '.contact-panel'
          )
          .forEach(panel => {
            const active =
              panel.dataset
                .contactPanel ===
              method;

            panel.hidden =
              !active;

            panel
              .querySelectorAll(
                'input'
              )
              .forEach(
                input =>
                  input.required =
                    active
              );
          });

        const submit =
          form.querySelector(
            '.intake-submit'
          );

        if (submit) {
          submit.textContent =
            method === 'Phone'
              ? 'Open Text Draft'
              : 'Open Email Draft';
        }
      };

    form
      .querySelectorAll(
        'input[name="contactMethod"]'
      )
      .forEach(r =>
        r.addEventListener(
          'change',
          updateContactMethod
        )
      );

    updateContactMethod();

    initializeColorPickers(form);

    form.addEventListener(
      'submit',
      e => {
        e.preventDefault();
        if (!form.reportValidity()) {
          return;
        }
const fd =
          new FormData(form);

        const data =
          Object.fromEntries(
            fd.entries()
          );

        const project =
          modal.dataset.projectType;

        const contact =
          data.contactMethod ===
          'Phone'
            ? data.phone
            : data.email;

        const labels = {
          name: 'Name',
          businessName:
            'Business / project name',
          websiteType:
            'Website type',
          otherWebsiteType:
            'Other website type',
          businessType:
            'Industry / specialty',
          currentDomain:
            'Current domain',
          monthlySpend:
            'Monthly website spend',
          budget:
            'Estimated budget',
          mainGoal:
            'Main goal',
          timeline:
            'Preferred timeline',
          currentProblems:
            'Current problems',
          projectDetails:
            'Project details',
          primaryColor:
            'Primary color',
          secondaryColor:
            'Secondary color',
          accentColor:
            'Accent color',
          otherPages:
            'Other pages'
        };

        const lines = [
          'Hello Steady Hands Operation,',
          '',
          `I am interested in: ${project}`,
          ''
        ];

        Object.entries(
          labels
        ).forEach(
          ([key, label]) => {
            if (data[key]) {
              lines.push(
                `${label}: ${
                  key ===
                  'monthlySpend'
                    ? '$'
                    : ''
                }${data[key]}`
              );
            }
          }
        );

        lines.push(
          `Preferred contact method: ${data.contactMethod}`,
          `${data.contactMethod}: ${contact}`,
          '',
          'Please contact me about the next steps.',
          '',
          'Thank you,',
          ` ${data.name}`
        );

        const subject =
          `${project} Request — ${
            data.businessName ||
            data.currentDomain ||
            data.name
          }`;

        const draftBody =
          lines.join('\n');

        if (
          data.contactMethod ===
          'Phone'
        ) {
          status.textContent =
            'Opening a text message to (702) 372-6399 with the draft ready…';

          window.location.href =
            `sms:${phoneRecipient}?body=${encodeURIComponent(
              `${subject}\n\n${draftBody}`
            )}`;
        } else {
          status.textContent =
            'Opening your email app with the draft addressed to Kiara…';

          window.location.href =
            `mailto:${emailRecipient}?subject=${encodeURIComponent(
              subject
            )}&body=${encodeURIComponent(
              draftBody
            )}`;
        }
      }
    );
  }

  initializeModal(
    document.getElementById(
      'site-audit-modal'
    ),
    document.getElementById(
      'open-site-audit'
    )
  );

  initializeModal(
    document.getElementById(
      'new-site-modal'
    ),
    document.getElementById(
      'open-new-site'
    )
  );

  function initializeContactModal() {
    const modal =
      document.getElementById(
        'contact-modal'
      );

    const openButton =
      document.getElementById(
        'open-contact'
      );

    if (
      !modal ||
      !openButton
    ) {
      return;
    }

    const dialog =
      modal.querySelector(
        '.intake-dialog'
      );

    const close =
      modal.querySelector(
        '.intake-close'
      );

    const form =
      modal.querySelector(
        '#contact-form'
      );

    const status =
      form.querySelector(
        '.intake-status'
      );

    const methodInputs = [
      ...form.querySelectorAll(
        'input[name="contactMethod"]'
      )
    ];

    const panels = [
      ...form.querySelectorAll(
        '[data-contact-panel]'
      )
    ];

    const emailInput =
      form.querySelector(
        '.contact-email'
      );

    const phoneInput =
      form.querySelector(
        '.contact-phone'
      );

    const shortcuts = [
      ...modal.querySelectorAll(
        '.contact-method-shortcut'
      )
    ];

    let lastFocused = null;

    const focusable = () =>
      [
        ...dialog.querySelectorAll(
          'button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[href]'
        )
      ].filter(
        el =>
          !el.closest('[hidden]')
      );

    const formatPhone =
      value => {
        const digits =
          String(value || '')
            .replace(/\D/g, '')
            .slice(0, 10);

        if (!digits) return '';

        if (digits.length < 4) {
          return `(${digits}`;
        }

        if (digits.length < 7) {
          return `(${digits.slice(
            0,
            3
          )}) ${digits.slice(3)}`;
        }

        return `(${digits.slice(
          0,
          3
        )}) ${digits.slice(
          3,
          6
        )}-${digits.slice(6)}`;
      };

    const setContactMethod =
      (
        method,
        { focus = false } = {}
      ) => {
        methodInputs.forEach(
          input => {
            input.checked =
              input.value ===
              method;
          }
        );

        panels.forEach(panel => {
          const active =
            panel.dataset
              .contactPanel ===
            method;

          panel.hidden =
            !active;

          const input =
            panel.querySelector(
              'input'
            );

          if (input) {
            input.required =
              active;

            input.disabled =
              !active;
          }
        });

        shortcuts.forEach(
          shortcut => {
            shortcut.classList.toggle(
              'is-recommended',
              shortcut.dataset
                .contactMethod ===
                method
            );
          }
        );

        if (focus) {
          const activeInput =
            form.querySelector(
              `[data-contact-panel="${method}"] input`
            );

          activeInput?.focus();
        }
      };

    methodInputs.forEach(
      input => {
        input.addEventListener(
          'change',
          () => {
            if (input.checked) {
              setContactMethod(
                input.value,
                { focus: true }
              );
            }
          }
        );
      }
    );

    shortcuts.forEach(
      shortcut => {
        shortcut.addEventListener(
          'pointerdown',
          () => {
            setContactMethod(
              shortcut.dataset
                .contactMethod
            );
          }
        );

        shortcut.addEventListener(
          'focus',
          () => {
            setContactMethod(
              shortcut.dataset
                .contactMethod
            );
          }
        );
      }
    );

    phoneInput?.addEventListener(
      'beforeinput',
      e => {
        if (
          e.inputType ===
            'insertText' &&
          e.data &&
          /\D/.test(e.data)
        ) {
          e.preventDefault();
        }
      }
    );

    phoneInput?.addEventListener(
      'keydown',
      e => {
        if (
          e.key.length === 1 &&
          !/\d/.test(e.key) &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.altKey
        ) {
          e.preventDefault();
        }
      }
    );

    phoneInput?.addEventListener(
      'input',
      () => {
        const formatted =
          formatPhone(
            phoneInput.value
          );

        if (
          phoneInput.value !==
          formatted
        ) {
          phoneInput.value =
            formatted;
        }
      }
    );

    phoneInput?.addEventListener(
      'paste',
      e => {
        e.preventDefault();

        const pasted =
          (
            e.clipboardData ||
            window.clipboardData
          ).getData('text');

        phoneInput.value =
          formatPhone(pasted);

        phoneInput.dispatchEvent(
          new Event('input', {
            bubbles: true
          })
        );
      }
    );

    const open = () => {
      lastFocused =
        document.activeElement;

      modal.classList.add(
        'is-open'
      );

      modal.setAttribute(
        'aria-hidden',
        'false'
      );

      document.body.classList.add(
        'modal-open'
      );

      if (
        location.hash !==
        '#consultation'
      ) {
        history.replaceState(
          null,
          '',
          '#consultation'
        );
      }

      const selected =
        form.querySelector(
          'input[name="contactMethod"]:checked'
        )?.value ||
        'Email';

      setContactMethod(
        selected
      );

      setTimeout(
        () =>
          form
            .querySelector(
              'input[name="name"]'
            )
            ?.focus(),
        0
      );
    };

    const shut =
      (clearHash = true) => {
        modal.classList.remove(
          'is-open'
        );

        modal.setAttribute(
          'aria-hidden',
          'true'
        );

        document.body.classList.remove(
          'modal-open'
        );

        if (
          clearHash &&
          location.hash ===
            '#consultation'
        ) {
          history.replaceState(
            null,
            '',
            location.pathname +
              location.search +
              '#home'
          );
        }

        lastFocused?.focus?.();
      };

    openButton.addEventListener(
      'click',
      open
    );

    close.addEventListener(
      'click',
      () => shut(true)
    );

    modal.addEventListener(
      'mousedown',
      e => {
        if (e.target === modal) {
          shut(true);
        }
      }
    );

    document.addEventListener(
      'keydown',
      e => {
        if (
          !modal.classList.contains(
            'is-open'
          )
        ) {
          return;
        }

        if (
          e.key === 'Escape'
        ) {
          shut(true);
          return;
        }

        if (e.key === 'Tab') {
          const items =
            focusable();

          if (!items.length) {
            return;
          }

          const first =
            items[0];

          const last =
            items.at(-1);

          if (
            e.shiftKey &&
            document.activeElement ===
              first
          ) {
            e.preventDefault();
            last.focus();
          } else if (
            !e.shiftKey &&
            document.activeElement ===
              last
          ) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    );

    form.addEventListener(
      'submit',
      e => {
        e.preventDefault();

        if (
          !form.reportValidity()
        ) {
          return;
        }

        const data =
          Object.fromEntries(
            new FormData(
              form
            ).entries()
          );

        const method =
          data.contactMethod ||
          'Email';

        const lines = [
          'Hello Steady Hands Operation,',
          '',
          'I would like to get in touch.',
          '',
          `Name: ${data.name}`,

          data.businessName
            ? `Business / organization: ${data.businessName}`
            : null,

          `Preferred contact method: ${method}`,

          method === 'Email'
            ? `Email: ${data.email}`
            : `Phone: ${data.phone}`,

          '',
          'Message:',
          data.message,
          '',
          'Thank you,',
          data.name
        ].filter(Boolean);

        const subject =
          `Contact Request — ${
            data.businessName ||
            data.name
          }`;

        status.textContent =
          'Opening your email app with the message ready…';

        window.location.href =
          `mailto:${emailRecipient}?subject=${encodeURIComponent(
            subject
          )}&body=${encodeURIComponent(
            lines.join('\n')
          )}`;
      }
    );

    const syncHash = () => {
      if (
        location.hash ===
          '#consultation' &&
        !modal.classList.contains(
          'is-open'
        )
      ) {
        open();
      }
    };

    window.addEventListener(
      'hashchange',
      syncHash
    );

    setContactMethod(
      'Email'
    );

    syncHash();
  }

  initializeContactModal();
})();

(() => {
  const paymentPage =
    document.getElementById(
      'paymentreceived'
    );

  const checkButton =
    document.getElementById(
      'payment-check-button'
    );

  if (
    !paymentPage ||
    !checkButton
  ) {
    return;
  }

  const restartAnimation =
    () => {
      const card =
        paymentPage.querySelector(
          '.payment-confirmation-card'
        );

      const path =
        paymentPage.querySelector(
          '.payment-check-path'
        );

      [
        card,
        checkButton,
        path
      ].forEach(el => {
        el.style.animation =
          'none';

        void el.offsetWidth;

        el.style.animation =
          '';
      });
    };

  const syncPaymentRoute =
    () => {
      const isOpen =
        window.location.hash
          .toLowerCase() ===
        '#paymentreceived';

      paymentPage.classList.toggle(
        'is-open',
        isOpen
      );

      paymentPage.setAttribute(
        'aria-hidden',
        String(!isOpen)
      );

      document.body.classList.toggle(
        'modal-open',
        isOpen
      );

      if (isOpen) {
        restartAnimation();

        window.setTimeout(
          () =>
            checkButton.focus({
              preventScroll: true
            }),
          120
        );
      }
    };

  checkButton.addEventListener(
    'click',
    restartAnimation
  );

  window.addEventListener(
    'hashchange',
    syncPaymentRoute
  );

  syncPaymentRoute();
})();

document
  .querySelectorAll(
    '.project-intake-form .contact-phone'
  )
  .forEach(input => {
    input.setAttribute(
      'inputmode',
      'numeric'
    );

    input.setAttribute(
      'maxlength',
      '14'
    );

    input.setAttribute(
      'pattern',
      '\\(\\d{3}\\) \\d{3}-\\d{4}'
    );

    const format =
      value => {
        const d =
          String(value || '')
            .replace(/\D/g, '')
            .slice(0, 10);

        if (!d) return '';

        if (d.length < 4) {
          return `(${d}`;
        }

        if (d.length < 7) {
          return `(${d.slice(
            0,
            3
          )}) ${d.slice(3)}`;
        }

        return `(${d.slice(
          0,
          3
        )}) ${d.slice(
          3,
          6
        )}-${d.slice(6)}`;
      };

    input.addEventListener(
      'beforeinput',
      e => {
        if (
          e.inputType ===
            'insertText' &&
          e.data &&
          /\D/.test(e.data)
        ) {
          e.preventDefault();
        }
      }
    );

    input.addEventListener(
      'keydown',
      e => {
        if (
          e.key.length === 1 &&
          !/\d/.test(e.key) &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.altKey
        ) {
          e.preventDefault();
        }
      }
    );

    input.addEventListener(
      'input',
      () => {
        input.value =
          format(input.value);
      }
    );

    input.addEventListener(
      'paste',
      e => {
        e.preventDefault();

        input.value =
          format(
            (
              e.clipboardData ||
              window.clipboardData
            ).getData('text')
          );

        input.dispatchEvent(
          new Event(
            'input',
            { bubbles: true }
          )
        );
      }
    );
  });

// Header section navigation
(() => {
  // Prevent the browser from restoring its own old scroll position.
  // All section positioning is handled by the custom navigation below.
  

  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-btn');
  const menu = document.getElementById('primary-navigation');
  const desktopNavLinks = [...document.querySelectorAll('.nav-links a[data-nav-target]')];
  const navigationLinks = [...document.querySelectorAll('a[data-nav-target]')];
  const sectionIds = ['home', 'web-design', 'website-redesign', 'hosting', 'business-support'];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const sectionAdjustments = {
    'web-design': 10,
    'website-redesign': -150,
    'hosting': 64,
    'business-support': 0
  };

  const closeMobileMenu = () => {
    if (!menu || !menuButton) return;
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
  };

  const openMobileMenu = () => {
    if (!menu || !menuButton) return;
    menu.classList.add('open');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Close navigation menu');
  };

  if (menuButton && menu) {
    menuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const shouldOpen = !menu.classList.contains('open');
      shouldOpen ? openMobileMenu() : closeMobileMenu();
    });

    document.addEventListener('click', (event) => {
      if (!menu.classList.contains('open')) return;
      if (menu.contains(event.target) || menuButton.contains(event.target)) return;
      closeMobileMenu();
    });
  }

  const setActive = (id) => {
    desktopNavLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.navTarget === id);
    });
  };

  const getSectionLandingTarget = (id) => {
    const section = document.getElementById(id);
    if (!section) return null;

    const preferredTargets = {
      'web-design': '.packages-wrap',
      'website-redesign': '.renewal-wrap',
      'hosting': '.packages-wrap',
      'business-support': '.executive-wrap'
    };

    const selector = preferredTargets[id];
    return selector ? section.querySelector(selector) || section : section;
  };

  const getNavigationGap = () => {
    if (window.innerWidth <= 620) return 10;
    if (window.innerWidth <= 900) return 12;
    return 14;
  };

  const scrollToSection = (id, behavior = 'smooth') => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior });
      return;
    }

    const target = getSectionLandingTarget(id);
    if (!target) return;

    // Measure everything at click time so each section uses the actual
    // space available beneath the current desktop/mobile header.
    const currentHeaderHeight = header ? header.offsetHeight : 0;
    const gap = getNavigationGap();
    const targetRect = target.getBoundingClientRect();
    const availableHeight = Math.max(0, window.innerHeight - currentHeaderHeight - gap * 2);
    const targetDocumentTop = targetRect.top + window.scrollY;

    // If the complete section content fits in the visible area, center it.
    // Otherwise align its content cleanly near the top so the most useful
    // portion is visible immediately without hiding the heading.
    let calculatedPosition = targetRect.height <= availableHeight
      ? targetDocumentTop - currentHeaderHeight - gap + (availableHeight - targetRect.height) / 2
      : targetDocumentTop - currentHeaderHeight - gap;

    // ==========================================================
    // MANUAL SECTION SCROLL ADJUSTMENTS
    // Positive = farther DOWN the page.
    // Negative = stops HIGHER on the page.
    // These values are used for navigation clicks AND refresh restoration.
    // ==========================================================
    const adjustment = sectionAdjustments[id] || 0;
    calculatedPosition += adjustment;

    window.scrollTo({
      top: Math.max(0, calculatedPosition),
      behavior
    });
  };

  // ==========================================================
  // REFRESH: RESTORE TO THE NEAREST SERVICE SECTION
  // Saves whichever section below is closest to the center of
  // the viewport, then restores directly to that section on reload.
  // No native browser scroll restoration is used.
  // ==========================================================
  const refreshSectionIds = Object.keys(sectionAdjustments);
  const refreshSectionStorageKey = 'steadyHandsNearestSection';

  const getNearestRefreshSection = () => {
    const viewportCenter = window.scrollY + (window.innerHeight / 2);

    let nearestId = null;
    let nearestDistance = Infinity;

    refreshSectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionCenter =
        window.scrollY + rect.top + (rect.height / 2);

      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = id;
      }
    });

    return nearestId;
  };

  const saveNearestRefreshSection = () => {
    const nearestId = getNearestRefreshSection();
    if (!nearestId) return;

    try {
      sessionStorage.setItem(
        refreshSectionStorageKey,
        nearestId
      );
    } catch (_) {}
  };

  // Desktop may remember its nearest service section.
  // Mobile ALWAYS reloads at Home instead.
  const isMobileNavigation = window.matchMedia('(max-width: 780px)').matches;

  if (!isMobileNavigation) {
    window.addEventListener('pagehide', saveNearestRefreshSection);
    window.addEventListener('beforeunload', saveNearestRefreshSection);
  } else {
    try {
      sessionStorage.removeItem(refreshSectionStorageKey);
    } catch (_) {}
  }

  // Restore a saved section on DESKTOP only.
  const navigationEntry =
    performance.getEntriesByType?.('navigation')?.[0];

  const isReload =
    navigationEntry?.type === 'reload' ||
    performance.navigation?.type === 1;

  if (isReload && !isMobileNavigation) {
    let savedSectionId = null;

    try {
      savedSectionId =
        sessionStorage.getItem(refreshSectionStorageKey);
    } catch (_) {}

    if (
      savedSectionId &&
      refreshSectionIds.includes(savedSectionId) &&
      document.getElementById(savedSectionId)
    ) {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          scrollToSection(savedSectionId, 'auto');
          setActive(savedSectionId);
        });
      });
    }
  }

  if (isReload && isMobileNavigation) {
    try {
      sessionStorage.removeItem(refreshSectionStorageKey);
    } catch (_) {}

    history.replaceState(null, '', '#home');
    setActive('home');

    // Run after the rest of the navigation setup so no older restore
    // behavior can pull the viewport back down to a service section.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        setActive('home');
      });
    });
  }

  navigationLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.dataset.navTarget;
      if (!id || !document.getElementById(id)) return;

      event.preventDefault();
      closeMobileMenu();
      setActive(id);
      scrollToSection(id);
    });
  });

  const updateActiveFromScroll = () => {
    if (!sections.length) return;

    const headerHeight = header ? header.offsetHeight : 0;
    const probe = window.scrollY + headerHeight + 40;

    if (window.scrollY <= 8) {
      setActive('home');
      return;
    }

    let active = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= probe) {
        active = section.id;
      }
    });

    const nearBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;

    if (nearBottom) {
      active = sections[sections.length - 1].id;
    }

    setActive(active);
  };

  let ticking = false;
  const requestActiveUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateActiveFromScroll();
      ticking = false;
    });
  };

  window.addEventListener('scroll', requestActiveUpdate, { passive: true });
  window.addEventListener('resize', () => {
    closeMobileMenu();
    requestActiveUpdate();
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });

  const mobileContactButton = document.querySelector('.mobile-contact-trigger');
  const contactButton = document.getElementById('open-contact');
  if (mobileContactButton && contactButton) {
    mobileContactButton.addEventListener('click', () => {
      closeMobileMenu();
      contactButton.click();
    });
  }

  const businessSupportButton = document.querySelector('.executive-contact-btn');
  if (businessSupportButton && contactButton) {
    businessSupportButton.addEventListener('click', () => contactButton.click());
  }

  const redesignButton = document.getElementById('open-renewal-audit');
  const auditButton = document.getElementById('open-site-audit');
  if (redesignButton && auditButton) {
    redesignButton.addEventListener('click', () => auditButton.click());
  }
updateActiveFromScroll();
})();


/* Reusable website + hosting checkout intake */
(() => {
  const modal = document.getElementById('purchase-intake-modal');
  const form = document.getElementById('purchase-intake-form');
  if (!modal || !form) return;

  const dialog = modal.querySelector('.purchase-intake-dialog');
  const closeBtn = modal.querySelector('.purchase-intake-close');
  const formView = modal.querySelector('[data-intake-view="form"]');
  const reviewView = modal.querySelector('[data-intake-view="review"]');
  const reviewList = document.getElementById('purchase-review-list');
  const reviewBack = document.getElementById('purchase-review-back');
  const checkoutBtn = document.getElementById('purchase-checkout-button');
  const error = document.getElementById('purchase-intake-error');
  const selectedService = document.getElementById('purchase-selected-service');
  const selectedPrice = document.getElementById('purchase-selected-price');
  const eyebrow = document.getElementById('purchase-intake-eyebrow');
  let state = null;
  let lastTrigger = null;

  const escapeHtml = (value='') => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  const setView = (view) => {
    const reviewing = view === 'review';
    formView.hidden = reviewing;
    reviewView.hidden = !reviewing;
    modal.scrollTop = 0;
    dialog.scrollTop = 0;
  };

  const syncContact = () => {
    const method = form.elements.preferredContact.value;
    modal.querySelectorAll('[data-purchase-contact]').forEach(panel => {
      panel.hidden = panel.dataset.purchaseContact !== method;
    });
    form.elements.customerEmail.required = method === 'Email';
    form.elements.customerPhone.required = method === 'Phone';
  };

  const formatPhone = (input) => {
    const digits = input.value.replace(/\D/g, '').slice(0,10);
    if (digits.length <= 3) input.value = digits;
    else if (digits.length <= 6) input.value = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    else input.value = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  };

  window.openIntake = (config) => {
    state = { ...config };
    form.reset();
    error.textContent = '';
    setView('form');
    const isWebsite = state.type === 'website';
    modal.querySelectorAll('.hosting-only').forEach(el => { el.hidden = isWebsite; });
    selectedService.textContent = state.serviceName || '';
    selectedPrice.textContent = state.billingLabel || state.price || '';
    eyebrow.textContent = isWebsite ? 'Website Quick Start' : 'Hosting Quick Start';
    form.elements.preferredContact.value = 'Email';
    syncContact();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('purchase-intake-open');
    modal.scrollTop = 0;
    dialog.scrollTop = 0;
    requestAnimationFrame(() => form.elements.customerName.focus({preventScroll:true}));
  };

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('purchase-intake-open');
    state = null;
    if (lastTrigger) lastTrigger.focus({preventScroll:true});
  };

  document.querySelectorAll('.start-intake').forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      lastTrigger = btn;
      window.openIntake({
        type: btn.dataset.service,
        package: btn.dataset.package,
        serviceName: btn.dataset.serviceName,
        billing: btn.dataset.billing || '',
        billingLabel: btn.dataset.billingLabel || '',
        price: btn.dataset.price || '',
        checkoutUrl: btn.dataset.checkoutUrl
      });
    });
  });

  form.addEventListener('change', event => {
    if (event.target.name === 'preferredContact') syncContact();
  });
  form.elements.customerPhone.addEventListener('input', event => formatPhone(event.target));

  const buildReview = () => {
    const fd = new FormData(form);
    const rows = [];
    const add = (label, value) => { if (value && String(value).trim()) rows.push([label, value]); };
    add(state.type === 'hosting' ? 'Plan' : 'Service', state.serviceName);
    if (state.type === 'hosting') add('Billing', state.billingLabel || state.price);
    add('Name', fd.get('customerName'));
    add('Business', fd.get('businessName'));
    if (state.type === 'hosting') add('Website', fd.get('hostingWebsiteUrl'));
    add('Contact', `${fd.get('preferredContact')}: ${fd.get('preferredContact') === 'Phone' ? fd.get('customerPhone') : fd.get('customerEmail')}`);
    add('Note', fd.get('anythingElse'));
    reviewList.innerHTML = rows.map(([label,value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    error.textContent = '';
    syncContact();
    if (!form.reportValidity()) return;
    buildReview();
    setView('review');
  });

  reviewBack?.addEventListener('click', () => setView('form'));
  checkoutBtn?.addEventListener('click', () => {
    if (state?.checkoutUrl) window.location.href = state.checkoutUrl;
  });
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', event => { if (event.target === modal) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();
