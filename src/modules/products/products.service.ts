import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      where: { available: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async findByCategory(category: ProductCategory): Promise<Product[]> {
    return await this.productRepository.find({
      where: { category, available: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { id },
    });
  }

  async updateStock(id: number, quantity: number): Promise<Product | null> {
    const product = await this.findOne(id);
    if (product) {
      product.stock = Math.max(0, product.stock - quantity);
      return await this.productRepository.save(product);
    }
    return null;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.available = :available', { available: true })
      .andWhere(
        '(product.name LIKE :query OR product.description LIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('product.name', 'ASC')
      .getMany();
  }
}
