type SimplifiedContact = {
  contactName: string;
  contactPhoneNumber: string;
};

export function simplifyContacts(contacts: any): SimplifiedContact[] {
  const result: SimplifiedContact[] = [];

  contacts.forEach((contact: any) => {
    const fullName = `${contact.firstName} ${contact.lastName}`.trim();

    contact.phoneNumbers.forEach((phone: any) => {
      result.push({
        contactName: fullName,
        contactPhoneNumber: phone.number || '',
      });
    });
  });

  return result;
}
