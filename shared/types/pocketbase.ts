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
	Items: "items",
	Lists: "lists",
	Members: "members",
	Notes: "notes",
	Participantlists: "participantlists",
	Ranks: "ranks",
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

export const ItemsStatusOptions = {
	"none": "none",
	"damaged": "damaged",
	"repair": "repair",
	"checkedOut": "checkedOut",
} as const
export type ItemsStatusOptions = typeof ItemsStatusOptions[keyof typeof ItemsStatusOptions]
export type ItemsRecord = {
	checkout?: string
	created: IsoAutoDateString
	description?: HTMLString
	id: string
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
	items?: RecordIdString[]
	name?: string
	updated: IsoAutoDateString
	updatedBy?: RecordIdString
}

export type MembersRecord = {
	birthdate?: string
	city?: string
	created: IsoAutoDateString
	dataUsageConsent?: boolean
	email?: string
	firstName?: string
	gender?: string
	groupName?: string
	groupNumber?: number
	id: string
	joinDate?: string
	lastName?: string
	lists?: RecordIdString[]
	magazineDelivery?: boolean
	memberNumber?: number
	membershipType?: string
	nationality?: string
	paidLists?: RecordIdString[]
	parentEmail?: string
	phone1?: string
	phone2?: string
	phone3?: string
	postalCode?: number
	ranks?: RecordIdString[]
	status?: string
	street?: string
	updated: IsoAutoDateString
}

export type NotesRecord = {
	content?: HTMLString
	created: IsoAutoDateString
	event?: RecordIdString
	id: string
	name?: string
	updated: IsoAutoDateString
}

export type ParticipantlistsRecord = {
	created: IsoAutoDateString
	event?: RecordIdString
	id: string
	name?: string
	participants?: RecordIdString[]
	updated: IsoAutoDateString
}

export type RanksRecord = {
	colour?: string
	created: IsoAutoDateString
	id: string
	name?: string
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
	ranks?: RecordIdString[]
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
export type ItemsResponse<Texpand = unknown> = Required<ItemsRecord> & BaseSystemFields<Texpand>
export type ListsResponse<Texpand = unknown> = Required<ListsRecord> & BaseSystemFields<Texpand>
export type MembersResponse<Texpand = unknown> = Required<MembersRecord> & BaseSystemFields<Texpand>
export type NotesResponse<Texpand = unknown> = Required<NotesRecord> & BaseSystemFields<Texpand>
export type ParticipantlistsResponse<Texpand = unknown> = Required<ParticipantlistsRecord> & BaseSystemFields<Texpand>
export type RanksResponse<Texpand = unknown> = Required<RanksRecord> & BaseSystemFields<Texpand>
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
	items: ItemsRecord
	lists: ListsRecord
	members: MembersRecord
	notes: NotesRecord
	participantlists: ParticipantlistsRecord
	ranks: RanksRecord
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
	items: ItemsResponse
	lists: ListsResponse
	members: MembersResponse
	notes: NotesResponse
	participantlists: ParticipantlistsResponse
	ranks: RanksResponse
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
