import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * PetsController — API Gateway
 *
 * Traduce las peticiones HTTP del frontend en mensajes TCP hacia el
 * product-service. Inyecta el `actor` (userId + role) extraído del JWT
 * en cada payload, nunca lo recibe del cliente.
 */
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  // ─── Mascotas ─────────────────────────────────────────────────────────────

  @Get()
  findAll(@Request() req, @Query('search') search?: string) {
    return this.productClient.send('pet.findAll', {
      actor: req.user,
      search,
    });
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.productClient.send('pet.findOne', {
      actor: req.user,
      id,
    });
  }

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.productClient.send('pet.create', {
      actor: req.user,
      data,
    });
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.productClient.send('pet.update', {
      actor: req.user,
      id,
      data,
    });
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.productClient.send('pet.remove', {
      actor: req.user,
      id,
    });
  }

  // ─── Vacunas ──────────────────────────────────────────────────────────────

  @Get(':petId/vaccines')
  findVaccines(@Request() req, @Param('petId') petId: string) {
    return this.productClient.send('pet.vaccine.findAll', {
      actor: req.user,
      petId,
    });
  }

  @Post(':petId/vaccines')
  createVaccine(@Request() req, @Param('petId') petId: string, @Body() data: any) {
    return this.productClient.send('pet.vaccine.create', {
      actor: req.user,
      petId,
      data,
    });
  }

  // ─── Cirugías ─────────────────────────────────────────────────────────────

  @Get(':petId/surgeries')
  findSurgeries(@Request() req, @Param('petId') petId: string) {
    return this.productClient.send('pet.surgery.findAll', {
      actor: req.user,
      petId,
    });
  }

  @Post(':petId/surgeries')
  createSurgery(@Request() req, @Param('petId') petId: string, @Body() data: any) {
    return this.productClient.send('pet.surgery.create', {
      actor: req.user,
      petId,
      data,
    });
  }

  // ─── Diagnósticos ─────────────────────────────────────────────────────────

  @Get(':petId/diagnoses')
  findDiagnoses(@Request() req, @Param('petId') petId: string) {
    return this.productClient.send('pet.diagnosis.findAll', {
      actor: req.user,
      petId,
    });
  }

  @Post(':petId/diagnoses')
  createDiagnosis(@Request() req, @Param('petId') petId: string, @Body() data: any) {
    return this.productClient.send('pet.diagnosis.create', {
      actor: req.user,
      petId,
      data,
    });
  }
}
