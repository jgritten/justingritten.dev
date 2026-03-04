/** Matches the ProductDto from the .NET API */
export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stockQuantity: number
  category: string | null
  imageUrl: string | null
  isActive: boolean
}
