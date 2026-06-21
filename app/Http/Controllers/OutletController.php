<?php

namespace App\Http\Controllers;

use App\Models\Outlet;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class OutletController extends Controller
{
    public function index()
    {
        return Inertia::render('outlets', [
            'outlets' => Outlet::with('users:id,name,email,outlet_id')->orderBy('created_at')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:100',
            'code'          => 'required|string|max:20|unique:outlets,code',
            'address'       => 'required|string|max:200',
            'user_name'     => 'required|string|max:100',
            'user_email'    => 'required|email|max:150|unique:users,email',
            'user_password' => 'required|string|min:6',
        ]);

        $outlet = Outlet::create([
            'name'    => $data['name'],
            'code'    => strtoupper($data['code']),
            'address' => $data['address'],
        ]);

        User::create([
            'name'          => $data['user_name'],
            'email'         => $data['user_email'],
            'password'      => Hash::make($data['user_password']),
            'is_superadmin' => false,
            'outlet_id'     => $outlet->id,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('outlets.index')->with('success', 'Outlet created successfully.');
    }

    public function update(Request $request, Outlet $outlet)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:100',
            'code'    => 'required|string|max:20|unique:outlets,code,' . $outlet->id,
            'address' => 'required|string|max:200',
        ]);

        $outlet->update([
            'name'    => $data['name'],
            'code'    => strtoupper($data['code']),
            'address' => $data['address'],
        ]);

        return redirect()->route('outlets.index')->with('success', 'Outlet updated.');
    }

    public function destroy(Outlet $outlet)
    {
        $outlet->delete();
        return redirect()->route('outlets.index')->with('success', 'Outlet deleted.');
    }
}
