import { Link, Toast, Frame, IndexTable, Card, useIndexResourceState, Button, Layout, Page } from '@shopify/polaris';
import { useEffect, useState, useCallback } from 'react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useNavigate } from '@shopify/app-bridge-react';

const MoodlePage = () => {

    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [courseID, setCourseID] = useState();
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncLoadingNew, setSyncLoadingNew] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [shopName, setShopName] = useState('');

    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(courses);

    const [active, setActive] = useState(false);
    const [courseFetch, setCourseFetch] = useState(false);
    const [courseUpdate, setCourseUpdate] = useState(false);

    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const toggleFetch = useCallback(() => setCourseFetch((courseFetch) => !courseFetch), []);
    const toggleUpdate = useCallback(() => setCourseUpdate((courseUpdate) => !courseUpdate), []);

    const toastMarkup = active ? (
        <Toast content="Products Created/Updated Successfully!" onDismiss={toggleActive} />
    ) : null;

    const toastMarkupNew = courseFetch ? (
        <Toast content={toastMsg} onDismiss={toggleFetch} />
    ) : null;

    const toastMarkupUpdate = courseUpdate ? (
        <Toast content="Product Updated!" onDismiss={toggleUpdate} />
    ) : null;    

    const fetch = useAuthenticatedFetch();

    useEffect(async () => {
        await handleFetch();

        const getShopName = await handlePageData();

        setShopName(getShopName);
    }, []);

    useEffect(async() => {
        const the_course = courses.find(crs => crs.course.id === selectedResources[0]);

        if (the_course) {
            setCourseID(selectedResources);
        }

    }, [selectedResources]);

    const handleFetch = async () => {
        setSyncLoading(true);
        const response = await fetch('/api/testing/route')
        .then(response => response.json());

        setCourses(response);
        setSyncLoading(false);

        response.length !== 0 ? setToastMsg('Courses synced successfully!') : setToastMsg('No Courses Found. Please Sync the Courses');

        toggleFetch();
    };

    const handlePageData = async () => {
        const response = await fetch("/api/data/get")
        .then(response => response.json());
        
        return response.data[0]?.shop;
    };

    const handleCreateProduct = async () => {

        setSyncLoadingNew(true);

        const payload = {
            courseID: courseID,
        };

        const data = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        };

        await fetch('/api/products/create', data)
        .then(response => response.json());

        toggleActive();
        setSyncLoadingNew(false);
        await handleFetch();
    };

    const resourceName = {
        singular: 'course',
        plural: 'courses',
    };

    const rowMarkup = courses.map(
        ({ course, product }, index) => (
            <IndexTable.Row
                id={course?.id}
                key={course?.id}
                selected={selectedResources.includes(course?.id)}
                position={index}
            >
                <IndexTable.Cell>{course?.fullname}</IndexTable.Cell>
                <IndexTable.Cell>{course?.category?.name}</IndexTable.Cell>
                <IndexTable.Cell>{course?.id}</IndexTable.Cell>
                <IndexTable.Cell>
                    {
                        product == 'Not Created' ?
                            product :
                            <Link removeUnderline={true} onClick={() => {
                                navigate(`https://${shopName}/admin/products/${product.id.replace("gid://shopify/Product/", "")}`, {
                                    target: "new"
                                });
                            }}>{product?.title}</Link>
                    }
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <>
            <div>
                <Page fullWidth>
                    <Layout>
                        <Layout.Section>
                            <Button loading={syncLoading} onClick={handleFetch} primary>Refresh</Button>
                            <br />
                            <br />
                            <Card>
                                <IndexTable
                                    resourceName={resourceName}
                                    itemCount={courses.length}
                                    selectedItemsCount={
                                        allResourcesSelected ? 'All' : selectedResources.length
                                    }
                                    onSelectionChange={handleSelectionChange}
                                    headings={[
                                        { title: 'Moodle Course Name' },
                                        { title: 'Moodle Course Category' },
                                        { title: 'Moodle Course ID' },
                                        { title: 'Shopify Product' }
                                    ]}
                                >
                                    {rowMarkup}
                                </IndexTable>
                            </Card>

                            <br />
                            <br />

                            {
                                selectedResources.length === 0 ?
                                <div></div> :
                                <Button loading={syncLoadingNew} onClick={handleCreateProduct} primary>Sync Product</Button>
                            }
                        </Layout.Section>
                    </Layout>
                </Page>

                <Frame>
                    {toastMarkupUpdate}
                </Frame>
                <Frame>
                    {toastMarkup}
                </Frame>
                <Frame>
                    {toastMarkupNew}
                </Frame>
            </div>
        </>
    )
}

export default MoodlePage;