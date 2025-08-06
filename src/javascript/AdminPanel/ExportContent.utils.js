export const exportCSVFile = (items, fileName, headers, separator = ',') => {
    if (!items || items.length === 0 || !headers) {
        // Nothing to export
        return;
    }

    const headerRow = headers.join(separator);
    const rows = items.map(row =>
        headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(separator)
    );
    const csvContent = [headerRow, ...rows].join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportJSONFile = (data, fileName) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], {type: 'application/json;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${fileName}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
