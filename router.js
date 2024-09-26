class Router extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.routes = {};
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block; 
        }
      </style>
      <div id="content"></div> 
    `;

    window.addEventListener('popstate', () => this.handleRouteChange());
    
  }

  addRoute(path, page) {
    this.routes[path] = page;
  }

  async handleRouteChange() {
    const path = window.location.pathname;
    const page = this.routes[path] || this.routes['*'];

    if (page) {
      try {
        const response = await fetch(page); 
        const content = await response.text();
        this.shadowRoot.getElementById('content').innerHTML = content;
      } catch (error) {
        console.error(`Error loading page: ${error}`);
        this.shadowRoot.getElementById('content').innerHTML = '<p>Error loading page</p>';
      }
    } else {
      console.error(`No route found for ${path}`);
      this.shadowRoot.getElementById('content').innerHTML = '<p>Page not found</p>';
    }
  }
}

customElements.define('site-router', Router);

const router = document.querySelector('site-router');
router.addRoute('/', 'home.html');
router.addRoute('/about', 'about.html');
router.addRoute('*', '404.html');

router.handleRouteChange(); // Call handleRouteChange after adding routes
