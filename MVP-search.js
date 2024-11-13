/**
 * Copyright 2024
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import './MVP-Image.js'; // Import the MVPImage component

export class MVPSearch extends LitElement {
  static get properties() {
    return {
      sanitizedUrl: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .header {
        text-align: center;
        margin-bottom: var(--ddd-spacing-4);
      }

      .search-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: var(--ddd-spacing-2);
      }

      input {
        font-size: 20px;
        width: 80%;
        max-width: 400px;
        padding: var(--ddd-spacing-2);
        border-radius: var(--ddd-radius-md);
      }

      button {
        font-size: 20px;
        padding: var(--ddd-spacing-2);
        border-radius: var(--ddd-radius-md);
        cursor: pointer;
      }

      button:hover {
        transition: 0.2s ease, box-shadow 0.2s ease;
        background-color: var(--ddd-theme-default-accent);
      }
    `;
  }

  constructor() {
    super();
    this.sanitizedUrl = '';
  }

  render() {
    return html`
      <div class="header">
        <h1>Hax Site Analyzer</h1>
        <div class="search-container">
          <input
            id="input"
            placeholder="Enter Site Location"
            @keyup="${this.handleKeyUp}"
          />
          <button @click="${this.search}">Analyze</button>
        </div>
      </div>

      ${this.sanitizedUrl
        ? html`<mvp-image .url="${this.sanitizedUrl}"></mvp-image>`
        : ''}
    `;
  }

  handleKeyUp(e) {
    // When the enter key is pressed in the input field, it searches the input
    if (e.key === 'Enter') {
      this.search();
    }
  }

  search() {
    // Ensures input validation and URL standardization for provided URL
    const inputValue = this.shadowRoot.querySelector('#input').value.trim();
    if (!inputValue) {
      // Input validation
      alert('Please enter a valid URL!');
      return;
    }

    let url = inputValue;

    // If the URL doesn't start with 'http://' or 'https://', prepend 'https://'
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    // Convert 'http://' to 'https://'
    url = url.replace(/^http:\/\//i, 'https://');

    // Remove any trailing 'site.json' if present
    url = url.replace(/\/site\.json$/i, '/');

    // Ensure the URL ends with a '/'
    if (!url.endsWith('/')) {
      url += '/';
    }

    // Append 'site.json' to the URL
    url += 'site.json';

    try {
      const parsedUrl = new URL(url); // Parses the URL
      this.sanitizedUrl = parsedUrl.href; // Set the sanitized URL
    } catch (error) {
      alert('Invalid URL format!');
    }
  }
}

customElements.define('mvp-search', MVPSearch);
