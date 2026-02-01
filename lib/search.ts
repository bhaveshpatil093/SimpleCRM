
import { Lead, Customer, Deal } from '../types';

export interface SearchResult {
  id: string;
  type: 'Lead' | 'Customer' | 'Deal' | 'Command';
  title: string;
  subtitle: string;
  meta?: string;
  handler?: () => void;
}

/**
 * Basic fuzzy matching helper
 */
function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q)) return true;
  
  // Simple distance-like check for small typos
  let queryIdx = 0;
  for (let i = 0; i < t.length && queryIdx < q.length; i++) {
    if (t[i] === q[queryIdx]) queryIdx++;
  }
  return queryIdx === q.length;
}

export function globalSearch(
  query: string,
  leads: Lead[],
  customers: Customer[],
  deals: Deal[],
  commands: SearchResult[] = []
): { leads: SearchResult[], customers: SearchResult[], deals: SearchResult[], commands: SearchResult[] } {
  if (!query || query.length < 2) return { leads: [], customers: [], deals: [], commands: [] };

  const cleanQuery = query.trim().replace('+91', '');

  const matchedLeads = leads
    .filter(l => 
      fuzzyMatch(l.name, cleanQuery) || 
      fuzzyMatch(l.company, cleanQuery) || 
      l.phone.includes(cleanQuery) ||
      fuzzyMatch(l.email, cleanQuery) ||
      fuzzyMatch(l.city, cleanQuery)
    )
    .slice(0, 5)
    .map(l => ({
      id: l.id,
      type: 'Lead' as const,
      title: l.name,
      subtitle: l.company,
      meta: l.status
    }));

  const matchedCustomers = customers
    .filter(c => 
      fuzzyMatch(c.name, cleanQuery) || 
      fuzzyMatch(c.company, cleanQuery) || 
      c.phone.includes(cleanQuery)
    )
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      type: 'Customer' as const,
      title: c.name,
      subtitle: c.company,
      meta: c.loyaltyStatus
    }));

  const matchedDeals = deals
    .filter(d => 
      fuzzyMatch(d.title, cleanQuery) || 
      fuzzyMatch(d.customerName, cleanQuery)
    )
    .slice(0, 5)
    .map(d => ({
      id: d.id,
      type: 'Deal' as const,
      title: d.title,
      subtitle: d.customerName,
      meta: `₹${(d.value / 100000).toFixed(1)}L`
    }));

  const matchedCommands = commands
    .filter(c => fuzzyMatch(c.title, cleanQuery) || fuzzyMatch(c.subtitle, cleanQuery))
    .slice(0, 5);

  return { leads: matchedLeads, customers: matchedCustomers, deals: matchedDeals, commands: matchedCommands };
}
