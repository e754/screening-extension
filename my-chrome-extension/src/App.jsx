import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';


function App() {
  const [inclusionText, setInclusionText] = useState('');
  const [exclusionText, setExclusionText] = useState('');
  const [inclusionList, setInclusionList] = useState([]);
  const [exclusionList, setExclusionList] = useState([]);

  const handleInclusionSubmit = (e) => {
    e.preventDefault();
    setInclusionList([...inclusionList, inclusionText]);
    setInclusionText('');
  };

  const handleExclusionSubmit = (e) => {
    e.preventDefault();
    setExclusionList([...exclusionList, exclusionText]);
    setExclusionText('');
  };

  const handleDelete = (type, index) => {
    if (type === 'inclusion') {
      setInclusionList(inclusionList.filter((_, i) => i !== index));
    } else {
      setExclusionList(exclusionList.filter((_, i) => i !== index));
    }
  };

  const openPersistentWindow = () => {
      window.open('index.html', '_blank');

    // if (chrome && chrome.tabs) {
    //   chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    //   console.log("first")
    // } else {
    //   window.open('index.html', '_blank');
    //   console.log("else");
    // }
  };

  return (
    <>
      <h1>Abstract Scraper</h1>
      <div className="card">
        <form onSubmit={handleInclusionSubmit}>
          <label htmlFor="inclusionInput">Add inclusion criteria:</label>
          <input
            type="text"
            id="inclusionInput"
            value={inclusionText}
            onChange={(e) => setInclusionText(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>

        <ul className = "inclusion">
          {inclusionList.map((item, index) => (
            <li key={index} onClick={() => handleDelete('inclusion', index)} style={{ cursor: 'pointer' }}>
              {item}
            </li>
          ))}
        </ul>

        <form onSubmit={handleExclusionSubmit}>
          <label htmlFor="exclusionInput">Add exclusion criteria:</label>
          <input
            type="text"
            id="exclusionInput"
            value={exclusionText}
            onChange={(e) => setExclusionText(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>
 
        <ul className = "exclusion">
          {exclusionList.map((item, index) => (
            <li key={index} onClick={() => handleDelete('exclusion', index)} style={{ cursor: 'pointer' }}>
              {item}
            </li>
          ))}
        </ul>

        <button style={{ marginTop: '20px', background: '#1976d2', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={openPersistentWindow}>
          Open Persistent Window
        </button>

      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
