import { ProductEditor } from "@/components/admin/product-editor";
import { repo } from "@/lib/db";

export const metadata = { title: "Menu" };

export default async function MenuAdmin() {
  const products = await repo.getProducts();
  return (
    <div>
      <h1 className="text-4xl">Menu</h1>
      <p className="mt-2 text-cocoa-soft">
        Change prices and descriptions, or mark something sold out. Hidden items don&apos;t show on the site.
      </p>
      <div className="mt-6 space-y-4">
        {products.map((p) => (
          <ProductEditor key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
