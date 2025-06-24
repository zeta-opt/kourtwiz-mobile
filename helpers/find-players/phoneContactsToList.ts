type SimplifiedContact = {
  contactName: string;
  contactPhoneNumber: string;
};

export function simplifyContacts(contacts: any): SimplifiedContact[] {
  const result: SimplifiedContact[] = [];
  const seen = new Set<string>();

  function normalizePhoneNumber(number: string): string {
    return number
      .replace(/[^\d+]/g, '') // remove spaces, dashes etc.
      .replace(/^(\+91|91|0)?/, '+91') // assume +91 if missing or 0/91
      .trim();
  }

  try {
    contacts.forEach((contact: any) => {
      const fullName =
        `${contact?.firstName ?? ''} ${contact?.lastName ?? ''}`.trim() ||
        contact?.name ||
        'Unknown';

      if (Array.isArray(contact.phoneNumbers)) {
        contact.phoneNumbers.forEach((phone: any) => {
          let number = phone?.number?.trim();
          if (!number) return;

          const normalized = normalizePhoneNumber(number);
          const key = `${fullName}_${normalized}`;
          if (seen.has(key)) return;

          seen.add(key);
          result.push({
            contactName: fullName,
            contactPhoneNumber: normalized,
          });
        });
      }
    });
  } catch (err) {
    console.error('Error simplifying contacts:', err);
  }

  return result;
}
