import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ProductsService } from '../modules/products/products.service';
import { ProductCategory } from '../modules/products/entities/product.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);

  const sampleProducts = [
    {
      name: 'dulces randoms',
      description: 'sadasdsa',
      price: 5.50,
      category: ProductCategory.DULCES,
      stock: 20,
    }
  ];

  console.log('seedings de productos cargado');

  for (const productData of sampleProducts) {
    try {
      const product = await productsService.create(productData);
      console.log(`producto creado: ${product.name}`);
    } catch (error) {
      console.error(`error creando producto ${productData.name}:`, error.message);
    }
  }

  console.log('seeding completado');
  await app.close();
}

seed().catch((error) => {
  console.error('error durante el seeding:', error);
  process.exit(1);
});
