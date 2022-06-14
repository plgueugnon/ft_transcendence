export interface ILoginSuccess {
	login: string;
	userCreation: boolean;
	twoFa: boolean;
	apiToken: string;
	expirationDate: Date;
}
