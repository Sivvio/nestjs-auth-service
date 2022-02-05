import {Module} from '@nestjs/common';
import {ConfigService} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AppModule} from "./app.module";

@Module({
    imports: [
        AppModule,
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => config.get('database')
        }),
    ]
})
export class MainModule {
}
