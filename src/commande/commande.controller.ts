/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
  Query,
} from '@nestjs/common';
import { CommandeService } from './commande.service';
import { CreateCommandeDto } from './dto/create-commande.dto';
// import { UpdateCommandeDto } from './dto/update-commande.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Request } from 'express';
import { Users } from 'src/entities/users.entity';
import { UpdateCommandeDto } from './dto/update-commande.dto';
import { FilterCommandeDto } from './dto/FilterCommandDto';

@Controller('commande')
export class CommandeController {
  constructor(private readonly commandeService: CommandeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCommandeDto: CreateCommandeDto, @Req() req: Request) {
    const user = req.user as Users;
    return this.commandeService.create(createCommandeDto, user);
  }

  @Get()
  findAll() {
    return this.commandeService.findAll();
  }

  @Get('filter')
  async filterCommandes(@Query() filterDto: FilterCommandeDto) {
    return this.commandeService.getFilteredCommandes(filterDto);
  }

  @Get('latest')
  async getLatest() {
    return await this.commandeService.getLatest();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommandeDto: UpdateCommandeDto,
  ) {
    console.log('🚀 ~ CommandeController ~ id:', id);

    return this.commandeService.update(id, updateCommandeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commandeService.remove(+id);
  }
}
