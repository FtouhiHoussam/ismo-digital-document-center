export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;

  const separator = ",";
  const keys = Object.keys(rows[0]);

  const csvContent = [
   
    keys.join(separator),
   
    ...rows.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? "" : String(row[k]);
       
        if (cell.includes(separator) || cell.includes("\n") || cell.includes("\"")) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(separator);
    })
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
