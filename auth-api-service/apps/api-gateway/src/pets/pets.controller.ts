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
import { rpcCatch } from '../common/rpc-catch';

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
    return this.productClient
      .send('pet.findAll', {
        actor: req.user,
        search,
      })
      .pipe(rpcCatch());
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.productClient
      .send('pet.findOne', {
        actor: req.user,
        id,
      })
      .pipe(rpcCatch());
  }

  @Post()
  create(@Request() req, @Body() data: any) {
    return this.productClient
      .send('pet.create', {
        actor: req.user,
        data,
      })
      .pipe(rpcCatch());
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() data: any) {
    return this.productClient
      .send('pet.update', {
        actor: req.user,
        id,
        data,
      })
      .pipe(rpcCatch());
  }

  // Reasignar el dueño de una mascota. Solo ADMIN (lo valida product-service).
  @Patch(':id/owner')
  reassignOwner(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { ownerId: string },
  ) {
    return this.productClient
      .send('pet.reassignOwner', {
        actor: req.user,
        id,
        ownerId: body?.ownerId,
      })
      .pipe(rpcCatch());
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.productClient
      .send('pet.remove', {
        actor: req.user,
        id,
      })
      .pipe(rpcCatch());
  }

  // ─── Vacunas ──────────────────────────────────────────────────────────────

  @Get(':petId/vaccines')
  findVaccines(@Request() req, @Param('petId') petId: string) {
    return this.productClient
      .send('pet.vaccine.findAll', {
        actor: req.user,
        petId,
      })
      .pipe(rpcCatch());
  }

  @Post(':petId/vaccines')
  createVaccine(@Request() req, @Param('petId') petId: string, @Body() data: any) {
    return this.productClient
      .send('pet.vaccine.create', {
        actor: req.user,
        petId,
        data,
      })
      .pipe(rpcCatch());
  }

  // ─── Cirugías ─────────────────────────────────────────────────────────────

  @Get(':petId/surgeries')
  findSurgeries(@Request() req, @Param('petId') petId: string) {
    return this.productClient
      .send('pet.surgery.findAll', {
        actor: req.user,
        petId,
      })
      .pipe(rpcCatch());
  }

  @Post(':petId/surgeries')
  createSurgery(@Request() req, @Param('petId') petId: string, @Body() data: any) {
    return this.productClient
      .send('pet.surgery.create', {
        actor: req.user,
        petId,
        data,
      })
      .pipe(rpcCatch());
  }

  // ─── Diagnósticos ─────────────────────────────────────────────────────────

  @Get(':petId/diagnoses')
  findDiagnoses(@Request() req, @Param('petId') petId: string) {
    return this.productClient
      .send('pet.diagnosis.findAll', {
        actor: req.user,
        petId,
      })
      .pipe(rpcCatch());
  }

  @Post(':petId/diagnoses')
  createDiagnosis(@Request() req, @Param('petId') petId: string, @Body() data: any) {
    return this.productClient
      .send('pet.diagnosis.create', {
        actor: req.user,
        petId,
        data,
      })
      .pipe(rpcCatch());
  }
}
