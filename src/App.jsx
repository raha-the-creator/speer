import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import Header from "./Header.jsx";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { CallComp } from "./comps/Call.jsx";
import { Modal } from "./comps/Modal.jsx";
import "react-tabs/style/react-tabs.css";
import "./index.css";

const App = () => {
  const [activities, setActivities] = useState([]);
  const [archivedActivities, setArchivedActivities] = useState([]);
  const [modalActivity, setModalActivity] = useState(null);

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

  const archiveCall = async (call_id) => {
    const url = `https://cerulean-marlin-wig.cyclic.app/activities/${call_id}`;
    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        is_archived: true,
      }),
    };

    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error("Network response wasn't ok");
      }

      // Update the local state in the React application to reflect the archived status change
      setActivities((prevActivities) =>
        prevActivities.map((prevActivity) =>
          prevActivity.id === call_id
            ? { ...prevActivity, archived: true }
            : prevActivity
        )
      );
      setArchivedActivities((prevArchived) => [
        ...prevArchived,
        activities.find((activity) => activity.id === call_id),
      ]);
    } catch (err) {
      console.log("Error archiving call:", err);
    }
  };

  const unarchiveCall = async (call_id) => {
    const url = `https://cerulean-marlin-wig.cyclic.app/activities/${call_id}`;
    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        is_archived: false,
      }),
    };

    try {
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error("Network response wasn't ok");
      }

      // Update the local state in the React application to reflect the unarchived status change
      setActivities((prevActivities) =>
        prevActivities.map((prevActivity) =>
          prevActivity.id === call_id
            ? { ...prevActivity, archived: false }
            : prevActivity
        )
      );
      setArchivedActivities((prevArchived) =>
        prevArchived.filter((prevActivity) => prevActivity.id !== call_id)
      );
    } catch (err) {
      console.log("Error unarchiving call:", err);
    }
  };

  // ARCHIVE ALL
  const archiveAllCalls = async () => {
    try {
      for (const activity of activities) {
        if (!activity.archived) {
          await archiveCall(activity.id);
        }
      }
    } catch (err) {
      console.log("Error archiving all calls:", err);
    }
  };

  // UNARCHIVE ALL
  const unarchiveAllCalls = async () => {
    try {
      for (const activity of archivedActivities) {
        if (activity.archived) {
          await unarchiveCall(activity.id);
        }
      }

      setActivities((prevActivities) => [
        ...prevActivities,
        ...archivedActivities,
      ]);
      setArchivedActivities([]);
    } catch (err) {
      console.log("Error unarchiving all calls:", err);
    }
  };

  // Helper function to group activities by date
  const groupActivitiesByDate = (activities) => {
    const groups = {};
    activities.forEach((activity) => {
      if (!activity.archived) {
        const date = new Date(activity.created_at).toISOString().slice(0, 10);
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(activity);
      }
    });
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(activities);

  const handleActivityClick = (activity) => {
    setModalActivity(activity);
  };

  const handleCloseModal = () => {
    setModalActivity(null);
  };

  // Handle toggling archive/unarchive
  const handleToggleArchive = async (activity) => {
    try {
      if (activity.archived) {
        // Unarchive activity
        await unarchiveCall(activity.id);

        setActivities((prevActivities) => [...prevActivities, activity]);
        setArchivedActivities((prevArchived) =>
          prevArchived.filter((prevActivity) => prevActivity.id !== activity.id)
        );
      } else {
        // Archive activity
        await archiveCall(activity.id);

        setActivities((prevActivities) =>
          prevActivities.filter(
            (prevActivity) => prevActivity.id !== activity.id
          )
        );
        setArchivedActivities((prevArchived) => [...prevArchived, activity]);
      }
    } catch (err) {
      console.log("Error toggling archive:", err);
    }
  };

  console.log(activities);

  return (
    <div className="container">
      <Header />
      <br />
      {/* <div className="text-red-500">TEST DIV</div> */}
      <div className="container-view">
        <Tabs>
          <TabList>
            <Tab>Activity Feed</Tab>
            <Tab>Archived</Tab>
          </TabList>

          <TabPanel>
            <button onClick={archiveAllCalls}>Archive all</button>
            {Object.entries(groupedActivities).map(([date, activities]) => (
              <div key={date}>
                <div>
                  <h1>{date}</h1>
                </div>
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    style={{ border: "1px solid red", cursor: "pointer" }}
                    onClick={() => handleActivityClick(activity)}
                  >
                    <p>{activity.id}</p>
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
            <button onClick={unarchiveAllCalls}>Unarchive all calls</button>
            {archivedActivities
              .slice(0) // Clone the array to avoid mutating original data
              .reverse() // Reverse to display recent archived calls first
              .map((activity) => (
                <div
                  key={activity.id}
                  style={{ border: "1px solid red", cursor: "pointer" }}
                  onClick={() => handleActivityClick(activity)}
                >
                  <p>{activity.id}</p>
                  <p>{activity.direction} call</p>
                  <p>from {activity.from}</p>
                  <p>
                    {new Date(activity.created_at).toISOString().slice(11, 19)}
                  </p>
                </div>
              ))}
          </TabPanel>
        </Tabs>
      </div>

      {modalActivity && (
        <Modal
          activity={modalActivity}
          onClose={handleCloseModal}
          onToggleArchive={handleToggleArchive}
        />
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));

export default App;
