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
      id: 'courses',
      content: 'Courses',
      accessibilityLabel: 'Courses',
      panelID: 'courses',
      page: '/courses'

    },
    {
      id: 'synchronization',
      content: 'Synchronization',
      accessibilityLabel: 'Synchronization',
      panelID: 'synchronization',
      page: '/synchronization'
    },
  ];

  let PageMarkup = MoodlePage;

  switch (page) {
    case '/':
      PageMarkup = MoodlePage;
      break;
    case '/synchronization':
      PageMarkup = SyncPage;
      break;
    default:
      PageMarkup = MoodlePage;
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