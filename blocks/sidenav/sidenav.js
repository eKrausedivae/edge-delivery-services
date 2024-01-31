import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
// const isDesktop = window.matchMedia('(min-width: 900px)');

// function closeOnEscape(e) {
//   if (e.code === 'Escape') {
//     const sidenav = document.getElementById('sidenav');
//     const sidenavSections = sidenav.querySelector('.sidenav-sections');
//     const sidenavSectionExpanded = sidenavSections.querySelector('[aria-expanded="true"]');
//     if (sidenavSectionExpanded && isDesktop.matches) {
//       // eslint-disable-next-line no-use-before-define
//       toggleAllSideNavSections(sidenavSections);
//       sidenavSectionExpanded.focus();
//     } else if (!isDesktop.matches) {
//       // eslint-disable-next-line no-use-before-define
//       toggleMenu(sidenav, sidenavSections);
//       sidenav.querySelector('button').focus();
//     }
//   }
// }

// function openOnKeydown(e) {
//   const focused = document.activeElement;
//   const isSideNavDrop = focused.className === 'sidenav-drop';
//   if (isSideNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
//     const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
//     // eslint-disable-next-line no-use-before-define
//     toggleAllSideNavSections(focused.closest('.sidenav-sections'));
//     focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
//   }
// }

// function focusSideNavSection() {
//   document.activeElement.addEventListener('keydown', openOnKeydown);
// }

// /**
//  * Toggles all sidenav sections
//  * @param {Element} sections The container element
//  * @param {Boolean} expanded Whether the element should be expanded or collapsed
//  */
// function toggleAllSideNavSections(sections, expanded = false) {
// eslint-disable-next-line max-len
//   sections.querySelectorAll('.sidenav-sections .default-content-wrapper > ul > li').forEach((section) => {
//     section.setAttribute('aria-expanded', expanded);
//   });
// }

// /**
//  * Toggles the entire sidenav
//  * @param {Element} sidenav The container element
//  * @param {Element} sidenavSections The sidenav sections within the container element
//  * @param {*} forceExpanded Optional param to force sidenav expand behavior when not null
//  */
// function toggleMenu(sidenav, sidenavSections, forceExpanded = null) {
// eslint-disable-next-line max-len
//   const expanded = forceExpanded !== null ? !forceExpanded : sidenav.getAttribute('aria-expanded') === 'true';
//   const button = sidenav.querySelector('.sidenav-hamburger button');
//   document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
//   sidenav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
//   toggleAllSideNavSections(sidenavSections, expanded || isDesktop.matches ? 'false' : 'true');
//   button.setAttribute('aria-label', expanded ? 'Open sidenavigation' : 'Close sidenavigation');
//   // enable sidenav dropdown keyboard accessibility
//   const sidenavDrops = sidenavSections.querySelectorAll('.sidenav-drop');
//   if (isDesktop.matches) {
//     sidenavDrops.forEach((drop) => {
//       if (!drop.hasAttribute('tabindex')) {
//         drop.setAttribute('role', 'button');
//         drop.setAttribute('tabindex', 0);
//         drop.addEventListener('focus', focusSideNavSection);
//       }
//     });
//   } else {
//     sidenavDrops.forEach((drop) => {
//       drop.removeAttribute('role');
//       drop.removeAttribute('tabindex');
//       drop.removeEventListener('focus', focusSideNavSection);
//     });
//   }
//   // enable menu collapse on escape keypress
//   if (!expanded || isDesktop.matches) {
//     // collapse menu on escape press
//     window.addEventListener('keydown', closeOnEscape);
//   } else {
//     window.removeEventListener('keydown', closeOnEscape);
//   }
// }

/**
 * decorates the sidenav
 * @param {Element} block The sidenav block element
 */
export default async function decorate(block) {
  // load sidenav as fragment
  const sidenavMeta = getMetadata('sidenav');
  const sidenavPath = sidenavMeta ? new URL(sidenavMeta).pathname : '/sidenav';
  const fragment = await loadFragment(sidenavPath);

  // decorate sidenav DOM
  const sidenav = document.createElement('nav');
  sidenav.id = 'sidenav';
  while (fragment.firstElementChild) sidenav.append(fragment.firstElementChild);

  const section = sidenav.firstElementChild;
  if (section) section.classList.add('sidenav-sections');

  const sidenavSections = sidenav.querySelector('.sidenav-sections');
  if (sidenavSections) {
    sidenavSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((sidenavSection) => {
      if (sidenavSection.querySelector('ul')) sidenavSection.classList.add('sidenav-drop');
      // sidenavSection.addEventListener('click', () => {
      //   if (isDesktop.matches) {
      //     const expanded = sidenavSection.getAttribute('aria-expanded') === 'true';
      //     toggleAllSideNavSections(sidenavSections);
      //     sidenavSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      //   }
      // });
    });
  }

  // // hamburger for mobile
  // const hamburger = document.createElement('div');
  // hamburger.classList.add('sidenav-hamburger');
  // eslint-disable-next-line max-len
  // hamburger.innerHTML = `<button type="button" aria-controls="sidenav" aria-label="Open sidenavigation">
  //     <span class="sidenav-hamburger-icon"></span>
  //   </button>`;
  // hamburger.addEventListener('click', () => toggleMenu(sidenav, sidenavSections));
  // sidenav.prepend(hamburger);
  // sidenav.setAttribute('aria-expanded', 'false');
  // // prevent mobile sidenav behavior on window resize
  // toggleMenu(sidenav, sidenavSections, isDesktop.matches);
  // eslint-disable-next-line max-len
  // isDesktop.addEventListener('change', () => toggleMenu(sidenav, sidenavSections, isDesktop.matches));

  const sidenavWrapper = document.createElement('div');
  sidenavWrapper.className = 'sidenav-wrapper';
  sidenavWrapper.append(sidenav);
  block.append(sidenavWrapper);
}
