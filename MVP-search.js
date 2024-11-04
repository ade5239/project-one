/**
 * Copyright 2024 ade5239
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
//still need to import the icons

export class MVPsearch extends LitElement {
  static get properties() {
    return {
      items: { type: Array }, 
      value: { type: String },
      siteMetadata: { type: Object },
      baseUrl: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .overview {
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        color: #fff;
        background-color: var(--overview-bg-color, #333);
      }

      input {
        font-size: 20px;
        width: 80%;
        padding: 8px;
        margin-bottom: 10px;
      }

      button {
        font-size: 20px;
        padding: 8px 24px;
        cursor: pointer;
      }

      .results {
        display: grid;
        grid-template-columns: repeat(4, 1fr); //ensures a max of 4 cards go across the screen
        gap: 16px;
      }

      @media screen and (max-width: 1200px) {
        .results {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media screen and (max-width: 900px) {
        .results {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media screen and (max-width: 600px) {
        .results {
          grid-template-columns: 1fr;
        }
      }

      .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 16px;
        box-sizing: border-box;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background-color: #fff;
        text-decoration: none;
        color: inherit;
      }

      .card img {
        width: 100%;
        height: auto;
        border-radius: 4px;
      }

      .card h3 {
        font-size: 1.2rem;
        margin: 10px 0;
      }

      .card p {
        font-size: 0.9rem;
        color: #666;
      }

      .card a {
        text-decoration: none;
        color: inherit;
      }

      .card-links a {
        font-size: 0.9rem;
        color: #0066cc;
        text-decoration: none;
      }

      .card-links a:hover {
        text-decoration: underline;
      }
    `;
  }

  constructor() { //initialize properties
    super();
    this.value = '';
    this.items = [];
    this.siteMetadata = null;
    this.baseUrl = '';
  }

  render() {
    return html`
      <div>
        <h1>Hax Site Analyzer</h1>
        <input
          id="input"
          placeholder="Enter Site Location"
          @keyup="${this.handleKeyUp}"
        />
        <button @click="${this.search}">Analyze</button>
      </div>

      <div class="overview" style="background-color: ${this.siteMetadata?.hexCode || '#333'};">
        ${this.siteMetadata
          ? html`
              <h2>${this.siteMetadata.siteName}</h2>
              <p>${this.siteMetadata.description}</p>
              ${this.siteMetadata.logo
                ? html`<img src="${this.siteMetadata.logo}" alt="Site Logo" width="80" />`
                : ''}
              <p>Theme: ${this.siteMetadata.theme}</p>
              <p>Created: ${this.siteMetadata.created}</p>
              <p>Last Updated: ${this.siteMetadata.lastUpdated}</p>
            `
          : html`<p>Enter a URL to analyze the site.</p>`
        }
      </div>

      ${this.items.length > 0
        ? html`<p>Total Pages: ${this.items.length}</p>`
        : ''}

      <div class="results">
        ${this.items.map((item) => this.renderCard(item))}
      </div>
    `;
  }

  renderCard(item) { //renders a card for each item
    const { title, description, metadata, slug } = item;
    const imagePath = //checks for any images available to use for the card
      (metadata?.images && metadata.images[0]) ||
      metadata?.image ||
      this.siteMetadata?.logo ||
      'https://via.placeholder.com/150';
    const imageUrl = this.resolveUrl(imagePath);
    const lastUpdated = metadata?.updated
      ? new Date(metadata.updated * 1000).toLocaleDateString() //should convert the timestamp to actual date
      : 'Unknown';
    const pageUrl = this.resolveUrl(slug);
    const sourceUrl = `${pageUrl}/index.html`;
  
    // Additional meaningful information
    const readTime = metadata?.readtime ? `${metadata.readtime} min read` : ''; //read time
    const numImages = metadata?.images ? metadata.images.length : 0; //number of images on the site
  
    return html` 
      <div class="card">

        <a href="${pageUrl}" target="_blank" rel="noopener noreferrer">
          <img src="${imageUrl}" alt="${title || 'Image'}" />
          <h3>${title}</h3>
        </a>

        <p>${description}</p>
        <p>Last updated: ${lastUpdated}</p>
        ${readTime ? html`<p>${readTime}</p>` : ''}
        ${numImages > 0 ? html`<p>Contains ${numImages} images</p>` : ''}
        ${numVideos > 0 ? html`<p>Contains ${numVideos} videos</p>` : ''}

        <div class="card-links">
          <a href="${pageUrl}" target="_blank" rel="noopener noreferrer">Open Content</a>
          <br />
          <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Open Source</a>
        </div>
      </div>
    `;
  }
   

  handleKeyUp(e) { //when the enter key is pressed in the input field it searches the input
    if (e.key === 'Enter') { 
      this.search();
    }
  }

  search() { //ensures input validation and url standardization for provided url
    const inputValue = this.shadowRoot.querySelector('#input').value.trim();
    if (!inputValue) { //input validation
      alert('Please enter a valid URL!');
      return;
    }
    let url = inputValue;
    if (!url.endsWith('/')) { //checks if site.json exists in the provided url
      url += '/';
    }
    if (!url.endsWith('site.json')) { //if the provided url does not have site.json, it adds site.json to the end of it
      url += 'site.json';
    }
    const parsedUrl = new URL(url); //parses the url
    this.baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}/`; //takes the parsed url and sets a new base url
    this.updateResults(url);
  }

  async updateResults(url) { // fetch and process data from the specified url
    this.loading = true;
    try { //tries to fetch the url's site.json
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch site.json'); //error handling if no site.json was found
      const data = await response.json();

      if (data.metadata && data.items) { //checks the site.json for specific data
        const metadata = data.metadata;
        const siteData = metadata.site || {};
        const themeData = metadata.theme || {};

        // extracts the theme name
        const themeName = themeData.name || 'Default';

        // extracts created and updated dates
        const createdDate = siteData.created
          ? new Date(siteData.created * 1000).toLocaleDateString()
          : 'Unknown';
        const updatedDate = siteData.updated
          ? new Date(siteData.updated * 1000).toLocaleDateString()
          : 'Unknown';

        // extracts hexCode from theme variables
        const hexCode = themeData.variables?.hexCode || '#333';

        this.siteMetadata = { //sets the metadata for the Overview section under the url
          siteName: siteData.name || 'Unknown Site',
          description: data.description || 'No description available.',
          logo: siteData.logo ? this.resolveUrl(siteData.logo) : null,
          theme: themeName,
          created: createdDate,
          lastUpdated: updatedDate,
          hexCode: hexCode,
        };
        this.items = data.items; //set items to display as cards
      } else {
        throw new Error('Invalid site.json schema.');
      }
    } catch (error) {
      this.items = [];
      alert('Error: ' + error.message);
    } finally {
      this.loading = false;
    }
  }

  resolveUrl(path) { //helps resolve relative URLs
    if (!path) return '';
    return path.startsWith('http')
      ? path
      : `${this.baseUrl}${path.startsWith('/') ? path.slice(1) : path}`;
  }
}

globalThis.customElements.define('mvp-search', MVPsearch);
