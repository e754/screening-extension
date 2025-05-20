
async function findCriterias() {
  return new Promise((resolve) => {
    //things to return
    let includeList = [];
    let excludeList = [];

    observer.disconnect();

    //click button to get criterias
    const criteriaButton = document.querySelector('#show-review-criteria');
    if (criteriaButton) {
      criteriaButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      console.log("Clicked criteria button");
      const main = document.querySelector('main#main');

      //waitget it to load
      const criteriaObserver = new MutationObserver((mutations, obs) => {
        const criteriaSections = document.querySelectorAll('.webpack-pages-StudyList-ReviewEligibilityCriteria-ReviewEligibilityCriteria-module__rowItem');
        if (criteriaSections.length > 0) {
          console.log("Criteria sections found:", criteriaSections.length);

          //alternate between inclusion and exclusion for sections
          let include = false;
          criteriaSections.forEach(section => {
            include = !include;
            const criteriaItems = section.querySelectorAll('li > p');
            //add all criterias here
            criteriaItems.forEach(item => {
              const text = item.innerText.trim();
              if (include) includeList.push(text);
              else excludeList.push(text);
            });
          });

          obs.disconnect();
          resolve([includeList, excludeList]);
        }
      });

      criteriaObserver.observe(main, { childList: true, subtree: true });
    } else {
      // Fallback if button isn't found
      resolve([[], []]);
    }
  });
}

 

async function logArticles(include, exclude) {
  // Temporarily stop observing to prevent self-triggering
  observer.disconnect();

  const studies = document.querySelectorAll('.reference.clearfix');
  console.log("length", studies.length);

  for (let i = 0; i < studies.length; i++) {
    const title = studies[i].querySelector('h3.title');
    const abstract = studies[i].querySelector('div.abstract');

    let context = title.innerText.trim();

    if(abstract) {
      console.log("Abstract exist")
      context = context + " " +abstract.innerText.trim();
    }
    if (!studies[i].dataset.aiProcessed) {
      await analyzeArticle(studies[i], context, include, exclude);
    }
    // Prevent adding duplicate buttons
    const place = studies[i].querySelector('p.ref-ids')
    if (!place.querySelector('.log-study-btn')) {
      const button = document.createElement('button');
      button.innerText = 'AI Check';
      button.className = 'log-study-btn'; // give it a class to identify
      button.style.marginTop = '10px';

      button.addEventListener('click', async() => {

      
      });

      place.appendChild(button);
    }
  }

async function analyzeArticle(study, context, include, exclude) {
  const inclusionText = include.map(item => item.trim()).join('\n');
  const exclusionText = exclude.map(item => item.trim()).join('\n');
  console.log("COntext here")
  console.log(context);
  const response = await fetch('https://screening-extension.onrender.com/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "gemini-2.5-flash-preview-04-17",
      contents: 
      `
        You are assisting a researcher in conducting a structured literature review. Your task is to screen articles based on strict inclusion and exclusion criteria. Respond only with a valid JSON object structured as shown below. For each criterion, return "Yes", "No", or "Maybe"—based only on information available in the Title and Abstract provided. Do not add explanations or extra text.

        Example format:

        json
        {
        "Inclusion Criteria": {
        "Studies must be published in English": "Yes",
        ...
        },
        "Exclusion Criteria": {
        "Articles that mention regulations without analyzing their function, effectiveness, or impact will be excluded.": "Maybe",
        ...
        }
        }

        Interpret the criteria **strictly and conservatively**. When in doubt, respond with "Maybe".

        Below are the screening criteria, marked by <<<>>>:

        **Inclusion Criteria**
        <<<${inclusionText}>>>

        **Exclusion Criteria**
        <<<${exclusionText}>>>

        Look through the text for material potentially related to each criteria, rationalize with given information, use Maybe if we really arne't sure.
        <<<${context}>>>"`
    ,})
    });
    const data = await response.json();
    console.log(data);

    let rawText = data.candidates[0].content.parts[0].text;
    console.log(rawText);

    rawText = rawText.replace(/^```json\n/, "").replace(/```$/, "");
    const parsedJson = JSON.parse(rawText);
    insertCriteriaToPage(parsedJson, study);
    console.log(parsedJson);
    study.dataset.aiProcessed = "true"; // Mark this study as processed

}

function insertCriteriaToPage(criteriaJson, study) {
  const container = study;

  Object.entries(criteriaJson).forEach(([sectionTitle, criteria]) => {
    // Create and append the section title
    const sectionHeader = document.createElement('h3');
    sectionHeader.innerText = sectionTitle;
    sectionHeader.style.marginTop = '20px';
    container.appendChild(sectionHeader);

    // Create a list to hold the criteria
    const list = document.createElement('ul');
    list.style.paddingLeft = '20px';

    Object.entries(criteria).forEach(([criterion, status]) => {
      const listItem = document.createElement('li');
      listItem.innerText = `${criterion} — ${status}`;

      // Apply color based on section and status
      let color = 'black'; // default
      if (sectionTitle === 'Inclusion Criteria') {
        if (status === 'Yes') color = 'green';
        else if (status === 'Maybe') color = 'orange';
        else if (status === 'No') color = 'red';
      } else if (sectionTitle === 'Exclusion Criteria') {
        if (status === 'Yes') color = 'red';
        else if (status === 'Maybe') color = 'orange';
        else if (status === 'No') color = 'green';
      }

      listItem.style.color = color;
      list.appendChild(listItem);
    });

    container.appendChild(list);
  });
}

  // Resume observing after changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

}

// Set up MutationObserver
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      logArticles();
      break;
    }
  }
});

//initial run
(async () => {
  const [includeList, excludeList] = await findCriterias();
  console.log("Include:", includeList);
  console.log("Exclude:", excludeList);

  logArticles(includeList, excludeList); // Only call after criteria is loaded
})();