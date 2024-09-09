const buttonId = 'dole-bludger';
const retryInterval = 500;

// Initialize the extension
function initializeExtension() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => addButtonToTabsMenu());
    } else {
        addButtonToTabsMenu();
    }
}

// Add button to form - retry if form not found
function addButtonToTabsMenu() {
    const form = document.querySelector('.container-fluid');
    if (!form) {
        setTimeout(() => addButtonToTabsMenu(), retryInterval);
        return;
    }

    if (document.getElementById(buttonId)) return;

    const newDiv = createFormFillerElements();
    form.insertBefore(newDiv, form.firstChild);
}

// Main div element
function createFormFillerElements() {
    const newDiv = document.createElement('div');
    newDiv.id = buttonId;
    newDiv.style.cssText = 'display: flex; gap: 4px;';

    const input = createInput();
    const button = createButton();

    newDiv.appendChild(input);
    newDiv.appendChild(button);

    return newDiv;
}

// Input element
function createInput() {
    const input = document.createElement('input');
    input.placeholder = 'Enter a seek.com.au job listing URL to auto fill the form below';
    input.style.cssText = `
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        align-items: center;
        height: 36px;
        width: 100%;
        margin-bottom: 10px;
    `;
    return input;
}

// Button element
function createButton() {
    const button = document.createElement('button');
    button.textContent = 'FILL FORM';
    button.style.cssText = `
        background-color: #00a1d0;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        height: 36px;
        min-width: fit-content;
    `;
    button.addEventListener('click', handleButtonClick);
    return button;
}

// Handle button clikc
async function handleButtonClick(e) {
    e.preventDefault();
    const input = document.querySelector(`#${buttonId} input`);
    const url = input.value.trim();

    if (!url) {
        console.error('Please enter a valid URL');
        return;
    }

    try {
        const jobData = await fetchJobData(url);

        if (url.includes('seek.com.au/')) fillFormFromSeek(jobData);
        if (url.includes('au.jora.com/')) fillFormFromJora(jobData);
        if (url.includes('au.indeed.com/')) fillFormFromIndeed(jobData);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Fetch job data
function fetchJobData(url) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "fetchJobData", url }, response => {
            if (response.error) {
                reject(new Error(response.error));
            } else {
                resolve(response.data);
            }
        });
    });
}

// Fill form with job data
function fillFormFromSeek(htmlData) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlData, 'text/html');

    const jobTitle = doc.querySelector('h1[data-automation="job-detail-title"]')?.textContent;
    const jobLocation = doc.querySelector('span[data-automation="job-detail-location"]')?.textContent;
    const jobAgent = doc.querySelector('h1[data-automation="job-detail-title"]')?.closest('div')
        ?.nextElementSibling?.querySelector('span')?.textContent.trim();

    setInputValue('input[name="JobTitle"]', jobTitle, 50);
    setInputValue('input[name="JobLocation"]', jobLocation);
    setInputValue('input[name="AgentName"]', jobAgent);
    setInputValue('input[name="EmployerContact"]', 'Online');
    setSelectValue('select[name="ApplicationMethod"]', 'ONEX');
}

function fillFormFromJora(htmlData) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlData, 'text/html');

    const jobTitle = doc.querySelector('h1.job-title')?.textContent;
    const jobLocation = doc.querySelector('span.location')?.textContent;
    const jobAgent = doc.querySelector('span.company')?.textContent;

    setInputValue('input[name="JobTitle"]', jobTitle, 50);
    setInputValue('input[name="JobLocation"]', jobLocation);
    setInputValue('input[name="AgentName"]', jobAgent);
    setInputValue('input[name="EmployerContact"]', 'Online');
    setSelectValue('select[name="ApplicationMethod"]', 'ONEX');
}

function fillFormFromIndeed(htmlData) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlData, 'text/html');

    const jobTitle = doc.querySelector('h1.jobsearch-JobInfoHeader-title')?.textContent;
    const jobLocation = doc.querySelector('div[data-testid="inlineHeader-companyLocation"]')?.textContent;
    const jobAgent = doc.querySelector('div[data-testid="inlineHeader-companyName"] a')?.textContent.trim().split('.css')[0];

    setInputValue('input[name="JobTitle"]', jobTitle, 50);
    setInputValue('input[name="JobLocation"]', jobLocation);
    setInputValue('input[name="AgentName"]', jobAgent);
    setInputValue('input[name="EmployerContact"]', 'Online');
    setSelectValue('select[name="ApplicationMethod"]', 'ONEX');
}

// Set input value
function setInputValue(selector, value, maxLength) {
    const input = document.querySelector(selector);
    if (input && value) {
        input.value = maxLength ? value.slice(0, maxLength).trim() : value.trim();
    } else {
        console.error(`${selector} not found or value is empty`);
    }
}

// Set select value
function setSelectValue(selector, value) {
    const select = document.querySelector(selector);
    if (select) {
        select.value = value;
    } else {
        console.error(`${selector} not found`);
    }
}

initializeExtension();