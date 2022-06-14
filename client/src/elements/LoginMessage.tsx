import { useEffect, useState } from 'react';
import { Message, Icon } from 'semantic-ui-react';
import { SEMANTIC_ICON_LOADING } from '../globals/constants';

export enum ELoginStatus {
	NoStatus,
	Timeout,
	UndefinedIssue,
	LoginSuccess,
	BeforeLogin,
	StateCheckFailure,
	NoCodeReceived,
	LoginDenied,
	UserNotFound,
}

interface IMessageProps {
	status?: ELoginStatus;
	className?: string;
	attached?: boolean | 'bottom' | 'top' | undefined;
}

export function LoginMessage( props: IMessageProps ): JSX.Element {
	const [ LoginMessage, setLoginMessage ] = useState<JSX.Element>( <></> );

	useEffect( () => {
		switch ( props.status ) {
			case ELoginStatus.UndefinedIssue:
				setLoginMessage(
					<Message className={props.className} attached={props.attached} size="small" warning>
						<Icon name="question" loading />
						<Message.Content>
							<br />
							<Message.Header>Ooops ! Un prolème inconnu est survenu.</Message.Header>
							<br />
							<p>Veuillez réassayer dans quelques instants.</p>
							<p>Si le problème persiste, n'hésitez pas à nous contacter.</p>
						</Message.Content>
					</Message>
				);
				break;

			case ELoginStatus.Timeout:
				setLoginMessage(
					<Message className={props.className} attached={props.attached} size="small" warning>
						<Message.Content>
							<br />
							<Message.Header>Délai dépassé...</Message.Header>
							<br />
							<p>Le serveur ne réponds pas. Veuillez réassayer dans quelques instants.</p>
						</Message.Content>
					</Message>
				);
				break;

			case ELoginStatus.BeforeLogin:
				setLoginMessage(
					<Message className={props.className} attached={props.attached} size="small">
						<Icon name={SEMANTIC_ICON_LOADING} loading />
						<Message.Content>
							<Message.Header>Un instant...</Message.Header>
							{/* <p>Nous vérifions actuellement vos identifiants.</p> */}
						</Message.Content>
					</Message>
				);
				break;

			case ELoginStatus.StateCheckFailure:
				setLoginMessage(
					<Message className={props.className} attached={props.attached} size="small" negative>
						<Message.Header>Connexion interrompue.</Message.Header>
						<br />
						<p>
							Nous n'avons pas été en mesure de vérifier l'authenticité de la requête reçue. Quelqu'un ou quelque chose à pu interferer durant la connexion. Vous devriez changer de
							réseau et réessayer.
						</p>
					</Message>
				);
				break;

			case ELoginStatus.NoCodeReceived:
				setLoginMessage(
					<Message className={props.className} attached={props.attached} size="small" negative>
						<Message.Header>Connexion interrompue.</Message.Header>
						<br />
						<p>Aucun code d'authentification n'a été reçu. Quelqu'un ou quelque chose à pu interferer durant la connexion. Vous devriez changer de réseau et réessayer.</p>
					</Message>
				);
				break;

			case ELoginStatus.LoginDenied:
				setLoginMessage(
					<Message className={props.className} attached={props.attached} size="small" negative>
						<Message.Header>Connexion refusée.</Message.Header>
						<br />
						<p>Il semblerait que vous n'avez pas les autorisations nécéssaires.</p>
						<p>Essayez de vous reconnecter.</p>
						<p>Si le problème persiste, vous pouvez nous contacter.</p>
					</Message>
				);
				break;

			case ELoginStatus.LoginSuccess:
				setLoginMessage(
					<Message attached="bottom" size="small" positive>
						<Message.Header>Connexion réussie !</Message.Header>
						<br />
						<p>Vous allez être redirigé au plus vite.</p>
					</Message>
				);
				break;

			case ELoginStatus.UserNotFound:
				setLoginMessage(
					<Message className={props.className} attached={props.attached} size="small" warning>
						<Message.Header>Utilisateur inconnu...</Message.Header>
						<br />
						<p>Impossible de trouver l'utilisateur demandé.</p>
					</Message>
				);
				break;

			default:
				setLoginMessage( <></> );
		}
	}, [ props.status ] );

	return LoginMessage;
}
