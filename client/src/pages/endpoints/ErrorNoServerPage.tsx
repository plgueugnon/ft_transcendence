import Buttons from '../../components/buttons';

import Containers from '../../components/containers';
import { ELoginStatus, LoginMessage } from '../../elements/LoginMessage';

export function ErrorNoServerPage(): JSX.Element {
	//? RENDER
	return (
		<Containers.NoScroll>
			<Containers.Page>
				<Buttons.ReturnHref href="/" />

				<Containers.Centered>
					<LoginMessage status={ELoginStatus.UndefinedIssue} />
					{/* DEV MESSAGE */}
					<cite>En phase de dev ce problème survient lorsque le serveur est rebuild. </cite>
					<cite>Vous pouvez essayer de vous reconnecter.</cite>
					<br />
				</Containers.Centered>
			</Containers.Page>
		</Containers.NoScroll>
	);
}
