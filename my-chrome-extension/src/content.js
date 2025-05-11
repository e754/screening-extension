
async function logArticles() {
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
      await analyzeArticle(studies[i], context);
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

async function analyzeArticle(study, context) {
  console.log("COntext here")
  console.log(context);
  const response = await fetch('http://localhost:3001/gemini', {
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
        <<<Include  
        Studies must be published in English.

        Research must take place in the United States, Ignoring International studies.

        Studies must focus on farmworkers in the U.S.

        Only include empirical research (peer-reviewed articles, government reports, evaluations, white papers).

        Any methodology is acceptable.

        Research must present empirical evidence, not purely theoretical or commentary-based.

        The primary aim must be to evaluate the function or impact of federal policies (WPS or Field Sanitation Standard) that protect farmworkers from environmental or occupational hazards.

        Include studies that mention WPS or Field Sanitation in title or abstract.

        Must assess at least one actionable component of a federal regulation (e.g., pesticide notification, re-entry intervals).

        Must be published on or after January 1, 1990.>>>

        Exclusion Criteria
        <<<Exclude

        Exclude articles that mention federal regulations but do not analyze their function, effectiveness, or impact.

        Exclude studies focused only on state-level regulations, unless they clearly evaluate how a federal regulation is implemented at the state level.

        Exclude general discussions of farmworker conditions without analysis of specific regulatory provisions.

        Exclude purely descriptive or theoretical articles without empirical data.>>>

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


  // highlightVoteButtons(); // Highlight buttons

  // Resume observing after changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

}
// function highlightVoteButtons() {
//   const buttons = document.querySelectorAll('button.button.vote-option.primary');
//   buttons.forEach(btn => {
//     btn.style.backgroundColor = '#ffeb3b';   // bright yellow
//     btn.style.color = '#000';               // black text
//     btn.style.fontWeight = 'bold';
//     btn.style.border = '2px solid #fbc02d';
//     btn.style.borderRadius = '4px';
//     btn.title = 'Highlighted by extension';
//   });
// }

// Set up MutationObserver
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      logArticles();
      break;
    }
  }
});

// Initial run
logArticles();
