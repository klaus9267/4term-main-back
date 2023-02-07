import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http-exception-filter';
import { ReturnInterceptor } from './common/interceptor/return-interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalInterceptors(new ReturnInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter()); // 전역 필터 적용

  const port = process.env.PORT;

  const config = new DocumentBuilder()
    .setTitle('4term project API')
    .setVersion('0.0.1')
    .addBearerAuth({ in: 'header', type: 'http' })
    .build();

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('채팅 소켓 API')
    .setDescription('모던애자일 4기 소켓 통신 API')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .build();

  const asyncapiDocument = await AsyncApiModule.createDocument(
    app,
    asyncApiOptions,
  );
  await AsyncApiModule.setup('asyncapi', app, asyncapiDocument);

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);
  Logger.debug(`서버 가동 port : ${port}`);
}
bootstrap();
