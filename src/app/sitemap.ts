import { MetadataRoute } from 'next';

const BASE_URL = 'https://untyped.com.vn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/studio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    // Dynamic product pages
    let productPages: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${BASE_URL}/api/products?limit=1000`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const products = Array.isArray(data) ? data : (data.items || []);
            productPages = products.map((product: any) => ({
                url: `${BASE_URL}/products/${product.id}`,
                lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }));
        }
    } catch (error) {
        console.error('Sitemap: Failed to fetch products', error);
    }

    return [...staticPages, ...productPages];
}
