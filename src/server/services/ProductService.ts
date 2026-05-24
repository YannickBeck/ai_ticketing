import { ApiError } from "@/server/api/http";
import { mockProducts } from "@/server/db/mockData";

export class ProductService {
  async listProducerProducts(producerId: string) {
    return mockProducts.filter((product) => product.producerId === producerId);
  }

  async getProduct(productId: string) {
    const product = mockProducts.find((item) => item.id === productId);

    if (!product) {
      throw new ApiError("NOT_FOUND", "Produkt wurde nicht gefunden.", 404);
    }

    return product;
  }
}

export const productService = new ProductService();
