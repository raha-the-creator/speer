import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import Header from "./Header.jsx";

const App = () => {
  const [activities, setActivities] = useState([]);
  const apiURL = "https://cerulean-marlin-wig.cyclic.app/activities";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiURL);
        if (!response.ok) {
          throw new Error("Network response wasn't ok");
        }
        const data = await response.json();

        // Sort activities based on the date (created_at field)
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setActivities(data);
      } catch (err) {
        console.log("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container">
      <Header />
      <br />
      <div className="container-view">
        {activities.map((activity) => (
          <div style={{ border: "1px solid red" }}>
            <p>{activity.direction} call</p>
            <p>from {activity.from}</p>
            <p>{new Date(activity.created_at).toISOString().slice(0, 10)}</p>
            <p>{new Date(activity.created_at).toISOString().slice(11, 19)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));

export default App;
