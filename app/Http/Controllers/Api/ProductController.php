<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /** GET /api/products */
    public function index(Request $request)
    {
        $query = Product::with(['brand', 'category'])
            ->where('is_active', true);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhereHas('brand', fn($b) => $b->where('name', 'like', "%$search%"));
            });
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($brandId = $request->query('brand_id')) {
            $query->where('brand_id', $brandId);
        }

        if ($featured = $request->query('featured')) {
            $query->where('is_featured', true);
        }

        $products = $query->orderByDesc('created_at')->get();

        return response()->json([
            'success' => true,
            'data'    => $products->map(fn($p) => $this->format($p)),
        ]);
    }

    /** GET /api/products/{id} */
    public function show($id)
    {
        $product = Product::with(['brand', 'category', 'variants', 'images', 'fragranceNotes', 'reviews.user'])
            ->where('is_active', true)
            ->findOrFail($id);

        $notes = $product->fragranceNotes->groupBy('layer');

        return response()->json([
            'success' => true,
            'data'    => array_merge($this->format($product), [
                'variants' => $product->variants,
                'images'   => $product->images->pluck('url'),
                'notes'    => [
                    'top'   => $notes->get('top', collect())->pluck('note'),
                    'heart' => $notes->get('heart', collect())->pluck('note'),
                    'base'  => $notes->get('base', collect())->pluck('note'),
                ],
                'reviews'       => $product->reviews,
                'scent_profile' => [
                    'intensity' => $product->scent_intensity,
                    'longevity' => $product->longevity,
                    'sillage'   => $product->sillage,
                ],
            ]),
        ]);
    }

    /** POST /api/products  (admin) */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:200',
            'brand'       => 'nullable|string|max:120',   // brand name string (new simple path)
            'brand_id'    => 'nullable|integer|exists:brands,id',
            'category_id' => 'nullable|integer|exists:categories,id',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'old_price'   => 'nullable|numeric|min:0',
            'rating'      => 'nullable|numeric|min:0|max:5',
            'image'       => 'nullable|string',
            'badge'       => 'nullable|string|max:50',
        ]);

        // If brand name string provided, find or create brand
        if (!empty($data['brand']) && empty($data['brand_id'])) {
            $brandModel = \App\Models\Brand::firstOrCreate(
                ['name' => $data['brand']],
                ['slug' => Str::slug($data['brand'])]
            );
            $data['brand_id'] = $brandModel->id;
        }

        $data['slug']      = Str::slug($data['name']) . '-' . uniqid();
        $data['is_active'] = true;
        unset($data['brand']);

        $product = Product::create($data);

        return response()->json(['success' => true, 'data' => $this->format($product->load('brand', 'category'))], 201);
    }

    /** PUT /api/products/{id}  (admin) */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:200',
            'brand'       => 'nullable|string|max:120',
            'brand_id'    => 'nullable|integer|exists:brands,id',
            'category_id' => 'nullable|integer|exists:categories,id',
            'description' => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'old_price'   => 'nullable|numeric|min:0',
            'rating'      => 'nullable|numeric|min:0|max:5',
            'image'       => 'nullable|string',
            'badge'       => 'nullable|string|max:50',
        ]);

        if (!empty($data['brand']) && empty($data['brand_id'])) {
            $brandModel = \App\Models\Brand::firstOrCreate(
                ['name' => $data['brand']],
                ['slug' => Str::slug($data['brand'])]
            );
            $data['brand_id'] = $brandModel->id;
        }
        unset($data['brand']);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . $product->id;
        }

        $product->update($data);

        return response()->json(['success' => true, 'data' => $this->format($product->load('brand', 'category'))]);
    }

    /** DELETE /api/products/{id}  (admin) */
    public function destroy($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    private function format(Product $p): array
    {
        return [
            'id'          => $p->id,
            'name'        => $p->name,
            'slug'        => $p->slug,
            'brand'       => $p->brand?->name ?? '',
            'brand_id'    => $p->brand_id,
            'category'    => $p->category?->name ?? '',
            'category_id' => $p->category_id,
            'description' => $p->description,
            'price'       => (float) $p->price,
            'old_price'   => $p->old_price ? (float) $p->old_price : null,
            'rating'      => $p->rating ? (float) $p->rating : null,
            'review_count'=> $p->review_count,
            'image'       => $p->image,
            'badge'       => $p->badge,
            'is_featured' => $p->is_featured,
            'created_at'  => $p->created_at,
        ];
    }
}
