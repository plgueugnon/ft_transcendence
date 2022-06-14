import Buttons from '../../components/buttons';

import Containers from '../../components/containers';
import { ELoginStatus, LoginMessage } from '../../elements/LoginMessage';

export function ErrorUnauthorizedPage(): JSX.Element {
	return (
		<Containers.NoScroll>
			<Containers.Page>
				<Buttons.ReturnHref href="/" />

				<Containers.Centered>
					<LoginMessage status={ELoginStatus.LoginDenied} />
				</Containers.Centered>
			</Containers.Page>
		</Containers.NoScroll>
	);
}
