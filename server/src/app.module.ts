import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchModule } from './search/search.module';
import { SitesModule } from './sites/sites.module';
import { UsersModule } from './users/users.module';
import { VisitsModule } from './visits/visits.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGO_URI'),
      }),
    }),
    UsersModule,
    SitesModule,
    SearchModule,
    VisitsModule,
  ],
})
export class AppModule {}
