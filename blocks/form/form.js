import createField from './form-fields.js';
import { sampleRUM } from '../../scripts/aem.js';

function checkValidity(currentTab) {
  const inputs = currentTab.querySelectorAll('input, select, textarea');
  let valid = true;

  inputs.forEach((input) => {
    if (input.checkValidity() === false) {
      input.reportValidity();
      valid = false;
    }
  });

  return valid;
}

function createMultistepNavigation(form) {
  const container = document.createElement('div');
  container.className = 'form-tab-nav';

  const previousButton = document.createElement('button');
  previousButton.role = 'button';
  previousButton.type = 'button';
  previousButton.className = 'form-previous-btn';
  previousButton.innerText = 'Previous';
  previousButton.disabled = true;
  container.append(previousButton);

  const nextButton = document.createElement('button');
  nextButton.role = 'button';
  nextButton.type = 'button';
  nextButton.className = 'form-next-btn';
  nextButton.innerText = 'Next';
  container.append(nextButton);

  form.append(container);

  const allTabs = form.querySelectorAll('.form-tab');
  previousButton.addEventListener('click', () => {
    const currentTab = document.querySelector('.form-tab.active');
    let currentTabIndex = Array.from(allTabs).indexOf(currentTab);

    if (currentTabIndex === 0) {
      return;
    }

    if (currentTabIndex === 1) {
      previousButton.disabled = true;
    }

    nextButton.disabled = false;
    currentTab.classList.remove('active');
    currentTabIndex -= 1;
    const previousTab = allTabs[currentTabIndex];
    previousTab.classList.add('active');
  });

  nextButton.addEventListener('click', () => {
    const currentTab = document.querySelector('.form-tab.active');
    let currentTabIndex = Array.from(allTabs).indexOf(currentTab);

    if (currentTabIndex === allTabs.length - 1) {
      return;
    }

    if (checkValidity(currentTab) === false) return;

    if (currentTabIndex === allTabs.length - 2) {
      nextButton.disabled = true;
    }

    previousButton.disabled = false;
    currentTab.classList.remove('active');
    currentTabIndex += 1;
    const nextTab = allTabs[currentTabIndex];
    nextTab.classList.add('active');
  });
}

async function createForm(formHref) {
  const { pathname } = new URL(formHref);
  const resp = await fetch(pathname);
  const json = await resp.json();

  const form = document.createElement('form');
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];

  const isMultistepForm = json.data.some((item) => (item.Tab !== undefined && item.Tab !== ''));
  const fields = await Promise.all(json.data.map((fd) => createField(fd, form)));
  let currentTabIndex = 0;
  let tab = document.createElement('div');
  tab.classList.add('form-tab', 'active');
  fields.forEach((field, index) => {
    if (isMultistepForm) {
      const fieldTabIndex = json.data[index].Tab;
      if (fieldTabIndex > currentTabIndex || index === fields.length - 1) {
        form.append(tab);
        currentTabIndex = fieldTabIndex;
        tab = document.createElement('div');
        tab.classList.add('form-tab');
      }
      tab.append(field);
    } else if (field) {
      form.append(field);
    }
  });

  // group fields into fieldsets
  const fieldsets = form.querySelectorAll('fieldset');
  fieldsets.forEach((fieldset) => {
    form.querySelectorAll(`[data-fieldset="${fieldset.name}"`).forEach((field) => {
      fieldset.append(field);
    });
  });

  // add tab nav if necessary
  if (isMultistepForm) {
    createMultistepNavigation(form);
  }

  return form;
}

function generatePayload(form) {
  const payload = {};

  [...form.elements].forEach((field) => {
    if (field.name && field.type !== 'submit' && !field.disabled) {
      if (field.type === 'radio') {
        if (field.checked) payload[field.name] = field.value;
      } else if (field.type === 'checkbox') {
        if (field.checked) payload[field.name] = payload[field.name] ? `${payload[field.name]},${field.value}` : field.value;
      } else {
        payload[field.name] = field.value;
      }
    }
  });
  return payload;
}

function handleSubmitError(form, error) {
  // eslint-disable-next-line no-console
  console.error(error);
  form.querySelector('button[type="submit"]').disabled = false;
  sampleRUM('form:error', { source: '.form', target: error.stack || error.message || 'unknown error' });
}

async function handleSubmit(form) {
  if (form.getAttribute('data-submitting') === 'true') return;

  const submit = form.querySelector('button[type="submit"]');
  try {
    form.setAttribute('data-submitting', 'true');
    submit.disabled = true;

    // create payload
    const payload = generatePayload(form);
    const response = await fetch(form.dataset.action, {
      method: 'POST',
      body: JSON.stringify({ data: payload }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      sampleRUM('form:submit', { source: '.form', target: form.dataset.action });
      if (form.dataset.confirmation) {
        window.location.href = form.dataset.confirmation;
      }
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (e) {
    handleSubmitError(form, e);
  } finally {
    form.setAttribute('data-submitting', 'false');
  }
}

export default async function decorate(block) {
  const formLink = block.querySelector('a[href$=".json"]');
  if (!formLink) return;

  const form = await createForm(formLink.href);
  block.replaceChildren(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = form.checkValidity();
    if (valid) {
      handleSubmit(form);
    } else {
      const firstInvalidEl = form.querySelector(':invalid:not(fieldset)');
      if (firstInvalidEl) {
        firstInvalidEl.focus();
        firstInvalidEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}
