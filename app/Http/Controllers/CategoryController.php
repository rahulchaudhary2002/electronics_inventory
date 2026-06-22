<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('categories', [
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
        ]);

        $category = Category::create($data);

        if ($request->wantsJson()) {
            return response()->json(['id' => $category->id, 'name' => $category->name], 201);
        }

        return redirect()->route('categories.index')->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:categories,name,' . $category->id,
            'is_active' => 'required|boolean',
        ]);

        $category->update($data);

        return redirect()->route('categories.index')->with('success', 'Category updated.');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Category deleted.');
    }
}
