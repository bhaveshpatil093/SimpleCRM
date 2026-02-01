
import * as XLSX from 'xlsx';
import { formatDate, formatCurrency } from './utils';

/**
 * Exports data to an Excel or CSV file.
 */
export function exportToExcel(sheets: { name: string, data: any[] }[], filename: string, format: 'xlsx' | 'csv' = 'xlsx') {
  const wb = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    // Transform data for human readability if needed
    const transformed = sheet.data.map(item => {
      const flat: any = {};
      Object.keys(item).forEach(key => {
        if (key === 'id') return; // Hide internal IDs
        const val = item[key];
        
        // Humanize common keys
        if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
          flat[key] = formatDate(val, true);
        } else if (key === 'value' || key === 'revenue' || key === 'price') {
          flat[key] = val; // Keep numbers as numbers for Excel calcs
        } else if (typeof val === 'object' && val !== null) {
          flat[key] = JSON.stringify(val);
        } else {
          flat[key] = val;
        }
      });
      return flat;
    });

    const ws = XLSX.utils.json_to_sheet(transformed);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  if (format === 'csv') {
    XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' });
  } else {
    XLSX.writeFile(wb, `${filename}.xlsx`, { bookType: 'xlsx' });
  }
}

/**
 * Parses an uploaded Excel or CSV file into JSON.
 */
export async function parseImportFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generates a sample template for import.
 */
export function downloadTemplate(type: 'Leads' | 'Customers' | 'Deals') {
  let sampleData = [];
  if (type === 'Leads') {
    sampleData = [{
      'Name': 'Arjun Sharma',
      'Company': 'Sharma Exports',
      'Email': 'arjun@sharma.com',
      'Phone': '9876543210',
      'City': 'Mumbai',
      'Value': 50000,
      'Status': 'New',
      'Source': 'Referral',
      'Notes': 'Interested in bulk orders.'
    }];
  } else if (type === 'Customers') {
    sampleData = [{
      'Name': 'Sneha Patil',
      'Company': 'Patil Organics',
      'Email': 'sneha@patil.in',
      'Phone': '9123456789',
      'City': 'Pune',
      'Loyalty Status': 'VIP',
      'Total Revenue': 150000,
      'Preferred Language': 'Hindi'
    }];
  } else {
    sampleData = [{
      'Title': 'Q1 Server Upgrade',
      'Customer Name': 'Global Corp',
      'Value': 200000,
      'Stage': 'Discovery',
      'Priority': 'High',
      'Expected Close Date': '2024-12-31'
    }];
  }

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, `SimpleCRM_${type}_Template.xlsx`);
}
