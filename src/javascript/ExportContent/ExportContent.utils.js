export const extractAndFormatContentTypeData = data => {
    const nodes = data?.jcr?.nodeTypes?.nodes || [];
    return nodes.map(n => ({
        label: n.displayName || n.name,
        value: n.name,
        iconStart: n.icon
    }));
};
