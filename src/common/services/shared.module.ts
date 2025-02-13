import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../constants/jwtConstants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class SharedModule {}
