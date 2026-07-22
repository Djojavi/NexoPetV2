import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Hace que PrismaService esté disponible para quienes importen este módulo
})
export class PrismaModule {}