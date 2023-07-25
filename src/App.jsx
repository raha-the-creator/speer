import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import Header from './Header.jsx';

const App = () => {
  const [activities, setActivities] = useState([]);
  const apiURL = 'https://cerulean-marlin-wig.cyclic.app/activities';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiURL);
        if (!response.ok) {
          throw new Error("Network response wasn't ok");
        }
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        console.log("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='container'>
      <Header />
      <br/>
      <br/>
      <div className="container-view">
        {activities.map((activity) => (
          <div>
            <li key={activity.id}>{activity.id}</li>
          </div>
        ))}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));

export default App;
