export interface IChannelUsers {
	role: string;
	userLogin: string;
	// * String TimeStamp -> ban until date, if null -> not banned.
	bannedUntil: string;
	// * String TimeStamp -> muted until date, if null -> not muted.
	mutedUntil: string;
}
