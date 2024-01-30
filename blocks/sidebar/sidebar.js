async function createSidebar(sidebarHref) {
  const { pathname } = new URL(sidebarHref);
  const resp = await fetch(pathname);
  const json = await resp.json();

  const sidebar = document.createElement('ul');
  await Promise.all(json.data.map((link) => {
    if (link) {
      const li = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.innerHTML = link.name;
      anchor.href = link.path;
      li.append(anchor);
      sidebar.append(li);
    }
  }));

  return sidebar;
}

export default async function decorate(block) {
  const sidebarLink = block.textContent.trim();
  if (!sidebarLink) return;

  const sidebar = await createSidebar(sidebarLink);
  block.replaceChildren(sidebar);
}