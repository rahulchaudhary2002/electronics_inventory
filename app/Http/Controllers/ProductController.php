<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('products', [
            'products'   => Product::with(['brand:id,name', 'category:id,name', 'outlets:id,name,code'])
                ->orderBy('name')
                ->get(),
            'brands'     => Brand::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'categories' => Category::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'outlets'    => Outlet::orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:150',
            'model_number' => 'nullable|string|max:100',
            'type'         => 'nullable|string|max:100',
            'warranty'     => 'nullable|string|max:100',
            'brand_id'     => 'required|exists:brands,id',
            'category_id'  => 'required|exists:categories,id',
            'outlets'      => 'array',
            'outlets.*.id'          => 'required|exists:outlets,id',
            'outlets.*.initial_qty' => 'required|integer|min:0',
            'outlets.*.cost'        => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($data) {
            $product = Product::create([
                'name'         => $data['name'],
                'model_number' => $data['model_number'] ?? null,
                'type'         => $data['type'] ?? null,
                'warranty'     => $data['warranty'] ?? null,
                'brand_id'     => $data['brand_id'],
                'category_id'  => $data['category_id'],
            ]);

            foreach ($data['outlets'] ?? [] as $outlet) {
                $product->outlets()->attach($outlet['id'], [
                    'initial_qty' => $outlet['initial_qty'],
                    'cost'        => $outlet['cost'],
                ]);

                Stock::create([
                    'outlet_id'  => $outlet['id'],
                    'product_id' => $product->id,
                    'quantity'   => $outlet['initial_qty'],
                ]);
            }
        });

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:150',
            'model_number' => 'nullable|string|max:100',
            'type'         => 'nullable|string|max:100',
            'warranty'     => 'nullable|string|max:100',
            'brand_id'     => 'required|exists:brands,id',
            'category_id'  => 'required|exists:categories,id',
            'is_active'    => 'required|boolean',
            'outlets'      => 'array',
            'outlets.*.id'          => 'required|exists:outlets,id',
            'outlets.*.initial_qty' => 'required|integer|min:0',
            'outlets.*.cost'        => 'required|numeric|min:0',
        ]);

        $product->update([
            'name'         => $data['name'],
            'model_number' => $data['model_number'] ?? null,
            'type'         => $data['type'] ?? null,
            'warranty'     => $data['warranty'] ?? null,
            'brand_id'     => $data['brand_id'],
            'category_id'  => $data['category_id'],
            'is_active'    => $data['is_active'],
        ]);

        $sync = [];
        foreach ($data['outlets'] ?? [] as $outlet) {
            $sync[$outlet['id']] = [
                'initial_qty' => $outlet['initial_qty'],
                'cost'        => $outlet['cost'],
            ];
        }
        $product->outlets()->sync($sync);

        return redirect()->route('products.index')->with('success', 'Product updated.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted.');
    }
}
