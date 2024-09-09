if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addButtonToTabsMenu);
} else {
    addButtonToTabsMenu();
}

function addButtonToTabsMenu() {
    const form = document.getElementsByClassName('container-fluid')[0];

    if (form) {
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

        button.addEventListener('click', async function (e) {
            try {
                e.preventDefault();
                const inputVal = input.value;

                if (inputVal.length > 0) {
                    chrome.runtime.sendMessage({ action: "fetchJobData", url: inputVal }, function (response) {
                        if (response.error) {
                            console.error('Error:', response.error);
                        } else {
                            const jobTitleInput = document.querySelector('input[name="JobTitle"]');
                            const jobLocationInput = document.querySelector('input[name="JobLocation"]');
                            const agentNameInput = document.querySelector('input[name="AgentName"]');
                            const employerContactInput = document.querySelector('input[name="EmployerContact"]');
                            const applicationMethodSelect = document.querySelector('select[name="ApplicationMethod"]');

                            const parser = new DOMParser();
                            const doc = parser.parseFromString(response.data, 'text/html');

                            const jobTitle = doc.querySelector('meta[property="twitter:title"]');
                            if (jobTitle) {
                                const content = jobTitle.getAttribute('content').split(' - ')[0];
                                jobTitleInput.value = content;
                            } else {
                                console.error('Meta tag with property twitter:title not found');
                            }

                            const jobLocation = doc.querySelector('span[data-automation="job-detail-location"]');
                            if (jobLocation) {
                                const content = jobLocation.innerText;
                                jobLocationInput.value = content;
                            } else {
                                console.error('Meta tag with property twitter:title not found');
                            }

                            const jobAgent = doc.querySelector('.xvu5580._159rinv4y._159rinvh2._7vq8im0._7vq8im1._7vq8im21._1708b944._7vq8ima');
                            if (jobAgent) {
                                const content = jobAgent.innerText;
                                agentNameInput.value = content;
                            } else {
                                console.error('Meta tag with property twitter:title not found');
                            }

                            employerContactInput.value = 'Online';
                            applicationMethodSelect.value = "ONEX";
                        }
                    });
                }
            } catch (error) {
                console.error('Error in event listener: ', error);
            }
        });

        const newDiv = document.createElement('div');
        newDiv.style.display = 'flex';
        newDiv.style.gap = '4px'
        newDiv.appendChild(input);
        newDiv.appendChild(button);
        form.insertBefore(newDiv, form.firstChild);
    } else {
        setTimeout(() => {
            addButtonToTabsMenu();
        }, 500);
    }
}