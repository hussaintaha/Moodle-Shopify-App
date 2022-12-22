import { Button, Toast, Frame, Card, Layout, Page } from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { useState, useCallback } from "react";

const SyncPage = () => {

    const fetch = useAuthenticatedFetch();

    const [active, setActive] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false); 

    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const toastMarkup = active ? (
        <Toast content="Courses have been Synced!" onDismiss={toggleActive} />
    ) : null;

    const handleSync = async () => {
        setSyncLoading(true);
        const response = await fetch('/api/sync/route');
        await toggleActive();
        setSyncLoading(false);
    };

    return (
        <>
            <div>
                <Page fullWidth>
                    <Layout>
                        <Layout.Section>
                            <Card
                                sectioned
                                title="Synchronize Courses"
                            >
                                <div>
                                    <Button primary loading={syncLoading} onClick={handleSync}>Start Synchronization</Button>
                                </div>
                            </Card>
                        </Layout.Section>
                    </Layout>
                </Page>
                <Frame>
                    {toastMarkup}
                </Frame>
            </div>
        </>
    )
};

export default SyncPage;