const isGithubPages = window.location.hostname.endsWith('github.io');

if (isGithubPages) {
  const basePath = '/Lingu/';

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = `${basePath}assets/app.css`;
  document.head.appendChild(style);

  const script = document.createElement('script');
  script.type = 'module';
  script.src = `${basePath}assets/app.js`;
  document.body.appendChild(script);
} else {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = '/src/main.tsx';
  document.body.appendChild(script);
}
