const projects = [
  {
    title: 'Bark & Style',
    category: 'UI Design',
    description: 'Team capstone: reservation system for a pet grooming and boarding business, with owner dashboard, reports, and staff screens.',
    images: [
      ['images/B&S_DASHBOARD.png', 'Bark and Style owner dashboard'],
      ['images/B&S_STAFF.png', 'Bark and Style staff interface']
    ]
  },
  {
    title: 'Samsung',
    category: 'UI Design',
    description: 'Mobile version of Samsung’s shopping website with added features, made for a class activity.',
    images: [
      ['images/SAMSUNG1.png', 'Samsung shopping home screen'],
      ['images/SAMSUNG2.png', 'Samsung product details interface']
    ]
  },
  {
    title: 'Banking App Concept',
    category: 'UI Design',
    description: 'Mobile banking app screens: dashboard, reports, and money transfer.',
    images: [
      ['images/BNKNG_DASHBOARD.png', 'Banking dashboard interface'],
      ['images/BNKNG_REPORTS.png', 'Banking report details interface'],
      ['images/BNKNG_SEND.png', 'Money transfer interface']
    ]
  },
  {
    title: 'QuickTally',
    category: 'UI Design',
    description: 'Inventory dashboard and sales reporting screens.',
    images: [
      ['images/QUICKTALLY_UI1.png', 'QuickTally inventory dashboard'],
      ['images/QUICKTALLY_UI2.png', 'QuickTally sales and reports interface']
    ]
  },
  {
    title: 'TechHaven',
    category: 'UI Design',
    description: 'Electronics storefront homepage.',
    images: [['images/ONLINE_ELECTRONIC.png', 'TechHaven electronics store homepage']]
  },
  {
    title: 'KAPOS',
    category: 'Posters',
    description: 'Film cover design made for a class activity.',
    images: [['images/KAPOS.png', 'KAPOS film cover design']]
  },
  {
    title: 'QuickTally Poster',
    category: 'Posters',
    description: 'Promotional poster for the QuickTally inventory concept.',
    images: [['images/QT_POSTER.png', 'QuickTally promotional poster']]
  },
  {
    title: 'Exam Week',
    category: 'Posters',
    description: 'Exam Week announcement poster for ALPHA.',
    images: [['images/EXAMPUB.png', 'Exam Week announcement poster']]
  },
  {
    title: 'Welcome to 2026',
    category: 'Posters',
    description: 'New Year greeting poster for ALPHA.',
    images: [['images/NYPUB.png', 'Welcome to 2026 New Year poster']]
  },
  {
    title: 'How Devices Communicate in a Network',
    category: 'Infographics',
    description: 'Infographic explaining DHCP, ARP, and NAT.',
    images: [['images/INFOGRAPHICS.png', 'Infographic explaining DHCP, ARP, and NAT']]
  },
  {
    title: 'ID Design',
    category: 'Print',
    description: 'ID card designs for ALPHA event organizers.',
    images: [
      ['images/ID1.png', 'Purple event organizer ID design'],
      ['images/ID2.png', 'Teal event organizer ID design']
    ]
  },
  {
    title: 'Invitation Design',
    category: 'Print',
    description: 'Wedding invitation design, including front layout and entourage details.',
    images: [
      ['images/WEDDING_INVITATION1.png', 'Wedding invitation front design'],
      ['images/WEDDING_INVITATION2.png', 'Wedding invitation entourage details design']
    ]
  },
  {
    title: 'Sublimation Design',
    category: 'Print',
    description: 'Sublimation shirt design for ALPHA, shown as front and back mockups.',
    images: [
      ['images/SUBLIMATION_SHIRT1.png', 'Sublimation shirt front mockup'],
      ['images/SUBLIMATION_SHIRT2.png', 'Sublimation shirt back mockup']
    ]
  }
];

const grid = document.querySelector('#project-grid');
const count = document.querySelector('#work-count');
const filters = [...document.querySelectorAll('.filter-button')];
const dialog = document.querySelector('#project-dialog');
const dialogImages = document.querySelector('#dialog-images');
let activeFilter = 'All work';
let currentProject = 0;
let dialogOpener = null;

function makeCard(project, index) {
  const card = document.createElement('article');
  card.className = 'project';

  const cover = document.createElement('button');
  cover.type = 'button';
  cover.className = `project-cover cover-${project.category.toLowerCase().replace(/\s+/g, '-')}`;
  cover.setAttribute('aria-label', `View ${project.title} artwork — ${project.category}`);

  const top = document.createElement('span');
  top.className = 'cover-top';
  top.innerHTML = '<span>PROJECT INDEX</span>';
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  top.append(number);

  const title = document.createElement('span');
  title.className = 'cover-title';
  if (project.title.length > 30) title.classList.add('cover-title-long');
  title.textContent = project.title;

  const bottom = document.createElement('span');
  bottom.className = 'cover-bottom';
  const category = document.createElement('span');
  category.textContent = project.category;
  const arrow = document.createElement('span');
  arrow.className = 'project-open';
  arrow.setAttribute('aria-hidden', 'true');
  bottom.append(category, arrow);

  cover.append(top, title, bottom);
  cover.addEventListener('click', () => openProject(index, cover));

  const caption = document.createElement('div');
  caption.className = 'project-caption';
  const heading = document.createElement('h3');
  const headingButton = document.createElement('button');
  headingButton.type = 'button';
  headingButton.textContent = project.title;
  headingButton.addEventListener('click', () => openProject(index, headingButton));
  heading.append(headingButton);
  const captionCategory = document.createElement('span');
  captionCategory.textContent = project.category;
  caption.append(heading, captionCategory);

  const description = document.createElement('p');
  description.className = 'project-description';
  description.textContent = project.description;
  card.append(cover, caption, description);
  return card;
}

function renderProjects() {
  const visible = projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => activeFilter === 'All work' || project.category === activeFilter);
  grid.replaceChildren(...visible.map(({ project, index }) => makeCard(project, index)));
  count.textContent = `${visible.length} ${visible.length === 1 ? 'project' : 'projects'}`;
}

function showProject(index) {
  currentProject = (index + projects.length) % projects.length;
  const project = projects[currentProject];
  document.querySelector('#dialog-category').textContent = `${project.category} / ${String(currentProject + 1).padStart(2, '0')}`;
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-description').textContent = project.description;
  document.querySelector('#dialog-position').textContent = `${currentProject + 1} / ${projects.length}`;
  dialogImages.replaceChildren(...project.images.map(([file, alt], imageIndex) => {
    const figure = document.createElement('figure');
    const link = document.createElement('a');
    link.href = file;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', `Open full-size image: ${alt}`);
    const image = document.createElement('img');
    image.src = file;
    image.alt = alt;
    image.loading = 'lazy';
    link.append(image);
    const caption = document.createElement('figcaption');
    caption.innerHTML = `<span>${String(imageIndex + 1).padStart(2, '0')}</span>`;
    caption.append(document.createTextNode(alt));
    figure.append(link, caption);
    return figure;
  }));
  dialogImages.dataset.count = String(project.images.length);
  dialog.scrollTop = 0;
}

function openProject(index, opener) {
  dialogOpener = opener;
  showProject(index);
  dialog.showModal();
  document.body.classList.add('dialog-open');
}

filters.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
    renderProjects();
  });
});

document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.querySelector('#previous-project').addEventListener('click', () => showProject(currentProject - 1));
document.querySelector('#next-project').addEventListener('click', () => showProject(currentProject + 1));
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (dialogOpener?.isConnected) dialogOpener.focus();
});

const menuButton = document.querySelector('.mobile-menu');
const siteNav = document.querySelector('.site-nav');
function setMenuOpen(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  siteNav.classList.toggle('is-open', open);
}
menuButton.addEventListener('click', () => setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true'));
siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenuOpen(false);
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 640) setMenuOpen(false);
});

document.querySelector('#year').textContent = new Date().getFullYear();
renderProjects();
