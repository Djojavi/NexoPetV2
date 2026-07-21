import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';
import { ClinicalService } from './clinical.service';

@Module({
  controllers: [PetsController],
  providers: [PetsService, ClinicalService],
})
export class PetsModule {}
