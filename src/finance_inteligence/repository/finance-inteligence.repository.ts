import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanceInteligenceEntity } from '../entity/finance-inteligence.entity';

@Injectable()
export class FinanceInteligenceRepository {
  constructor(
    @InjectRepository(FinanceInteligenceEntity)
    private readonly repo: Repository<FinanceInteligenceEntity>,
  ) {}

  public async create(data: Partial<FinanceInteligenceEntity>): Promise<FinanceInteligenceEntity> {
    const newRecord = this.repo.create(data);
    return this.repo.save(newRecord);
  }

  public async findAll(): Promise<FinanceInteligenceEntity[]> {
    return this.repo.find();
  }

  public async findOne(id: string): Promise<FinanceInteligenceEntity | null> {
    return this.repo.findOneBy({ id });
  }

  public async findOneByTicker(ticker: string): Promise<FinanceInteligenceEntity | null> {
    return this.repo.findOneBy({ ticker: ticker.toUpperCase() });
  }

  public async update(id: string, data: Partial<FinanceInteligenceEntity>): Promise<FinanceInteligenceEntity> {
    await this.repo.update(id, data);
    return this.repo.findOneByOrFail({ id });
  }

  public async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
