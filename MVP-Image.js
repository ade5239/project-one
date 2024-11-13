/**
 * MVP-Image.js
 * Handles displaying the site overview and item cards.
 */

import { LitElement, html, css } from "lit";
//import '@lrnwebcomponents/simple-icon/simple-icon.js';
//import '@lrnwebcomponents/simple-icon/lib/simple-icons.js';
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";

export class MVPImage extends LitElement {
  static get properties() {
    return {
      url: { type: String },
      items: { type: Array },
      siteMetadata: { type: Object },
      baseUrl: { type: String },
      loading: { type: Boolean, reflect: true },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      :host([loading]) .overview {
        opacity: 0.1;
      }

      /* Centering the overview content */
      .overview {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--ddd-spacing-4);
        border-radius: var(--ddd-radius-xl);
        margin-bottom: var(--ddd-spacing-4);
        color: var(--ddd-theme-default-slateMaxLight);
        background-color: var(--ddd-theme-default-limestoneGray);
        text-align: center;
      }

      /* Adjusted the results layout using Flexbox */
      .results {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        margin: 0 auto;
      }

      /* Style for the cards */
      .card {
        flex: 0 1 calc(25% - 40px); /* 4 cards per row */
        margin: 20px;
        border: var(--ddd-border-sm);
        border-radius: var(--ddd-radius-md);
        padding: var(--ddd-spacing-4);
        box-sizing: border-box;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background-color: var(--ddd-theme-default-slateMaxLight);
        text-decoration: none;
        color: var(--ddd-theme-default-coalyGray);
        text-align: center;
      }

      @media screen and (max-width: 1200px) {
        .card {
          flex: 0 1 calc(33.333% - 40px); /* 3 cards per row */
        }
      }

      @media screen and (max-width: 900px) {
        .card {
          flex: 0 1 calc(50% - 40px); /* 2 cards per row */
        }
      }

      @media screen and (max-width: 600px) {
        .card {
          flex: 0 1 calc(100% - 40px); /* 1 card per row */
        }
      }

      .card:hover {
        transition: 0.2s ease, box-shadow 0.2s ease;
        background-color: var(--ddd-theme-default-accent);
      }

      .card img {
        width: 100%;
        height: auto;
        border-radius: var(--ddd-radius-md);
        cursor: pointer;
      }

      .card h3 {
        font-size: 1.2rem;
        margin: var(--ddd-spacing-3);
        display: inline-block;
      }

      .card p {
        font-size: 0.9rem;
        color: var(--ddd-theme-default-coalyGray);
      }

      .card a {
        text-decoration: none;
        color: inherit;
      }

      /* Styling the card links to be side by side */
      .card-links {
        display: flex;
        justify-content: center;
        gap: var(--ddd-spacing-2);
        margin-top: var(--ddd-spacing-2);
      }

      .card-links a {
        font-size: var(--ddd-font-weight-small);
        text-decoration: none;
        padding: var(--ddd-spacing-2);
        border-radius: var(--ddd-radius-md);
        color: var(--ddd-theme-default-slateMaxLight);
        background-color: var(--ddd-theme-default-limestoneGray);
        border: 1px solid transparent;
      }

      .card-links a:hover {
        transition: 0.2s ease, box-shadow 0.2s ease;
        border: 2px solid var(--ddd-theme-default-accent);
      }
    `;
  }

  constructor() {
    super();
    this.url = '';
    this.items = [];
    this.siteMetadata = null;
    this.baseUrl = '';
    this.loading = false;
  }

  updated(changedProperties) {
    if (changedProperties.has('url') && this.url) {
      const parsedUrl = new URL(this.url);
      this.baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`; // Removed trailing slash
      this.updateResults(this.url);
    }
  }

  render() {
    return html`
      <div class="overview">
        ${this.siteMetadata
          ? html`
              <!-- Moved the image to the top of the overview box -->
              ${this.siteMetadata.logo
                ? html`<img src="${this.siteMetadata.logo}" alt="Site Logo" width="80" />`
                : ''}

              <h2>
                ${this.siteMetadata.icon
                  ? html`
                      <simple-icon
                        icon="${this.siteMetadata.icon}"
                        style="--simple-icon-width: 24px; --simple-icon-height: 24px;"
                      ></simple-icon>
                    `
                  : ''}
                Name: ${this.siteMetadata.siteName}
              </h2>
              <p>Description: ${this.siteMetadata.description}</p>
              <p>Theme: ${this.siteMetadata.theme}</p>
              <p>Created: ${this.siteMetadata.created}</p>
              <p>Last Updated: ${this.siteMetadata.lastUpdated}</p>
              <p>HexCode: ${this.siteMetadata.hexCode}</p>
            `
          : html`<p>Enter a URL to analyze the site.</p>`}
      </div>

      ${this.items.length > 0
        ? html`<p style="text-align: center;">Total Pages: ${this.items.length}</p>`
        : ''}

      <div class="results">
        ${this.items.map((item) => this.renderCard(item))}
      </div>
    `;
  }

  renderCard(item) {
    // Renders a card for each item
    const { title, description, metadata, slug } = item;
    const imagePath =
      (metadata?.images && metadata.images[0]) ||
      metadata?.image ||
      this.siteMetadata?.logo ||
      'https://via.placeholder.com/150';
    const imageUrl = this.resolveUrl(imagePath);
    const pageUrl = this.resolveUrl(slug);
    const lastUpdated = metadata?.updated
      ? new Date(metadata.updated * 1000).toLocaleDateString() // Converts timestamp to date
      : 'Unknown';
    const sourceUrl = `${pageUrl}/index.html`; // Corrected the source URL

    // Additional meaningful information
    const readTime = metadata?.readtime ? `${metadata.readtime} min read` : ''; // Read time
    const numImages = metadata?.images ? metadata.images.length : 0; // Number of images
    const numVideos = metadata?.videos ? metadata.videos.length : 0; // Number of videos

    return html`
      <div class="card">
        <!-- Image clickable and opens the image in a new window -->
        <a href="${imageUrl}" target="_blank" rel="noopener noreferrer">
          <img src="${imageUrl}" alt="${title || 'Image'}" />
        </a>

        <!-- Title with "open in new window" icon -->
        <a href="${pageUrl}" target="_blank" rel="noopener noreferrer">
          <h3>
            ${title}
            <simple-icon
              icon="icons:launch"
              style="--simple-icon-width: 16px; --simple-icon-height: 16px; vertical-align: middle;"
            ></simple-icon>
          </h3>
        </a>

        <p>${description}</p>
        <p>Last updated: ${lastUpdated}</p>
        ${readTime ? html`<p>${readTime}</p>` : ''}
        ${numImages > 0 ? html`<p>Contains ${numImages} images</p>` : ''}
        ${numVideos > 0 ? html`<p>Contains ${numVideos} videos</p>` : ''}

        <!-- Buttons side by side -->
        <div class="card-links">
          <a href="${pageUrl}" target="_blank" rel="noopener noreferrer">Open Content</a>
          <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Open Source</a>
        </div>
      </div>
    `;
  }

  async updateResults(url) {
    // Fetch and process data from the specified URL
    this.loading = true;
    try {
      // Try to fetch the URL's site.json
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch site.json'); // Error handling
      const data = await response.json();

      if (data.metadata && data.items) {
        // Checks the site.json for specific data
        const metadata = data.metadata;
        const siteData = metadata.site || {};
        const themeData = metadata.theme || {};
        const themeVariables = themeData.variables || {};

        // Extracts the theme name
        const themeName = themeData.name || 'Default';

        // Extracts created and updated dates
        const createdDate = siteData.created
          ? new Date(siteData.created * 1000).toLocaleDateString()
          : 'Unknown';
        const updatedDate = siteData.updated
          ? new Date(siteData.updated * 1000).toLocaleDateString()
          : 'Unknown';

        // Extracts hexCode and icon from theme variables
        const hexCode = themeVariables.hexCode || '#333';
        const icon = themeVariables.icon || ''; // Extract the icon

        this.siteMetadata = {
          // Sets the metadata for the Overview section
          siteName: siteData.name || 'Unknown Site',
          description: siteData.description || 'No description available.',
          logo: siteData.logo ? this.resolveUrl(siteData.logo) : null,
          theme: themeName,
          created: createdDate,
          lastUpdated: updatedDate,
          hexCode: hexCode,
          icon: icon,
        };
        this.items = data.items; // Set items to display as cards
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

  resolveUrl(path) {
    // Helps resolve relative URLs
    if (!path) return '';
    return path.startsWith('http')
      ? path
      : `${this.baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
  }
}

customElements.define('mvp-image', MVPImage);
