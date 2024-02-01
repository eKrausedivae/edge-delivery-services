async function createSidebar(sidebarHref) {
  const { pathname } = new URL(sidebarHref);
  const resp = await fetch(pathname);
  const json = await resp.json();

  const sidebar = document.createElement('ul');
  const links = await Promise.all(json.data);

  links.forEach((link) => {
    if (link) {
      const li = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.innerHTML = link.name;
      anchor.href = link.path;

      li.append(anchor);
      sidebar.append(li);
    }
  });

  return sidebar;
}

export default async function decorate(block) {
  document.querySelector('main').classList.add('main-with-sidebar');
  const sidebarLink = block.textContent.trim();
  if (!sidebarLink) return;

  const sidebar = await createSidebar(sidebarLink);
  block.replaceChildren(sidebar);
}
