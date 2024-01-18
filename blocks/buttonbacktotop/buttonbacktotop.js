export default function decorate(block) {
  const button = document.createElement('button');
  button.role = 'button';
  button.className = 'buttonbacktotop-button';
  const icon = document.createElement('i');
  icon.className = 'buttonbacktotop-icon';
  button.append(icon);
  block.append(button);

  block.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });
}