import { Button, Toast, Frame, Card, Layout, Page, TextField, Banner, List } from "@shopify/polaris";
import { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

const ConnectionMoodle = () => {

    const fetch = useAuthenticatedFetch();

    const [btnLoading, setBtnLoading] = useState(false);
    const [ssoBtnLoading, setSsoBtnLoading] = useState(false);
    const [active, setActive] = useState(false);
    const [ssoActive, setSsoActive] = useState(false);
    const [bannerText, setBannerText] = useState('Please enter valid Moodle credentials to link your Shopify app to the Moodle app');
    const [bannerStatus, setBannerStatus] = useState('warning');

    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const SSOtoggleActive = useCallback(() => setSsoActive((ssoActive) => !ssoActive), []);

    const toastMarkup = active ? (
        <Toast content="Settings Saved!" onDismiss={toggleActive} />
    ) : null;

    const SSOMarkup = ssoActive ? (
        <Toast content="Your Key has been Saved!" onDismiss={SSOtoggleActive} />
    ) : null;

    useEffect(async () => {

        const response = await fetch("/api/data/get")
        .then(response => response.json());

        setTextFieldValue(response.data[0]?.moodle_url);
        setATTextFieldValue(response.data[0]?.moodle_accessToken);
        setSSOTextFieldValue(response.data[0]?.moodle_secretKey);

        if (response.data[0]?.isValid === true) {
            setBannerStatus('success');
            setBannerText('Your Shopify app is successfully connected to your Moodle account');
        } else {
            setBannerStatus('warning');
            setBannerText('Please enter valid Moodle credentials to link your Shopify app to the Moodle app');
        }

    }, []);

    const [SSOtextFieldValue, setSSOTextFieldValue] = useState('');
    const [textFieldValue, setTextFieldValue] = useState('');
    const [ATtextFieldValue, setATTextFieldValue] = useState('');

    const SSOhandleTextFieldChange = useCallback(
        (value) => setSSOTextFieldValue(value),
        [],
    );

    const handleTextFieldChange = useCallback(
        (value) => setTextFieldValue(value),
        [],
    );

    const handleATTextFieldChange = useCallback(
        (value) => setATTextFieldValue(value),
        [],
    );

    const handleSaveSecretKey = async () => {

        setSsoBtnLoading(true);

        const payload = {
            mdURL: textFieldValue,
            mdAccessToken: ATtextFieldValue,
            mdSecretKey: SSOtextFieldValue
        };

        const data = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        };

        const response = await fetch('/api/settings/save', data)
        .then(response => response.json());

        setSsoBtnLoading(false);
        SSOtoggleActive();
    };

    const handleTestConnection = async () => {

        setBtnLoading(true);

        const payload = {
            mdURL: textFieldValue,
            mdAccessToken: ATtextFieldValue,
            mdSecretKey: SSOtextFieldValue
        };

        const data = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        };

        const response = await fetch('/api/settings/save', data)
        .then(response => response.json());

        if (response.status === 'success') {
            setBannerText('Your Shopify app is successfully connected to your Moodle account');
            setBannerStatus('success');
        } else if (response.status === 'failed') {
            setBannerText('Please enter valid Moodle credentials to link your Shopify app to the Moodle app');
            setBannerStatus('warning');
        }

        setBtnLoading(false);
        toggleActive();
    };

    return (
        <>
            <div>
                <Page fullWidth>
                    <Layout>
                        <Layout.Section>
                            <Card
                                sectioned
                                title="Connection Settings"
                            >
                                <div>
                                    <div>
                                        <Banner
                                            title={bannerText}
                                            status={bannerStatus}
                                        >
                                        </Banner>
                                    </div>
                                    <br />
                                    <TextField
                                        label="Moodle URL"
                                        type="url"
                                        value={textFieldValue}
                                        onChange={handleTextFieldChange}
                                        helpText="The URL will connect your Moodle Plugin with the Shopify app."
                                        autoComplete="url"
                                    />
                                    <br />
                                    <TextField
                                        label="Moodle Access Token"
                                        type="text"
                                        value={ATtextFieldValue}
                                        onChange={handleATTextFieldChange}
                                        helpText="Your Moodle Access Token."
                                        autoComplete="url"
                                    />
                                    <br />
                                    <Button loading={btnLoading} onClick={handleTestConnection} primary>Test Connection</Button>
                                </div>
                            </Card>
                        </Layout.Section>
                        <Layout.Section>
                            <Card
                                sectioned
                                title="Single Sign On"
                            >
                                <div>
                                    <TextField
                                        label="Secret Key"
                                        type="text"
                                        value={SSOtextFieldValue}
                                        onChange={SSOhandleTextFieldChange}
                                        helpText="This Key will help with SSO logins, please make sure that you enter this same key also on Moodle admin page."
                                        autoComplete="text"
                                    />
                                    <br />

                                    <Button loading={ssoBtnLoading} onClick={handleSaveSecretKey}>Save Changes</Button>
                                </div>
                            </Card>
                        </Layout.Section>
                    </Layout>
                    <Frame>
                        {toastMarkup}
                    </Frame>
                    <Frame>
                        {SSOMarkup}
                    </Frame>
                </Page>
            </div>
        </>
    )
};

export default ConnectionMoodle;