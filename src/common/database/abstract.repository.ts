// import {
//   Repository,
//   EntityTarget,
//   DeepPartial,
//   FindOneOptions,
//   FindManyOptions,
// } from 'typeorm';
// import { NotFoundException, Logger } from '@nestjs/common';

// export abstract class AbstractRepository<T> {
//   protected abstract readonly logger: Logger;

//   constructor(protected readonly repository: Repository<T>) {}

//   async create(entity: DeepPartial<T>): Promise<T> {
//     const newEntity = this.repository.create(entity);
//     return this.repository.save(newEntity);
//   }

//   async findOne(options: FindOneOptions<T>): Promise<T> {
//     const entity = await this.repository.findOne(options);
//     if (!entity) {
//       this.logger.warn('Entity not found with given options!', options);
//       throw new NotFoundException('Entity not found!');
//     }
//     return entity;
//   }

//   async findAll(options?: FindManyOptions<T>): Promise<T[]> {
//     return this.repository.find(options);
//   }

//   async update(id: number, updateData: DeepPartial<T>): Promise<T> {
//     await this.repository.update(id, updateData);
//     const updatedEntity = await this.repository.findOne({
//       where: { id } as any,
//     });
//     if (!updatedEntity) {
//       this.logger.warn(`Entity with ID ${id} not found for update!`);
//       throw new NotFoundException('Entity not found!');
//     }
//     return updatedEntity;
//   }

//   async delete(id: number): Promise<void> {
//     const entity = await this.repository.findOne({ where: { id } as any });
//     if (!entity) {
//       this.logger.warn(`Entity with ID ${id} not found for deletion!`);
//       throw new NotFoundException('Entity not found!');
//     }
//     await this.repository.remove(entity);
//   }
// }
