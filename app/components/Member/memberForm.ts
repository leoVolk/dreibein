export type MemberFormState = {
  firstName: string;
  lastName: string;
  gender: string;
  birthdate: string;
  email: string;
  parentEmail: string;
  phone1: string;
  phone2: string;
  phone3: string;
  street: string;
  postalCode: number | null;
  city: string;
  nationality: string;
  memberNumber: number | null;
  membershipType: string;
  status: string;
  joinDate: string;
  groupName: string;
  groupNumber: number | null;
  dataUsageConsent: boolean;
  magazineDelivery: boolean;
  ranks: string[];
};

export const emptyMemberForm = (): MemberFormState => ({
  firstName: "",
  lastName: "",
  gender: "",
  birthdate: "",
  email: "",
  parentEmail: "",
  phone1: "",
  phone2: "",
  phone3: "",
  street: "",
  postalCode: null,
  city: "",
  nationality: "",
  memberNumber: null,
  membershipType: "",
  status: "",
  joinDate: "",
  groupName: "",
  groupNumber: null,
  dataUsageConsent: false,
  magazineDelivery: false,
  ranks: [],
});

export const memberFormFrom = (m: Record<string, any>): MemberFormState => ({
  firstName: m.firstName ?? "",
  lastName: m.lastName ?? "",
  gender: m.gender ?? "",
  birthdate: m.birthdate ?? "",
  email: m.email ?? "",
  parentEmail: m.parentEmail ?? "",
  phone1: m.phone1 ?? "",
  phone2: m.phone2 ?? "",
  phone3: m.phone3 ?? "",
  street: m.street ?? "",
  postalCode: m.postalCode ?? null,
  city: m.city ?? "",
  nationality: m.nationality ?? "",
  memberNumber: m.memberNumber ?? null,
  membershipType: m.membershipType ?? "",
  status: m.status ?? "",
  joinDate: m.joinDate ?? "",
  groupName: m.groupName ?? "",
  groupNumber: m.groupNumber ?? null,
  dataUsageConsent: !!m.dataUsageConsent,
  magazineDelivery: !!m.magazineDelivery,
  ranks: Array.isArray(m.ranks) ? [...m.ranks] : [],
});
