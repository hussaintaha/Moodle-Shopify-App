import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  Tabs
} from "@shopify/polaris";

import MoodlePage from "./MoodlePage";
import SyncPage from "./SyncPage";
import ConnectionMoodle from "./ConnectionMoodle";

import { useState } from "react";

export default function HomePage() {

  const [page, setPage] = useState('/');
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (index) => {
    setSelectedTab(index);
    setPage(tabs[index].page);
  }

  const tabs = [
    {
      id: 'connectionsettings',
      content: 'Connection Settings',
      accessibilityLabel: 'ConnectionSettings',
      panelID: 'connectionsettings',
      page: '/connectionsettings'
    },
    {
      id: 'synchronization',
      content: 'Synchronization',
      accessibilityLabel: 'Synchronization',
      panelID: 'synchronization',
      page: '/synchronization'
    },
    {
      id: 'courses',
      content: 'Courses',
      accessibilityLabel: 'Courses',
      panelID: 'courses',
      page: '/courses'

    }
  ];

  let PageMarkup = MoodlePage;

  switch (page) {
    case '/':
      PageMarkup = ConnectionMoodle;
      break;
    case '/synchronization':
      PageMarkup = SyncPage;
      break;
    case '/courses':
      PageMarkup = MoodlePage;
      break;
    default:
      PageMarkup = ConnectionMoodle;
      break;
  }

  return (
    <>
      <div>
        <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
          <PageMarkup setPage={setPage} handleTabChange={handleTabChange} />
        </Tabs>
      </div>
    </>
  );
}