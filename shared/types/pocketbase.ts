/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	Eventlists: "eventlists",
	Events: "events",
	Invites: "invites",
	Invoices: "invoices",
	Itemcategories: "itemcategories",
	Items: "items",
	Lists: "lists",
	Notes: "notes",
	Participants: "participants",
	Settings: "settings",
	Shoppinglists: "shoppinglists",
	Users: "users",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export type EventlistsRecord = {
	created: IsoAutoDateString
	createdBy?: RecordIdString
	event?: RecordIdString
	id: string
	items?: RecordIdString[]
	name?: string
	updated: IsoAutoDateString
	updatedBy?: RecordIdString
}

export type EventsRecord<TdaysOfWeek = unknown> = {
	created: IsoAutoDateString
	createdBy?: RecordIdString
	daysOfWeek?: null | TdaysOfWeek
	description?: string
	endDate?: IsoDateString
	id: string
	name?: string
	startDate?: IsoDateString
	updated: IsoAutoDateString
	updatedBy?: RecordIdString
}

export type InvitesRecord = {
	created: IsoAutoDateString
	email?: string
	id: string
	updated: IsoAutoDateString
}

export const InvoicesPaidViaOptions = {
	"User": "User",
	"Lagerkarte": "Lagerkarte",
	"Stammeskarte": "Stammeskarte",
} as const
export type InvoicesPaidViaOptions = typeof InvoicesPaidViaOptions[keyof typeof InvoicesPaidViaOptions]

export const InvoicesCategoryOptions = {
	"Material": "Material",
	"Versicherung": "Versicherung",
	"Lebensmittel": "Lebensmittel",
	"Unterkunft": "Unterkunft",
} as const
export type InvoicesCategoryOptions = typeof InvoicesCategoryOptions[keyof typeof InvoicesCategoryOptions]
export type InvoicesRecord = {
	category?: InvoicesCategoryOptions
	created: IsoAutoDateString
	event?: RecordIdString
	file?: FileNameString
	id: string
	name?: string
	paidAt?: IsoDateString
	paidBy?: RecordIdString
	paidVia?: InvoicesPaidViaOptions
	updated: IsoAutoDateString
	value?: number
}

export type ItemcategoriesRecord = {
	created: IsoAutoDateString
	id: string
	name?: string
	updated: IsoAutoDateString
}

export const ItemsStatusOptions = {
	"none": "none",
	"damaged": "damaged",
	"repair": "repair",
	"checkedOut": "checkedOut",
	"mildDamage": "mildDamage",
} as const
export type ItemsStatusOptions = typeof ItemsStatusOptions[keyof typeof ItemsStatusOptions]
export type ItemsRecord = {
	category?: RecordIdString
	checkout?: string
	created: IsoAutoDateString
	description?: HTMLString
	eventlists?: RecordIdString[]
	id: string
	list?: RecordIdString
	name?: string
	parent?: RecordIdString
	quantity?: number
	status?: ItemsStatusOptions
	updated: IsoAutoDateString
	weight?: number
}

export type ListsRecord = {
	created: IsoAutoDateString
	createdBy?: RecordIdString
	id: string
	name?: string
	updated: IsoAutoDateString
	updatedBy?: RecordIdString
}

export type NotesRecord = {
	content?: HTMLString
	created: IsoAutoDateString
	event?: RecordIdString
	id: string
	name?: string
	updated: IsoAutoDateString
}

export type ParticipantsRecord = {
	age?: number
	city?: string
	created: IsoAutoDateString
	email?: string
	emailGuardian?: string
	event?: RecordIdString
	firstname?: string
	id: string
	isLeader?: boolean
	lastname?: string
	mobile?: string
	notes?: string
	paid?: boolean
	phone?: string
	phoneGuardian?: string
	rank?: string
	street?: string
	updated: IsoAutoDateString
	zip?: number
}

export type SettingsRecord = {
	created: IsoAutoDateString
	id: string
	integration?: string
	namiGroupId?: number
	namiPassword?: string
	namiUsername?: string
	updated: IsoAutoDateString
}

export type ShoppinglistsRecord = {
	created: IsoAutoDateString
	event?: RecordIdString
	id: string
	items?: RecordIdString[]
	name?: string
	updated: IsoAutoDateString
}

export type UsersRecord = {
	admin?: boolean
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type EventlistsResponse<Texpand = unknown> = Required<EventlistsRecord> & BaseSystemFields<Texpand>
export type EventsResponse<TdaysOfWeek = unknown, Texpand = unknown> = Required<EventsRecord<TdaysOfWeek>> & BaseSystemFields<Texpand>
export type InvitesResponse<Texpand = unknown> = Required<InvitesRecord> & BaseSystemFields<Texpand>
export type InvoicesResponse<Texpand = unknown> = Required<InvoicesRecord> & BaseSystemFields<Texpand>
export type ItemcategoriesResponse<Texpand = unknown> = Required<ItemcategoriesRecord> & BaseSystemFields<Texpand>
export type ItemsResponse<Texpand = unknown> = Required<ItemsRecord> & BaseSystemFields<Texpand>
export type ListsResponse<Texpand = unknown> = Required<ListsRecord> & BaseSystemFields<Texpand>
export type NotesResponse<Texpand = unknown> = Required<NotesRecord> & BaseSystemFields<Texpand>
export type ParticipantsResponse<Texpand = unknown> = Required<ParticipantsRecord> & BaseSystemFields<Texpand>
export type SettingsResponse<Texpand = unknown> = Required<SettingsRecord> & BaseSystemFields<Texpand>
export type ShoppinglistsResponse<Texpand = unknown> = Required<ShoppinglistsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	eventlists: EventlistsRecord
	events: EventsRecord
	invites: InvitesRecord
	invoices: InvoicesRecord
	itemcategories: ItemcategoriesRecord
	items: ItemsRecord
	lists: ListsRecord
	notes: NotesRecord
	participants: ParticipantsRecord
	settings: SettingsRecord
	shoppinglists: ShoppinglistsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	eventlists: EventlistsResponse
	events: EventsResponse
	invites: InvitesResponse
	invoices: InvoicesResponse
	itemcategories: ItemcategoriesResponse
	items: ItemsResponse
	lists: ListsResponse
	notes: NotesResponse
	participants: ParticipantsResponse
	settings: SettingsResponse
	shoppinglists: ShoppinglistsResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
