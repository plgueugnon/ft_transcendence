import { NestFactory } from '@nestjs/core';
// import { IoAdapter } from '@nestjs/platform-socket.io'; // adapter pour socket.io
import { AppModule } from './app.module';

const _port = process.env.EXPOSE_PORT || 5001;

async function bootstrap() {
	const app = await NestFactory.create( AppModule );
	// app.useWebSocketAdapter(new IoAdapter(app));
	app.enableCors();

	await app.listen( _port );
}
bootstrap();
