import { Button } from '@radix-ui/themes'
import { useProducts } from '@/hooks'
import type { Product } from '@/types'
import './ProductList.css'

function ProductItem({ product }: { product: Product }) {
  return (
    <li className="product-item">
      <div className="product-item__main">
        <span className="product-item__name">{product.name}</span>
        {product.category && (
          <span className="product-item__category">{product.category}</span>
        )}
      </div>
      <div className="product-item__meta">
        <span className="product-item__price">
          ${product.price.toFixed(2)}
        </span>
        <span className="product-item__stock">
          {product.stockQuantity} in stock
        </span>
      </div>
      {product.description && (
        <p className="product-item__description">{product.description}</p>
      )}
    </li>
  )
}

export function ProductList() {
  const { products, isLoading, error, refetch } = useProducts()

  if (isLoading) {
    return (
      <div className="product-list product-list--loading">
        Loading products…
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-list product-list--error">
        <p>Failed to load products: {error.message}</p>
        <Button type="button" onClick={refetch}>
          Retry
        </Button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="product-list product-list--empty">
        No products found.
      </div>
    )
  }

  return (
    <div className="product-list">
      <ul className="product-list__list">
        {products.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </ul>
    </div>
  )
}
