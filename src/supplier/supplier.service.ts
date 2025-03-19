/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from 'src/entities/supplier.entity';
import { StockMovementService } from 'src/stock-movement/stock-movement.service';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly stockMovementService: StockMovementService,
  ) {}

  // Create a new supplier
  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  // Find all suppliers
  async findAll(): Promise<Supplier[]> {
    return await this.supplierRepository.find({
      relations: ['orders', 'stockMovements'], // Including relations for related entities
    });
  }

  // Find a supplier by ID
  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ['orders', 'stockMovements'],
    });

    if (!supplier) {
      throw new Error(`Supplier with id ${id} not found`);
    }

    return supplier;
  }

  // Update a supplier by ID
  async update(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.findOne(id); // Find the supplier first

    if (!supplier) {
      throw new Error(`Supplier with id ${id} not found`);
    }

    // Update supplier properties
    Object.assign(supplier, updateSupplierDto);

    return await this.supplierRepository.save(supplier);
  }

  // Remove a supplier by ID
  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id); // Find the supplier first

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    await this.supplierRepository.remove(supplier);
  }
}
