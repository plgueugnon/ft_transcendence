import Buttons from '../../components/buttons';

import Containers from '../../components/containers';
import Text from '../../components/text';

export function ErrorNotFoundPage(): JSX.Element {
	return (
		<Containers.NoScroll>
			<Containers.Page>
				<Buttons.ReturnHref href="/" />

				<Containers.Centered>
					<Text.PageTitle>404 Not Found</Text.PageTitle>
					<Text.FormSubtitle>La page demandée est introuvable</Text.FormSubtitle>
				</Containers.Centered>
			</Containers.Page>
		</Containers.NoScroll>
	);
}
