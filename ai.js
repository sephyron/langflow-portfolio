
import { HumanMessage } from '@langchain/core/messages';
import { ChatAnthropic } from '@langchain/anthropic';
import MarkdownIt from 'markdown-it';
import * as base64 from 'base64-js';
import './style.css';

const fileTypes = [
  "image/apng",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/pjpeg",
  "image/png",
  "image/svg+xml",
  "image/tiff",

  "image/webp",
  "image/x-icon",
];

class AiComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        fieldset {
          border: 1px solid inherit;
          padding: 0 0.25rem 0.35rem 0.25rem;
          margin-bottom: 0.5rem;
          border-radius: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 50px;
          align-items: center;
        }
        fieldset input {
          border: 0; 
          width: 100%;
          display: block;
          height: 100%;
          
        }
        fieldset input[name="image"] {
          width: min-content;

          height: 100%;
          padding: auto;
          align-items: center;
          justify-content: center;
        }
        fieldset label {
          height: 100%;
          width: 80%;
          overflow: hidden;
          white-space: nowrap;
          font-weight: bold;
          text-transform: uppercase;
          text-overflow: ellipsis;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        fieldset legend {
          text-transform: uppercase;
          font-size: 0.75rem;
        }
      </style>
      <form>
  <fieldset>
    <legend>Prompt</legend>
    <input type="text" name="prompt" placeholder="Enter your prompt">
    <label for="image">Choose images to upload (PNG, JPG)</label>
    
    <input type="file" name="image" accept="image/*,.pdf" text="choose image">
  </fieldset> 
  <div id="imagePreview"></div> <button type="submit">Generate</button>
</form>
      <div class="output"></div>
    `;
  }

  connectedCallback() {
    const form = this.shadowRoot.querySelector('form');
    const promptInput = this.shadowRoot.querySelector('input[name="prompt"]');
    const output = this.shadowRoot.querySelector('.output');
    const fileInput = this.shadowRoot.querySelector('input[name="image"]');
    const preview = this.shadowRoot.getElementById('imagePreview');
    fileInput.addEventListener('change', () => this.updateImageDisplay()); 
    form.onsubmit = async (ev) => {
      ev.preventDefault();
      output.textContent = 'Generating...';
      try {
        const prompt = promptInput.value; 
        let imageBase64 = null; 
        if (fileInput.files.length > 0) { // Check if an image is selected
          const file = fileInput.files[0];
          imageBase64 = await this.getBase64(file); // Convert image to Base64
        }
        const model = new ChatAnthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });
        // Construct the prompt with or without the image
        const fullPrompt = imageBase64
          ? `Human: ${prompt}\nImage: ${imageBase64}`
          : `Human: ${prompt}`;
        const response = await model.call([new HumanMessage(fullPrompt)]);
        const md = new MarkdownIt();
        output.innerHTML = md.render(response.text);
      } catch (e) {
        output.textContent = `Error: ${e.message}`;
      }
    };
  
}
  // Helper function to convert file to Base64
  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Extract Base64 part
      reader.onerror = error => reject(error);
    });
  }

  updateImageDisplay() {
    const preview = this.shadowRoot.getElementById('imagePreview'); // Access preview from shadow DOM
  
    while (
preview.firstChild) {
      preview.removeChild(preview.firstChild);
    }
  
  
    const curFiles = fileInput.files;
    if (curFiles.length === 0) {
      const para = document.createElement("p");
      para.textContent = "No files currently selected for upload";
      preview.appendChild(para);
    } else {
      const list = document.createElement("ol");
      preview.appendChild(list);
  
      for (const file of curFiles) {
        const listItem = document.createElement("li");
        const para = document.createElement("p");
        if (this.validFileType(file)) {
          para.textContent = `File name ${file.name}, file size ${this.returnFileSize(file.size)}.`;
          const image = document.createElement("img");
          image.src = URL.createObjectURL(file);
          image.alt = image.title = file.name;
          listItem.appendChild(image);
          listItem.appendChild(para);
        } else {
          para.textContent = `File name ${file.name}: Not a valid file type
. Update your selection.`;
          listItem.appendChild(para);
        }
        list.appendChild(listItem);
      }
    }
  }
  
  validFileType(file) {
    return fileTypes.includes(file.type);
  }
  returnFileSize(number) {
    if (number < 1e3) {
      return `${number} bytes`;
    } else if (number >= 1e3 && number < 1e6) {
      return `${(number / 1e3).toFixed(1)} KB`;
    } else {
      return `${(number / 1e6).toFixed(1)} MB`;
    }
  }
}
customElements.define('ai-component', AiComponent);

