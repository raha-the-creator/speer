import ReactDOM from "react-dom";
import React, { useState, useEffect } from "react";
import Header from "./Header.jsx";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { CallComp } from "./comps/Call.jsx";
import { Modal } from "./comps/Modal.jsx";
import { BiSolidArchiveIn } from 'react-icons/bi';
import { MdUnarchive } from 'react-icons/md';
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

  const archiveCall = async (callId) => {
    try {
      await fetch(
        `https://cerulean-marlin-wig.cyclic.app/activities/${callId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_archived: true }),
        }
      );

      setActivities((prevActivities) =>
        prevActivities.map((prevActivity) =>
          prevActivity.id === callId
            ? { ...prevActivity, archived: true }
            : prevActivity
        )
      );
      setArchivedActivities((prevArchived) =>
        prevArchived.some((prevActivity) => prevActivity.id === callId)
          ? prevArchived
          : [
              ...prevArchived,
              activities.find((activity) => activity.id === callId),
            ]
      );
    } catch (error) {
      console.log("Error archiving call:", error);
    }
  };

  const unarchiveCall = async (callId) => {
    try {
      await fetch(
        `https://cerulean-marlin-wig.cyclic.app/activities/${callId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_archived: false }),
        }
      );

      setActivities((prevActivities) =>
        prevActivities.some((prevActivity) => prevActivity.id === callId)
          ? prevActivities
          : [
              ...prevActivities,
              archivedActivities.find((activity) => activity.id === callId),
            ]
      );
      setArchivedActivities((prevArchived) =>
        prevArchived.filter((prevActivity) => prevActivity.id !== callId)
      );
    } catch (error) {
      console.log("Error unarchiving call:", error);
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
  const handleToggleArchive = (activity) => {
    if (activity.archived) {
      // Unarchive activity
      const updatedActivities = activities.map((prevActivity) =>
        prevActivity.id === activity.id
          ? { ...prevActivity, archived: false }
          : prevActivity
      );
      setActivities(updatedActivities);
      setArchivedActivities((prevArchived) =>
        prevArchived.filter((prevActivity) => prevActivity.id !== activity.id)
      );
    } else {
      // Archive activity
      const updatedActivities = activities.map((prevActivity) =>
        prevActivity.id === activity.id
          ? { ...prevActivity, archived: true }
          : prevActivity
      );
      setActivities(updatedActivities);
      setArchivedActivities((prevArchived) => [...prevArchived, activity]);
    }
  };

  console.log("Activities feed: " + activities.length);
  console.log("Archived calls: " + archivedActivities.length);

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
            <button onClick={archiveAllCalls}>
              Archive all calls
              <BiSolidArchiveIn />
            </button>
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
            <button onClick={unarchiveAllCalls}>
              Unarchive all calls
              <MdUnarchive />
            </button>
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
