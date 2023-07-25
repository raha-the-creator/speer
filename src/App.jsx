import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import Header from "./Header.jsx";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

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

  // Helper function to group activities by date
  const groupActivitiesByDate = (activities) => {
    const groups = {};
    activities.forEach((activity) => {
      const date = new Date(activity.created_at).toISOString().slice(0, 10);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div className="container">
      <Header />
      <br />
      <div className="container-view">
        <Tabs>
          <TabList>
            <Tab>All</Tab>
            <Tab>Archived</Tab>
          </TabList>

          <TabPanel>
            <h2>All calls information</h2>
            {Object.entries(groupedActivities).map(([date, activities]) => (
              <div key={date}>
                <div>
                  <h1>{date}</h1>
                </div>
                {/* <br/> */}
                {activities.map((activity) => (
                  <div key={activity.id} style={{ border: "1px solid red" }}>
                    <p>{activity.direction} call</p>
                    <p>from {activity.from}</p>
                    <p>
                      {new Date(activity.created_at)
                        .toISOString()
                        .slice(11, 19)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </TabPanel>

          <TabPanel>
            <h2>Archived calls</h2>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));

export default App;
